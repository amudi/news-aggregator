import { Request, Response } from 'express';
import { NewsRefreshController } from '../../controllers/newsRefreshController';
import { NewsService } from '../../services/newsService';

// Mock NewsService
jest.mock('../../services/newsService', () => ({
  NewsService: {
    refreshNews: jest.fn(),
  },
}));

describe('NewsRefreshController', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refreshNews', () => {
    it('should successfully refresh news and return stats', async () => {
      const mockStats = {
        added: 10,
        errors: 0,
        total: 10,
      };

      (NewsService.refreshNews as jest.Mock).mockResolvedValue(mockStats);

      await NewsRefreshController.refreshNews(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(NewsService.refreshNews).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockStats,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should handle errors and pass them to next middleware', async () => {
      const mockError = new Error('Failed to refresh news');
      (NewsService.refreshNews as jest.Mock).mockRejectedValue(mockError);

      await NewsRefreshController.refreshNews(
        mockReq as Request,
        mockRes as Response,
        mockNext
      );

      expect(NewsService.refreshNews).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });
});
