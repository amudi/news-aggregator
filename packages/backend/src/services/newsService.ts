import axios from 'axios';
import { prisma } from '../app';
import { NewsCreateInput } from '../types/news';

interface NewsAPIArticle {
  title: string;
  publishedAt: string;
  description: string;
  url: string;
  content: string;
}

interface NewsAPIResponse {
  status: string;
  articles: NewsAPIArticle[];
  totalResults: number;
}

export class NewsService {
  private static readonly PAGE_SIZE = 100;
  private static readonly MAX_ARTICLES = 1000;

  private static readonly US_STATES = [
    // States with full names and abbreviations
    'Alabama',
    'AL',
    'Alaska',
    'AK',
    'Arizona',
    'AZ',
    'Arkansas',
    'AR',
    'California',
    'CA',
    'Colorado',
    'CO',
    'Connecticut',
    'CT',
    'Delaware',
    'DE',
    'Florida',
    'FL',
    'Georgia',
    'GA',
    'Hawaii',
    'HI',
    'Idaho',
    'ID',
    'Illinois',
    'IL',
    'Indiana',
    'IN',
    'Iowa',
    'IA',
    'Kansas',
    'KS',
    'Kentucky',
    'KY',
    'Louisiana',
    'LA',
    'Maine',
    'ME',
    'Maryland',
    'MD',
    'Massachusetts',
    'MA',
    'Michigan',
    'MI',
    'Minnesota',
    'MN',
    'Mississippi',
    'MS',
    'Missouri',
    'MO',
    'Montana',
    'MT',
    'Nebraska',
    'NE',
    'Nevada',
    'NV',
    'New Hampshire',
    'NH',
    'New Jersey',
    'NJ',
    'New Mexico',
    'NM',
    'New York',
    'NY',
    'North Carolina',
    'NC',
    'North Dakota',
    'ND',
    'Ohio',
    'OH',
    'Oklahoma',
    'OK',
    'Oregon',
    'OR',
    'Pennsylvania',
    'PA',
    'Rhode Island',
    'RI',
    'South Carolina',
    'SC',
    'South Dakota',
    'SD',
    'Tennessee',
    'TN',
    'Texas',
    'TX',
    'Utah',
    'UT',
    'Vermont',
    'VT',
    'Virginia',
    'VA',
    'Washington',
    'WA',
    'West Virginia',
    'WV',
    'Wisconsin',
    'WI',
    'Wyoming',
    'WY',
    // Additional territories
    'District of Columbia',
    'DC',
    'Puerto Rico',
    'PR',
  ];

  private static async fetchNewsFromAPI(
    category: string,
    page: number = 1
  ): Promise<NewsAPIResponse> {
    const apiKey = process.env.NEWS_API_KEY;
    const apiUrl = process.env.NEWS_API_URL;

    if (!apiKey || !apiUrl) {
      throw new Error('NEWS_API_KEY or NEWS_API_URL not configured');
    }

    const country = process.env.NEWS_API_COUNTRY;
    const response = await axios.get<NewsAPIResponse>(
      `${apiUrl}?country=${country}&category=${category}&pageSize=${this.PAGE_SIZE}&page=${page}`,
      {
        headers: {
          'X-Api-Key': apiKey,
        },
      }
    );

    return {
      status: response.status.toString(),
      articles: response.data.articles,
      totalResults: response.data.totalResults,
    };
  }

  private static extractStateFromText(text: string): string | null {
    const upperText = text.toUpperCase();

    // First try to match full state names
    for (let i = 0; i < this.US_STATES.length; i += 2) {
      if (text.includes(this.US_STATES[i])) {
        return this.US_STATES[i + 1]; // Return the abbreviated state name
      }
    }

    // Then try to match state abbreviations
    for (let i = 1; i < this.US_STATES.length; i += 2) {
      const abbr = this.US_STATES[i];
      const regex = new RegExp(`\\b${abbr}\\b`, 'i');
      if (regex.test(upperText)) {
        return this.US_STATES[i]; // Return the abbreviated state name
      }
    }

    return null;
  }

  private static extractStateFromArticle(article: NewsAPIArticle): string {
    // Check title first as it's most likely to contain relevant location
    const titleState = this.extractStateFromText(article.title);
    if (titleState) {
      return titleState;
    }

    // Check description next
    if (article.description) {
      const descriptionState = this.extractStateFromText(article.description);
      if (descriptionState) {
        return descriptionState;
      }
    }

    // Finally check content
    if (article.content) {
      const contentState = this.extractStateFromText(article.content);
      if (contentState) {
        return contentState;
      }
    }

    return 'National';
  }

  private static async processArticle(
    article: NewsAPIArticle,
    category: string
  ): Promise<NewsCreateInput> {
    return {
      title: article.title,
      publishedAt: new Date(article.publishedAt),
      state: this.extractStateFromArticle(article),
      summary: article.description || '',
      articleUrl: article.url,
      topics: [category],
      snippet: article.content || '',
    };
  }

  static async refreshNews(): Promise<{
    added: number;
    errors: number;
    total: number;
  }> {
    const stats = { added: 0, errors: 0, total: 0 };
    let totalArticlesFetched = 0;

    try {
      const categories = process.env.NEWS_API_CATEGORIES?.split(',').map((c) =>
        c.trim()
      );
      if (!categories) {
        throw new Error('NEWS_API_CATEGORIES not configured');
      }

      for (const category of categories) {
        console.log(`Fetching news for category: ${category}`);
        let currentPage = 1;
        // First request to get total results
        const initialResponse = await this.fetchNewsFromAPI(category, 1);
        const totalResults = Math.min(
          initialResponse.totalResults,
          this.MAX_ARTICLES
        );
        const totalPages = Math.ceil(totalResults / this.PAGE_SIZE);

        // Process first page results
        await this.processArticles(initialResponse.articles, category, stats);
        totalArticlesFetched += initialResponse.articles.length;

        // Fetch remaining pages
        while (
          currentPage < totalPages &&
          totalArticlesFetched < this.MAX_ARTICLES
        ) {
          currentPage++;

          try {
            console.log(`Fetching page ${currentPage}/${totalPages}...`);
            const response = await this.fetchNewsFromAPI(category, currentPage);
            await this.processArticles(response.articles, category, stats);
            totalArticlesFetched += response.articles.length;

            // Add a small delay to avoid rate limiting
            await new Promise((resolve) => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`Error fetching page ${currentPage}:`, error);
            stats.errors++;
            break;
          }
          console.log(`Fetched ${totalArticlesFetched} articles`);
        }
      }

      stats.total = totalArticlesFetched;
      console.log(`Fetched ${totalArticlesFetched} articles`);
    } catch (error) {
      console.error('Error in refresh process:', error);
      throw error;
    }

    return stats;
  }

  private static async processArticles(
    articles: NewsAPIArticle[],
    category: string,
    stats: { added: number; errors: number }
  ): Promise<void> {
    for (const article of articles) {
      try {
        const newsInput = await this.processArticle(article, category);

        // Check if article already exists to avoid duplicates
        const existing = await prisma.news.findFirst({
          where: {
            articleUrl: newsInput.articleUrl,
          },
        });

        if (!existing) {
          await prisma.news.create({
            data: {
              ...newsInput,
              topics: {
                connectOrCreate: newsInput.topics.map((topic) => ({
                  where: { name: topic },
                  create: { name: topic },
                })),
              },
            },
          });
          stats.added++;
        }
      } catch (error) {
        console.error('Error processing article:', error);
        stats.errors++;
      }
    }
  }
}
