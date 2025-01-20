import { renderHook, act } from '@testing-library/react';
import { useNews } from '../useNews';
import { newsApi } from '@/services/newsApi';
import { ApiError } from '@/utils/apiErrors';

// Mock the newsApi
jest.mock('@/services/newsApi', () => ({
  newsApi: {
    getNews: jest.fn(),
  },
}));

describe('useNews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockFilters = {
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'publishedAt' as const,
    order: 'desc' as const,
  };

  const mockNewsData = {
    data: [
      {
        id: '1',
        title: 'Test News',
        publishedAt: '2024-03-01T00:00:00Z',
        state: 'CA',
        summary: 'Test summary',
        articleUrl: 'https://test.com',
        createdAt: '2024-03-01T00:00:00Z',
        updatedAt: '2024-03-01T00:00:00Z',
        topics: [{ id: '1', name: 'Technology' }],
        snippet: 'Test snippet',
      },
    ],
  };

  it('should fetch news when filters are provided', async () => {
    (newsApi.getNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { result } = renderHook(() => useNews(mockFilters));

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.news).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for the fetch to complete
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.news).toEqual(mockNewsData.data);
    expect(result.current.error).toBeNull();
    expect(newsApi.getNews).toHaveBeenCalledWith(mockFilters);
  });

  it('should not fetch news when filters are null', () => {
    renderHook(() => useNews(null));
    expect(newsApi.getNews).not.toHaveBeenCalled();
  });

  it('should handle rate limit errors and retry', async () => {
    const rateLimitError = new ApiError('Rate limit exceeded', 429);
    (newsApi.getNews as jest.Mock)
      .mockRejectedValueOnce(rateLimitError)
      .mockResolvedValueOnce(mockNewsData);

    const { result } = renderHook(() => useNews(mockFilters));

    // Wait for the first failed request
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe(
      'Rate limit exceeded. Please wait before trying again.'
    );
    expect(result.current.retryIn).toBe(5);

    // Fast-forward timers to trigger retry
    await act(async () => {
      jest.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    expect(result.current.news).toEqual(mockNewsData.data);
    expect(result.current.error).toBeNull();
    expect(result.current.retryIn).toBeNull();
  });

  it('should handle pagination correctly', async () => {
    const page1Data = {
      data: [{ ...mockNewsData.data[0], id: '1' }],
    };
    const page2Data = {
      data: [{ ...mockNewsData.data[0], id: '2' }],
    };

    (newsApi.getNews as jest.Mock)
      .mockResolvedValueOnce(page1Data)
      .mockResolvedValueOnce(page2Data);

    const { result, rerender } = renderHook((filters) => useNews(filters), {
      initialProps: { ...mockFilters, page: 1 },
    });

    // Wait for first page
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.news).toEqual(page1Data.data);

    // Load second page
    rerender({ ...mockFilters, page: 2 });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.news).toEqual([...page1Data.data, ...page2Data.data]);
  });

  it('should handle generic errors', async () => {
    const genericError = new Error('Failed to fetch');
    (newsApi.getNews as jest.Mock).mockRejectedValueOnce(genericError);

    const { result } = renderHook(() => useNews(mockFilters));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.loading).toBe(false);
  });

  it('should cleanup on unmount', async () => {
    (newsApi.getNews as jest.Mock).mockResolvedValueOnce(mockNewsData);

    const { unmount } = renderHook(() => useNews(mockFilters));

    unmount();

    // Ensure no memory leaks or state updates after unmount
    await act(async () => {
      jest.advanceTimersByTime(5000);
      await Promise.resolve();
    });

    // The test will fail if there are any state updates after unmount
  });
});
