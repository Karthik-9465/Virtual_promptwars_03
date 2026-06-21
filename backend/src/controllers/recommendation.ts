import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { RecommendationEngine } from '../services/recommendation';
import { GamificationService } from '../services/gamification';

const actionSchema = z.object({
  recommendationId: z.string(),
  status: z.enum(['completed', 'skipped']),
});

export class RecommendationController {
  public static async getRecommendations(req: any, res: Response) {
    try {
      const userId = req.user.id;
      // Re-generate/fetch active recommendations
      const recommendations = await RecommendationEngine.generateForUser(userId);
      res.json(recommendations);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error fetching recommendations' });
    }
  }

  public static async performAction(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const { recommendationId, status } = actionSchema.parse(req.body);

      // Verify recommendation belongs to the user
      const recommendation = await prisma.recommendation.findFirst({
        where: { id: recommendationId, userId },
      });

      if (!recommendation) {
        return res.status(404).json({ error: 'Recommendation not found' });
      }

      if (recommendation.status !== 'active') {
        return res.status(400).json({ error: 'Recommendation is already processed' });
      }

      // Update recommendation status
      const updatedRec = await prisma.recommendation.update({
        where: { id: recommendationId },
        data: { status, updatedAt: new Date() },
      });

      let gamificationResult = null;

      if (status === 'completed') {
        // Base XP points reward depends on recommendation difficulty:
        // low -> 100 XP, medium -> 250 XP, high -> 500 XP
        let xpReward = 100;
        if (recommendation.difficulty === 'medium') xpReward = 250;
        if (recommendation.difficulty === 'high') xpReward = 500;

        // Apply gamification reward
        gamificationResult = await GamificationService.awardXP(
          userId,
          xpReward,
          `Completed action: ${recommendation.title}`
        );

        // Update active streaks
        const streakResult = await GamificationService.updateStreak(userId);
        gamificationResult = {
          ...gamificationResult,
          ...streakResult,
        };

        // If user completed a goal that matches this action's category, update goal progress!
        // Find active goals of same category
        const activeGoals = await prisma.goal.findMany({
          where: {
            userId,
            isCompleted: false,
            category: { in: ['total', recommendation.category] },
          },
        });

        for (const goal of activeGoals) {
          // Increment goal progress. Carbon reduction completed.
          const newCurrent = goal.currentValue + recommendation.co2Reduction;
          const isGoalCompleted = newCurrent >= goal.targetValue;
          
          await prisma.goal.update({
            where: { id: goal.id },
            data: {
              currentValue: Math.round(newCurrent * 100) / 100,
              isCompleted: isGoalCompleted,
            },
          });

          // Award bonus XP if goal completed!
          if (isGoalCompleted) {
            const goalXP = await GamificationService.awardXP(
              userId,
              300,
              `Goal Achieved: ${goal.title}`
            );
            if (gamificationResult) {
              gamificationResult.xpPoints = goalXP.xpPoints;
              gamificationResult.level = goalXP.level;
              gamificationResult.newlyUnlockedBadges.push(...goalXP.newlyUnlockedBadges);
            }
          }
        }
      }

      // Generate a new replacement active recommendation if needed
      const currentActive = await prisma.recommendation.findMany({
        where: { userId, status: 'active' },
      });

      // If active suggestions fell below 3, refresh recommendation pool
      if (currentActive.length < 3) {
        await RecommendationEngine.generateForUser(userId);
      }

      res.json({
        message: `Action recorded as ${status}`,
        recommendation: updatedRec,
        gamification: gamificationResult,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: err.message || 'Error processing recommendation action' });
    }
  }
}
