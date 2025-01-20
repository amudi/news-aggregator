import dotenv from 'dotenv';
import cron from 'node-cron';
import { NewsService } from '../services/newsService';

// Load environment variables
dotenv.config();

// Function to run the refresh
async function runRefresh() {
  try {
    console.log('Starting news refresh...');
    const stats = await NewsService.refreshNews();
    console.log('News refresh completed:', stats);
  } catch (error) {
    console.error('Error during news refresh:', error);
  }
}

// Run immediately on script start
runRefresh();

// Schedule to run every hour
cron.schedule('0 * * * *', runRefresh);

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing news refresh script');
  process.exit(0);
});
