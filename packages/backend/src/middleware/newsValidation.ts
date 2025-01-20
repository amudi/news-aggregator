import { body, query, param } from 'express-validator';

export const createNewsValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('publishedAt')
    .isISO8601()
    .withMessage('Valid publication date is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('summary').trim().notEmpty().withMessage('Summary is required'),
  body('articleUrl')
    .trim()
    .isURL()
    .withMessage('Valid article URL is required'),
  body('topics').isArray().withMessage('Topics must be an array'),
  body('topics.*')
    .trim()
    .notEmpty()
    .withMessage('Each topic must be non-empty'),
];

export const getNewsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('state')
    .optional()
    .trim()
    .matches(/^[A-Z]{2}$/)
    .withMessage('Invalid state format'),
  query('topic')
    .optional()
    .trim()
    .isIn([
      'Politics',
      'Technology',
      'Sports',
      'Entertainment',
      'Business',
      'Health',
    ])
    .withMessage('Invalid topic'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search query too long')
    .matches(/^[a-zA-Z0-9\s\-_.,!?]*$/)
    .withMessage('Invalid search characters'),
  query('sortBy').optional().isIn(['publishedAt', 'createdAt']),
  query('order').optional().isIn(['asc', 'desc']),
];

export const getNewsByIdValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('News ID is required')
    .isUUID()
    .withMessage('Invalid news ID format'),
];
