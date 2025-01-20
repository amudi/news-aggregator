import { Request, Response, NextFunction } from 'express';
import { prisma } from '../app';
import { NewsCreateInput, NewsQueryParams } from '../types/news';

export class NewsController {
  static async createNews(req: Request, res: Response, next: NextFunction) {
    try {
      const newsData: NewsCreateInput = req.body;

      const news = await prisma.news.create({
        data: {
          title: newsData.title,
          publishedAt: new Date(newsData.publishedAt),
          state: newsData.state,
          summary: newsData.summary,
          articleUrl: newsData.articleUrl,
          topics: {
            connectOrCreate: newsData.topics.map((topic) => ({
              where: { name: topic },
              create: { name: topic },
            })),
          },
          snippet: newsData.snippet,
        },
        include: {
          topics: true,
        },
      });

      res.status(201).json({
        status: 'success',
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNews(req: Request, res: Response, next: NextFunction) {
    try {
      // Log rate limit info
      const remainingRequests = res.getHeader('X-RateLimit-Remaining');
      if (Number(remainingRequests) < 5) {
        console.warn(`Rate limit near for IP ${req.ip} on search endpoint`);
      }

      const {
        page = 1,
        limit = 10,
        state,
        topic,
        search,
        sortBy = 'publishedAt',
        order = 'desc',
      } = req.query as NewsQueryParams;

      // Add reasonable max limit to prevent large data requests
      const normalizedLimit = Math.min(Number(limit), 100);

      const skip = (page - 1) * normalizedLimit;

      // Build where clause
      const where: any = {};
      if (state) {
        where.state = state;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { summary: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (topic) {
        where.topics = {
          some: {
            name: {
              equals: topic,
              mode: 'insensitive',
            },
          },
        };
      }

      // Execute query
      const [news, total] = await Promise.all([
        prisma.news.findMany({
          where,
          include: {
            topics: true,
          },
          skip,
          take: normalizedLimit,
          orderBy: {
            [sortBy]: order,
          },
        }),
        prisma.news.count({ where }),
      ]);

      res.status(200).json({
        status: 'success',
        data: news,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / normalizedLimit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNewsById(req: Request, res: Response, next: NextFunction) {
    try {
      // Log rate limit info
      const remainingRequests = res.getHeader('X-RateLimit-Remaining');
      if (Number(remainingRequests) < 5) {
        console.warn(`Rate limit near for IP ${req.ip} on getById endpoint`);
      }

      const { id } = req.params;

      const news = await prisma.news.findUnique({
        where: { id },
        include: {
          topics: true,
        },
      });

      if (!news) {
        return res.status(404).json({
          status: 'error',
          message: 'News not found',
        });
      }

      res.status(200).json({
        status: 'success',
        data: news,
      });
    } catch (error) {
      next(error);
    }
  }
}
