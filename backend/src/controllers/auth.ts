import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { CarbonCalculatorService } from '../services/calculator';
import { GamificationService } from '../services/gamification';

const JWT_SECRET = process.env.JWT_SECRET || 'carbon_footprint_assistant_secret_2026_xyz';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
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

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  public static async register(req: Request, res: Response) {
    try {
      const data = registerSchema.parse(req.body);

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(data.password, 10);

      // Calculate initial footprint and score
      const calcResult = CarbonCalculatorService.calculate({
        ageGroup: data.ageGroup,
        location: data.location,
        diet: data.diet,
        transportMode: data.transportMode,
        weeklyDistanceKm: data.weeklyDistanceKm,
        electricityKwhM: data.electricityKwhM,
        acHoursPerDay: data.acHoursPerDay,
        flightHoursPerYear: data.flightHoursPerYear,
        shoppingFrequency: data.shoppingFrequency,
        wasteRecyclingRate: data.wasteRecyclingRate,
      });

      // Create User, Profile, and Initial Footprint in a Transaction
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            email: data.email,
            passwordHash,
            name: data.name,
          },
        });

        const profile = await tx.userProfile.create({
          data: {
            userId: user.id,
            ageGroup: data.ageGroup,
            location: data.location,
            diet: data.diet,
            transportMode: data.transportMode,
            weeklyDistanceKm: data.weeklyDistanceKm,
            electricityKwhM: data.electricityKwhM,
            acHoursPerDay: data.acHoursPerDay,
            flightHoursPerYear: data.flightHoursPerYear,
            shoppingFrequency: data.shoppingFrequency,
            wasteRecyclingRate: data.wasteRecyclingRate,
            sustainabilityScore: calcResult.sustainabilityScore,
            xpPoints: 0,
            streakDays: 0,
          },
        });

        // Initialize historical footprint record for the current month
        const now = new Date();
        const recordedMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        await tx.footprintRecord.create({
          data: {
            userId: user.id,
            recordedMonth,
            transportEmissions: calcResult.transportEmissions,
            energyEmissions: calcResult.energyEmissions,
            foodEmissions: calcResult.foodEmissions,
            shoppingEmissions: calcResult.shoppingEmissions,
            wasteEmissions: calcResult.wasteEmissions,
            totalEmissions: calcResult.totalEmissions,
          },
        });

        // Award initial onboarding badge
        await tx.userBadge.create({
          data: {
            userId: user.id,
            badgeName: 'Eco Beginner',
          },
        });

        return { user, profile };
      });

      // Award initial XP for profile completion
      await GamificationService.awardXP(result.user.id, 100, 'Profile Onboarding Setup');

      const token = jwt.sign(
        { id: result.user.id, email: result.user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: err.message || 'Internal server error during registration' });
    }
  }

  public static async login(req: Request, res: Response) {
    try {
      const data = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({
        where: { email: data.email },
        include: { profile: true },
      });

      if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Update active streak upon login
      await GamificationService.updateStreak(user.id);

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ error: 'Validation failed', details: err.errors });
      }
      res.status(500).json({ error: err.message || 'Internal server error during login' });
    }
  }

  public static async me(req: any, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          email: true,
          name: true,
          profile: true,
          badges: { select: { badgeName: true, earnedAt: true } },
        },
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Internal server error fetching user' });
    }
  }
}
