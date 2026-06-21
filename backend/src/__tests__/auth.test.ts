import request from 'supertest';
import app from '../index';
import prisma from '../config/db';

jest.mock('../config/db', () => {
  const mockDb = {
    user: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({}),
    },
    userProfile: {
      create: jest.fn().mockResolvedValue({}),
      findUnique: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({}),
    },
    footprintRecord: {
      create: jest.fn().mockResolvedValue({}),
    },
    userBadge: {
      create: jest.fn().mockResolvedValue({}),
      findMany: jest.fn().mockResolvedValue([]),
      createMany: jest.fn().mockResolvedValue({ count: 0 }),
    },
    activityLog: {
      create: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn(),
  };
  mockDb.$transaction.mockImplementation((cb) => cb(mockDb));
  return {
    __esModule: true,
    default: mockDb,
  };
});

describe('Auth Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.$transaction as jest.Mock).mockImplementation((cb) => cb(prisma));
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user and return user details with token', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
      });
      (prisma.userProfile.create as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        sustainabilityScore: 78,
      });
      (prisma.userProfile.findUnique as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        xpPoints: 0,
        sustainabilityScore: 78,
        streakDays: 0,
        lastActiveDate: new Date(),
      });
      (prisma.userProfile.update as jest.Mock).mockResolvedValue({
        userId: 'user-123',
        xpPoints: 100,
        sustainabilityScore: 78,
        streakDays: 0,
        lastActiveDate: new Date(),
      });
      (prisma.userBadge.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.userBadge.createMany as jest.Mock).mockResolvedValue({ count: 0 });
      (prisma.userBadge.create as jest.Mock).mockResolvedValue({});
      (prisma.footprintRecord.create as jest.Mock).mockResolvedValue({});
      (prisma.activityLog.create as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'John Doe',
          ageGroup: 'professional',
          location: 'india',
          diet: 'vegetarian',
          transportMode: 'car_petrol',
          weeklyDistanceKm: 100,
          electricityKwhM: 150,
          acHoursPerDay: 4,
          flightHoursPerYear: 0,
          shoppingFrequency: 'medium',
          wasteRecyclingRate: 0.5,
        });

      console.log('DEBUG RES BODY:', res.body);
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'John Doe',
      });
    });

    test('should return 400 if user email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
      });

      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'John Doe',
          ageGroup: 'professional',
          location: 'india',
          diet: 'vegetarian',
          transportMode: 'car_petrol',
          weeklyDistanceKm: 100,
          electricityKwhM: 150,
          acHoursPerDay: 4,
          flightHoursPerYear: 0,
          shoppingFrequency: 'medium',
          wasteRecyclingRate: 0.5,
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email already registered');
    });
  });
});
