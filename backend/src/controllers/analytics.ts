import { Response } from 'express';
import prisma from '../config/db';
import { AIService } from '../services/ai';
import { GamificationService } from '../services/gamification';

export class AnalyticsController {
  public static async getSummary(req: any, res: Response) {
    try {
      const userId = req.user.id;

      // 1. Fetch user profile
      const profile = await prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!profile) {
        return res.status(404).json({ error: 'User profile not found' });
      }

      // 2. Fetch footprint history
      const footprints = await prisma.footprintRecord.findMany({
        where: { userId },
        orderBy: { recordedMonth: 'asc' },
        take: 12, // Last 12 months
      });

      // 3. Generate dynamic AI insights (with Gemini/heuristic fallback)
      const aiInsights = await AIService.generateProfileInsights(userId);

      // 4. Fetch badges
      const badges = await prisma.userBadge.findMany({
        where: { userId },
        select: { badgeName: true, earnedAt: true },
      });

      // 5. Fetch goals completion count
      const activeGoalsCount = await prisma.goal.count({
        where: { userId, isCompleted: false },
      });
      const completedGoalsCount = await prisma.goal.count({
        where: { userId, isCompleted: true },
      });

      // 6. Calculate level details
      const currentLevel = GamificationService.calculateLevel(profile.xpPoints);
      const xpForCurrentLevel = (currentLevel - 1) * 500;
      const xpProgress = profile.xpPoints - xpForCurrentLevel;
      const xpNeededForNext = 500; // 500 XP per level

      res.json({
        profile: {
          location: profile.location,
          diet: profile.diet,
          transportMode: profile.transportMode,
          sustainabilityScore: profile.sustainabilityScore,
          xpPoints: profile.xpPoints,
          streakDays: profile.streakDays,
          level: currentLevel,
          xpProgress,
          xpNeededForNext,
        },
        footprints,
        aiInsights,
        badges,
        goalsSummary: {
          active: activeGoalsCount,
          completed: completedGoalsCount,
        },
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error fetching analytics summary' });
    }
  }
}
