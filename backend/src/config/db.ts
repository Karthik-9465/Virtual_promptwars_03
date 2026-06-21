import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const verifyDbConnection = async (): Promise<void> => {
  try {
    // Run a database-agnostic query to verify connection
    await prisma.user.findFirst();
  } catch (error: any) {
    console.error('❌ Database connection failure:', error.message || error);
    throw error;
  }
};

export default prisma;

