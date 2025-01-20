import { Request, Response } from 'express';
import { NewsController } from '../../controllers/newsController';
import { createMockContext, MockContext } from '../setup';
import { prisma } from '../../app';

// Mock the prisma client
jest.mock('../../app', () => ({
  prisma: jest.fn(),
}));

describe('NewsController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  let mockContext: MockContext;

  beforeEach(() => {
    mockContext = createMockContext();
    (prisma as any) = mockContext.prisma;

    mockReq = {
      body: {},
      query: {},
      params: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      getHeader: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('createNews', () => {
    it('should create news successfully', async () => {
      const newsData = {
        title: 'Test News',
        publishedAt: '2024-03-14T12:00:00Z',
        state: 'CA',
        summary: 'Test summary',
        articleUrl: 'https://example.com',
        topics: ['Technology'],
        snippet: 'Test snippet',
      };

      mockReq.body = newsData;

      const mockCreatedNews = {
        id: '123',
        ...newsData,
        publishedAt: new Date(newsData.publishedAt),
        createdAt: new Date(),
        updatedAt: new Date(),
        topics: [{ id: '1', name: 'Technology' }],
      };

      (prisma.news.create as jest.Mock).mockResolvedValue(mockCreatedNews);

      await NewsController.createNews(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCreatedNews,
      });
    });
  });

  describe('getNews', () => {
    it('should get news with pagination', async () => {
      mockReq.query = {
        page: '1',
        limit: '10',
      };

      const mockNews = [
        {
          id: '123',
          title: 'Test News',
          publishedAt: new Date(),
          state: 'CA',
          summary: 'Test summary',
          articleUrl: 'https://example.com',
          snippet: 'Test snippet',
          topics: [],
        },
      ];

      (prisma.news.findMany as jest.Mock).mockResolvedValue(mockNews);
      (prisma.news.count as jest.Mock).mockResolvedValue(1);

      await NewsController.getNews(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockNews,
        pagination: {
          page: '1',
          limit: '10',
          total: 1,
          totalPages: 1,
        },
      });
    });
  });
});
