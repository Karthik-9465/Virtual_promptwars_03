import { GamificationService } from '../services/gamification';
import prisma from '../config/db';

jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    activityLog: {
      create: jest.fn(),
    },
    userProfile: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userBadge: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
    },
  },
}));

describe('GamificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateLevel', () => {
    test('should return level 1 for 0 XP', () => {
      expect(GamificationService.calculateLevel(0)).toBe(1);
    });

    test('should return level 1 for 499 XP', () => {
      expect(GamificationService.calculateLevel(499)).toBe(1);
    });

    test('should return level 2 for 500 XP', () => {
      expect(GamificationService.calculateLevel(500)).toBe(2);
    });

    test('should return level 3 for 1000 XP', () => {
      expect(GamificationService.calculateLevel(1000)).toBe(3);
    });
  });

  describe('awardXP', () => {
    test('should award XP and return correct level and new badges', async () => {
      const mockProfile = {
        userId: 'user-1',
        xpPoints: 100,
        sustainabilityScore: 85,
        streakDays: 2,
        lastActiveDate: new Date(),
      };

      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.userBadge.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.userProfile.update as jest.Mock).mockResolvedValue({
        ...mockProfile,
        xpPoints: 1100, // 100 + 1000 XP
      });

      const result = await GamificationService.awardXP('user-1', 1000, 'Test Action');

      expect(prisma.activityLog.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          actionName: 'Test Action',
          xpEarned: 1000,
        },
      });

      expect(prisma.userBadge.createMany).toHaveBeenCalledWith({
        data: [
          { userId: 'user-1', badgeName: 'Eco Beginner' },
          { userId: 'user-1', badgeName: 'Green Champion' },
          { userId: 'user-1', badgeName: 'Sustainability Sage' },
        ],
      });

      expect(result.xpPoints).toBe(1100);
      expect(result.level).toBe(3); // 1 + floor(1100/500) = 3
      expect(result.newlyUnlockedBadges).toContain('Eco Beginner');
      expect(result.newlyUnlockedBadges).toContain('Green Champion');
      expect(result.newlyUnlockedBadges).toContain('Sustainability Sage');
    });
  });
});
