# News Aggregator

An exercise in building a full-stack news aggregation application with Next.js, Express, and PostgreSQL.

Frontend is a Next.js application, and backend is an Express application.
On the backend, I used Prisma as an ORM to interact with the database.
There's a refresh-news script that can be run as one-off call, as a cron, or through `/refresh` endpoint. This will populate the database with news articles from the newsapi.org.
News are tagged with topics and state (e.g. "Politics" and "CA"). I try to find relevant state for each news by looking at the news' title and description. News with no identifiable state are tagged with "National".

## Prerequisites

- Node.js (v20 or later)
- pnpm (v8.15.4 or later)
- PostgreSQL (v15 or later)
- Docker (optional, for containerized deployment)

## Development Setup

### 1. Install Dependencies

```bash
# Install pnpm if you haven't already
corepack enable
corepack prepare pnpm@8.15.4 --activate

# Install project dependencies
pnpm install
```

### 2. Database Setup

1. Start PostgreSQL server locally or use Docker:

```bash
# Using Docker
docker run --name news-db \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=news_db \
  -p 5432:5432 \
  -d postgres:15
```

2. Create `.env` file in `packages/backend`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/news_db"

# API Configuration
PORT=3001
NODE_ENV=development

# News API
NEWS_API_KEY=your_api_key
NEWS_API_URL=https://newsapi.org/v2/top-headlines
NEWS_API_COUNTRY=us
NEWS_API_CATEGORIES=business,technology,politics,sports

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

3. Run database migrations:

```bash
cd packages/backend
pnpm prisma migrate dev
```

### 3. Frontend Environment Setup

Create `.env.local` file in `packages/frontend`:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Start Development Servers

```bash
# Start backend server (http://localhost:3001)
pnpm backend:dev

# In another terminal, start frontend server (http://localhost:3000)
pnpm frontend:dev
```

## Building for Production

To build both frontend and backend:

```bash
# Build all packages
pnpm build

# Or build individually
pnpm backend:build
pnpm frontend:build
```

## Docker Deployment

The project includes Docker configuration for easy deployment.

1. Build and start the containers:

```bash
cd packages/backend
docker-compose up --build
```

This will start:

- Backend API server on port 3001
- PostgreSQL database on port 5432

2. Access the application:

- API: http://localhost:3001
- Frontend: http://localhost:3000

### Environment Variables for Production

Create a `.env` file for production settings:

```env
# Database
DATABASE_URL=postgresql://user:password@db:5432/news_db

# API Configuration
PORT=3001
NODE_ENV=production

# News API (same as development)
NEWS_API_KEY=your_api_key
NEWS_API_URL=https://newsapi.org/v2/top-headlines
NEWS_API_COUNTRY=us
NEWS_API_CATEGORIES=business,technology,politics,sports

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Advanced

### Rate Limiting

The backend implements tiered rate limiting to prevent abuse and ensure fair usage of the API:

#### Endpoint-Specific Limits (per IP)

- **Search Endpoint** (`GET /news`)

  - 30 requests per minute
  - Used for news listing and search operations
  - Includes pagination and filtering

- **Article Details** (`GET /news/:id`)
  - 60 requests per minute
  - Used for fetching individual article details

#### Global API Limits

- 100 requests per 15 minutes per IP address
- Applies to all endpoints as a fallback protection

#### Rate Limit Headers

The API returns the following headers with each response:

- `X-RateLimit-Remaining`: Remaining requests in the current window

#### Rate Limit Response

When rate limit is exceeded, the API returns:

- Status Code: `429 Too Many Requests`
- Response Body:

```json
{
  "status": "error",
  "message": "Too many requests, please try again later."
}
```

#### Environment Configuration

Rate limits can be configured through environment variables:

```env
# Global Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

### User Preferences

The frontend implements local storage-based user preferences to enhance the user experience.
For simplicity, only one state and one topic can be selected and saved at a time.

#### Stored Preferences

- **States**: User's preferred states for news filtering
- **Topics**: User's preferred topics/categories

#### Storage Implementation

