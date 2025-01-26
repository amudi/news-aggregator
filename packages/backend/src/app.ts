import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import dotenv from 'dotenv';
import newsRouter from './routes/newsRoutes';
import { sanitizeRequest } from './middleware/sanitizer';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();

// Initialize Prisma client
export const prisma = new PrismaClient();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // CORS support
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Apply custom middleware
if (process.env.NODE_ENV === 'production') {
  app.use(rateLimiter);
}
app.use(sanitizeRequest);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes
app.use('/news', newsRouter);

// Error handling
app.use(errorHandler);

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

export const createApp = (): Express => {
  const app: Express = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Apply custom middleware
  if (process.env.NODE_ENV === 'production') {
    app.use(rateLimiter);
  }
  app.use(sanitizeRequest);

  // Routes
  app.use('/news', newsRouter);
  // ... other routes

  // Error handling
  app.use(errorHandler);

  return app;
};

// Create the app instance
const appInstance = createApp();

// Start server only if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  appInstance.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export both the createApp function and the default app instance
export default app;
