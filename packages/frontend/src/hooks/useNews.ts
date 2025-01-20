import { useState, useEffect, useCallback } from 'react';
import { News, NewsFilters } from '../types/news';
import { newsApi } from '@/services/newsApi';
import { ApiError } from '@/utils/apiErrors';

const RETRY_DELAY = 5000; // 5 seconds

export function useNews(filters: NewsFilters | null) {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryIn, setRetryIn] = useState<number | null>(null);

  const fetchNews = useCallback(
    async (isRetry = false) => {
      try {
        if (!filters) {
          return;
        }

        setLoading(true);
        setError(null);
        setRetryIn(null);

        const newsResponse = await newsApi.getNews(filters);

        if (newsResponse?.data) {
          setNews((prev) =>
            filters?.page === 1
              ? newsResponse.data
              : [...prev, ...newsResponse.data]
          );
        }
      } catch (err) {
        if (ApiError.isRateLimit(err)) {
          setError('Rate limit exceeded. Please wait before trying again.');
          if (!isRetry) {
            setRetryIn(RETRY_DELAY / 1000);
            setTimeout(() => fetchNews(true), RETRY_DELAY);
          }
        } else {
          setError(err instanceof Error ? err.message : 'Failed to fetch news');
        }
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    // Don't fetch if filters is null
    if (!filters) {
      return;
    }

    let mounted = true;

    const loadNews = async () => {
      if (mounted) {
        await fetchNews();
      }
    };

    loadNews();

    return () => {
      mounted = false;
    };
  }, [fetchNews]);

  // Countdown effect
  useEffect(() => {
    if (retryIn === null) {
      return;
    }

    const interval = setInterval(() => {
      setRetryIn((current) =>
        current !== null && current > 0 ? current - 1 : null
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [retryIn]);

  return {
    news,
    loading,
    error,
    retryIn,
  };
}