- Preferences (state and topic selections) are automatically saved to the browser's localStorage
- Storage key: `news-preferences`
- Storage format:

```json
{
  "states": ["CA"],
  "topics": ["Politics"]
}
```

#### Features

- **Persistence**: Preferences persist across browser sessions
- **Automatic Loading**: Previously selected states and topics are automatically applied on return visits
- **Graceful Degradation**: Falls back to default values if localStorage is unavailable

#### Default Behavior

- On first visit, no preferences are set
- When preferences exist, the first preferred state and topic are automatically applied to filters

## System Design Considerations

### News Aggregation

To aggregate news from multiple sources, we can use similar techniques to the ones used in the newsController.ts file, and have one implementation for each news sources.
There are a couple of considerations to make with this approach:

- News uniqueness: we can add additional fields to the News model to store the source of the news.
- Additional consideration: we can use the url of the news to check if the news is already in the database. Even if a news is re-distributed by a different source, we can consider that as a new News object since it will have a different url.
- A more advanced approach would be to identify the original source of the news, and group re-distributed news under the same original source. This would enable interesting features like showing the number of times a news has been re-distributed, and let users see how different sources frame one news to each other.
- To ensure fresh data, there are a couple of strategies:
  - We can use a scheduled job to fetch news from each source and store them in the database.
  - If the news outlet's API provides callback endpoints, we can use them to fetch news in real-time.
  - If the news outlet's API provides websocket or SSE endpoints, we can use them to maintain a real-time connection and fetch news in real-time.
  - We can configure each news source to have their own fetching config, and fallback to scheduled pull if needed (outage etc.).
- Scalability: we can use a queue (e.g. GCP pub/sub or kafka) to fetch news from each source, and store them in the database. This way, we can control the number of writes to the database if needed.

### Scalability

To handle thousands of news articles across multiple sources, multiple states, and multiple topics, we can use a combination of techniques:

On news fetching (see News Aggregation section):

- We can use a queue (e.g. GCP pub/sub or kafka) to fetch news from each source, and store them in the database. This way, we can control the number of writes to the database if needed. (see News Aggregation section)

On news storage:

- We can consider using a NoSQL database like Cassandra to store the news articles. This way, we can optimize for writes, and store the news articles in a format that is optimized for search and analytics. Looking at the current requirements, we don't necessarily need strong ACID properties, and we can trade them for scalability.
- If we want to scale different states differently (e.g. scaling some states more than others), we can use a sharding strategy to store the news articles in different databases. The trade-off is that we will have to implement a way to query news from multiple states for users who have selected multiple states.
- We can use a search engine (e.g. Elasticsearch) to index the news articles and enable advanced search capabilities.
- We can use a data warehouse (e.g. Bigquery or Snowflake) to store the news articles and enable advanced analytics capabilities.
- We can consider using classifier to classify news articles into different categories. This way, we can reduce the number of news articles we need to fetch from each source, and improve the response time of the API. We can combine news source's topic with our own topic classification to get a more accurate classification.

On news retrieval (i.e. serving news to the frontend):

- We can use a caching layer (e.g. Redis) to store the news articles in memory, and use them as a cache for the database. This way, we can reduce the number of reads from the database, and improve the response time of the API. We should optimize for new articles to be cached (e.g. TTL of 8 hours).
- We can consider user's activity (e.g. categorizing users to active / inactive) to optimize the cache for the most active users. Furthermore, we can consider pre-fetching news articles for inactive users to improve the response time of the API. This is useful for users who are active and have specific preferences, since they will be more likely to return to the app and will have a better experience.
- We can consider using a CDN to serve the static assets of the frontend.

### Search Optimization

- We can consider using a Elasticsearch to index the news articles and enable advanced search capabilities. We can create a CDC pipeline from the database to the Elasticsearch to ensure that the Elasticsearch is always up to date.
- Depending on the search criteria, full-text search might not be the best approach. We can consider using a vector search engine (e.g. OpenAI embeddings) to enable semantic search capabilities. This would enable us to search for news articles that are similar to a given news article, and to enable more advanced search features like "give me news about the latest AI advancements".
