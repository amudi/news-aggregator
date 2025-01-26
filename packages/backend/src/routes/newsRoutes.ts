import { Router } from 'express';
import { NewsController } from '../controllers/newsController';
import { validateRequest } from '../middleware/validateRequest';
import {
  createNewsValidation,
  getNewsValidation,
  getNewsByIdValidation,
} from '../middleware/newsValidation';
import { newsRateLimiter } from '../middleware/rateLimiter';
import { NewsRefreshController } from '../controllers/newsRefreshController';

const router: Router = Router();

// Let's assume POST to /news is only called by authorized clients, and we don't
// need to rate limit it
router.post(
  '/',
  validateRequest(createNewsValidation),
  NewsController.createNews
);

router.get(
  '/',
  newsRateLimiter.search,
  validateRequest(getNewsValidation),
  NewsController.getNews
);

router.get(
  '/:id',
  newsRateLimiter.getById,
  validateRequest(getNewsByIdValidation),
  NewsController.getNewsById
);

router.post('/refresh', NewsRefreshController.refreshNews);

export default router;
