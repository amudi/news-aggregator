import axios, { AxiosError } from 'axios';
import { NewsService } from '../../services/newsService';
import { prisma } from '../../app';

jest.mock('axios');
jest.mock('../../app', () => ({
  prisma: {
    news: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('NewsService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Set required environment variables
    process.env = {
      ...originalEnv,
      NEWS_API_KEY: 'test-api-key',
      NEWS_API_URL: 'https://test.api',
      NEWS_API_COUNTRY: 'us',
      NEWS_API_CATEGORIES: 'business,technology',
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    process.env = originalEnv;
  });

  describe('refreshNews', () => {
    it('should fetch and process news articles', async () => {
      const mockArticles = [
        {
          title: 'Test Article',
          publishedAt: '2024-03-14T12:00:00Z',
          description: 'Test description from California',
          url: 'https://example.com',
          content: 'Test content',
        },
      ];

      const mockResponse = {
        data: {
          status: 'ok',
          articles: mockArticles,
          totalResults: 1,
        },
        status: 200,
      };

      mockedAxios.get
        .mockResolvedValueOnce(mockResponse) // business category
        .mockResolvedValueOnce(mockResponse); // technology category

      (prisma.news.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.news.create as jest.Mock).mockResolvedValue({});

      const stats = await NewsService.refreshNews();

      expect(stats).toEqual({
        added: 2,
        errors: 0,
        total: 2,
      });
      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
      expect(prisma.news.create).toHaveBeenCalledTimes(2);
    });

    it('should handle API errors gracefully', async () => {
      const axiosError = new Error('API Error') as AxiosError;
      axiosError.isAxiosError = true;
      axiosError.response = {
        status: 500,
        data: { message: 'API Error' },
        statusText: 'Internal Server Error',
        headers: {},
        config: {} as any,
      };

      mockedAxios.get.mockRejectedValue(axiosError);

      try {
        await NewsService.refreshNews();
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(console.error).toHaveBeenCalled();
        expect(mockedAxios.get).toHaveBeenCalled();
        expect(prisma.news.create).not.toHaveBeenCalled();
      }
    });
  });
});
