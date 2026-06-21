import { z } from 'zod';
import dotenv from 'dotenv';

// Ensure dotenv is loaded
dotenv.config();

const envSchema = z.object({
  PORT: z.preprocess(
    (val) => (val ? Number(val) : undefined),
    z.number().int().positive().default(5000)
  ),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string({
    required_error: 'DATABASE_URL environment variable is required',
  }).refine(
    (val) => /^mongodb(\+srv)?:\/\//.test(val),
    { message: "DATABASE_URL must start with 'mongodb://' or 'mongodb+srv://'" }
  ),
  JWT_SECRET: z.string({
    required_error: 'JWT_SECRET environment variable is required',
  }).min(8, 'JWT_SECRET must be at least 8 characters long'),
  GEMINI_API_KEY: z.string().optional(),
});

export const validateEnv = () => {
  // During testing, if DATABASE_URL or JWT_SECRET are missing, provide dummy values to prevent test boot failure
  if (process.env.NODE_ENV === 'test') {
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'mongodb://localhost:27017/carbon_test';
    }
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'mock_jwt_secret_value_long_enough';
    }
  }

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment validation failed:');
    const formatted = result.error.format();
    for (const [key, value] of Object.entries(formatted)) {
      if (key !== '_errors') {
        const errors = (value as any)._errors?.join(', ');
        console.error(`  - ${key}: ${errors}`);
      }
    }
    throw new Error('Environment validation failed');
  }
  return result.data;
};
