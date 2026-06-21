import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';

const createGoalSchema = z.object({
  title: z.string().min(3),
  category: z.string(), // "total", "transport", "energy", "food", "shopping", "waste"
  targetValue: z.number().positive(), // Target amount of CO2 to reduce (in kg)
  endDate: z.string().datetime(),
});

export class GoalController {
  public static async getGoals(req: any, res: Response) {
    try {
      const goals = await prisma.goal.findMany({
        where: { userId: req.user.id },
        orderBy: { startDate: 'desc' },
      });

      res.json(goals);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Error fetching goals' });
    }
  }

  public static async createGoal(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const data = createGoalSchema.parse(req.body);

      const newGoal = await prisma.goal.create({
        data: {
          userId,
          title: data.title,
          category: data.category,
          targetValue: data.targetValue,
          currentValue: 0,
          endDate: new Date(data.endDate),
        },
      });

      res.status(201).json(newGoal);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: err.message || 'Error creating goal' });
    }
  }
}
