import { Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { CarbonCalculatorService } from '../services/calculator';
import { RecommendationEngine } from '../services/recommendation';

export const updateProfileSchema = z.object({
  ageGroup: z.string().optional(),
  location: z.string().optional(),
  diet: z.string().optional(),
  transportMode: z.string().optional(),
  weeklyDistanceKm: z.number().nonnegative().optional(),
  electricityKwhM: z.number().nonnegative().optional(),
  acHoursPerDay: z.number().nonnegative().optional(),
  flightHoursPerYear: z.number().nonnegative().optional(),
  shoppingFrequency: z.string().optional(),
  wasteRecyclingRate: z.number().min(0).max(1).optional(),
});

export class ProfileController {
  public static async getProfile(req: any, res: Response) {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json(profile);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error fetching profile' });
    }
  }

  public static async updateProfile(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const data = updateProfileSchema.parse(req.body);

      // Fetch active profile
      const currentProfile = await prisma.userProfile.findUnique({
        where: { userId },
      });

      if (!currentProfile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      // Merge new data
      const updatedData = {
        ageGroup: data.ageGroup ?? currentProfile.ageGroup,
        location: data.location ?? currentProfile.location,
        diet: data.diet ?? currentProfile.diet,
        transportMode: data.transportMode ?? currentProfile.transportMode,
        weeklyDistanceKm: data.weeklyDistanceKm ?? currentProfile.weeklyDistanceKm,
        electricityKwhM: data.electricityKwhM ?? currentProfile.electricityKwhM,
        acHoursPerDay: data.acHoursPerDay ?? currentProfile.acHoursPerDay,
        flightHoursPerYear: data.flightHoursPerYear ?? currentProfile.flightHoursPerYear,
        shoppingFrequency: data.shoppingFrequency ?? currentProfile.shoppingFrequency,
        wasteRecyclingRate: data.wasteRecyclingRate ?? currentProfile.wasteRecyclingRate,
      };

      // Recalculate footprint & score
      const calcResult = CarbonCalculatorService.calculate(updatedData);

      // Save updated profile and update/create this month's FootprintRecord
      const now = new Date();
      const recordedMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const profile = await prisma.$transaction(async (tx) => {
        const p = await tx.userProfile.update({
          where: { userId },
          data: {
            ...updatedData,
            sustainabilityScore: calcResult.sustainabilityScore,
          },
        });

        const existingRecord = await tx.footprintRecord.findFirst({
          where: {
            userId,
            recordedMonth,
          },
        });

        if (existingRecord) {
          await tx.footprintRecord.update({
            where: { id: existingRecord.id },
            data: {
              transportEmissions: calcResult.transportEmissions,
              energyEmissions: calcResult.energyEmissions,
              foodEmissions: calcResult.foodEmissions,
              shoppingEmissions: calcResult.shoppingEmissions,
              wasteEmissions: calcResult.wasteEmissions,
              totalEmissions: calcResult.totalEmissions,
            },
          });
        } else {
          await tx.footprintRecord.create({
            data: {
              userId,
              recordedMonth,
              transportEmissions: calcResult.transportEmissions,
              energyEmissions: calcResult.energyEmissions,
              foodEmissions: calcResult.foodEmissions,
              shoppingEmissions: calcResult.shoppingEmissions,
              wasteEmissions: calcResult.wasteEmissions,
              totalEmissions: calcResult.totalEmissions,
            },
          });
        }

        return p;
      });

      // Automatically regenerate/refresh active recommendations based on the new profile
      await RecommendationEngine.generateForUser(userId);

      res.json({
        message: 'Profile and carbon footprint successfully updated',
        profile,
        footprint: calcResult,
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: err.message || 'Internal server error updating profile' });
    }
  }
}
