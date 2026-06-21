import { RecommendationEngine } from '../services/recommendation';
import prisma from '../config/db';

jest.mock('../config/db', () => ({
  __esModule: true,
  default: {
    userProfile: {
      findUnique: jest.fn(),
    },
    recommendation: {
      findMany: jest.fn(),
      createMany: jest.fn(),
    },
  },
}));

describe('RecommendationEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateForUser', () => {
    test('should generate and filter recommendations based on user profile', async () => {
      const mockProfile = {
        userId: 'user-123',
        ageGroup: 'student',
        location: 'germany',
        diet: 'vegan', // Vegan profile should NOT see vegetarian recommendations
        transportMode: 'car_petrol',
        weeklyDistanceKm: 150,
        electricityKwhM: 100,
        acHoursPerDay: 0,
        flightHoursPerYear: 5,
        shoppingFrequency: 'medium',
        wasteRecyclingRate: 0.5,
        user: {
          footprints: [
            {
              id: 'footprint-1',
              transportEmissions: 100,
              energyEmissions: 50,
              foodEmissions: 45, // Vegan food emissions
              shoppingEmissions: 50,
              wasteEmissions: 10,
              totalEmissions: 255,
            },
          ],
        },
      };

      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue(mockProfile);
      (prisma.recommendation.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.recommendation.createMany as jest.Mock).mockResolvedValue({ count: 2 });

      const recommendations = await RecommendationEngine.generateForUser('user-123');

      // Verify template filtering and prisma calls
      expect(prisma.userProfile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          user: {
            include: {
              footprints: {
                orderBy: { recordedMonth: 'desc' },
                take: 1,
              },
            },
          },
        },
      });

      // Verify that createMany was called
      expect(prisma.recommendation.createMany).toHaveBeenCalled();
      const callArgs = (prisma.recommendation.createMany as jest.Mock).mock.calls[0][0];
      
      // The user is already vegan, so food recommendations in the template (like 'Go vegetarian' or 'Meatless Mondays') must be filtered out.
      const foodTitles = callArgs.data.map((r: any) => r.title);
      expect(foodTitles).not.toContain('Adopt Meatless Mondays');
      expect(foodTitles).not.toContain('Go vegetarian 4 days a week');
    });
  });
});
