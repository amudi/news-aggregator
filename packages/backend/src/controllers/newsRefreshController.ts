import { Request, Response, NextFunction } from 'express';
import { NewsService } from '../services/newsService';

export class NewsRefreshController {
  static async refreshNews(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await NewsService.refreshNews();

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
