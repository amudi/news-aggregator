import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

// Mock PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

// Mock environment variables
process.env.NEWS_API_KEY = 'test-api-key';
process.env.NEWS_API_URL = 'https://test-api.example.com';
process.env.NEWS_API_COUNTRY = 'us';
process.env.NEWS_API_CATEGORIES = 'business,technology';

export type Context = {
  prisma: PrismaClient;
};

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
  };
};
