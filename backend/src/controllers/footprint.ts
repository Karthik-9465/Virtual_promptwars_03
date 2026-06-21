import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { CarbonCalculatorService } from '../services/calculator';

const customCalcSchema = z.object({
  ageGroup: z.string(),
  location: z.string(),
  diet: z.string(),
  transportMode: z.string(),
  weeklyDistanceKm: z.number().nonnegative(),
  electricityKwhM: z.number().nonnegative(),
  acHoursPerDay: z.number().nonnegative(),
  flightHoursPerYear: z.number().nonnegative(),
  shoppingFrequency: z.string(),
  wasteRecyclingRate: z.number().min(0).max(1),
});

export class FootprintController {
  public static async getHistory(req: any, res: Response) {
    try {
      const records = await prisma.footprintRecord.findMany({
        where: { userId: req.user.id },
        orderBy: { recordedMonth: 'asc' },
      });

      res.json(records);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error fetching footprint history' });
    }
  }

  public static async calculateCustom(req: any, res: Response) {
    try {
      const data = customCalcSchema.parse(req.body);
      const calcResult = CarbonCalculatorService.calculate(data);

      res.json(calcResult);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: err.message || 'Error during custom carbon calculation' });
    }
  }
}
