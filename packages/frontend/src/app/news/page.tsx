'use client';

import { useState, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { useNews } from '@/hooks/useNews';
import { NewsFilters } from '@/types/news';
import { SearchBar } from '@/components/SearchBar';
import { NewsCard } from '@/components/NewsCard';
import { FilterBar } from '@/components/FilterBar';
import { Newspaper, AlertCircle } from 'lucide-react';
import { LoadingState } from '@/components/LoadingState';

export default function NewsPage() {
  const [isPreferencesLoaded, setIsPreferencesLoaded] = useState(false);
  const [filters, setFilters] = useState<NewsFilters>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'publishedAt',
    order: 'desc',
  });

  const { news, loading, error, retryIn } = useNews(
    isPreferencesLoaded ? filters : null
  );
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && !loading) {
        setFilters((prev) => ({
          ...prev,
          page: (prev.page || 1) + 1,
        }));
      }
    },
  });

  const handleSearch = (search: string) => {
    setFilters((prev) => ({
      ...prev,
      search,
      page: 1,
    }));
  };

  const handleFilterChange = useCallback((newFilters: Partial<NewsFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1,
    }));
    setIsPreferencesLoaded(true);
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section with Pattern */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-800/[0.1] bg-[size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/50 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-50 mb-6 tracking-tight">
              Latest News
            </h1>
            <p className="text-slate-200 text-lg sm:text-xl max-w-2xl font-light">
              Stay informed with the latest updates and breaking news from
              around the world
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search and Filters Section */}
        <div className="relative -mt-8 mb-12">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200/20">
            <div className="space-y-6">
              <div className="w-full">
                <SearchBar onSearch={handleSearch} />
              </div>
              <div className="w-full overflow-x-auto scrollbar-hide">
                <FilterBar onFilterChange={handleFilterChange} />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-4 space-y-6">
              {/* Quick Stats */}
              <div className="bg-white rounded-xl shadow-md p-6 border border-slate-200/20">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  News Overview
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Articles</span>
                    <span className="font-medium text-slate-800">
                      {news.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9">
            {/* Error Message with Retry Counter */}
            {error && (
              <div
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8"
                role="alert"
              >
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle
                      className="h-5 w-5 text-red-600"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">
                      {error}
                      {retryIn !== null && (
                        <span className="ml-2">
                          Retrying in {retryIn} second{retryIn !== 1 ? 's' : ''}
                          ...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Content Section */}
            <div className="relative pb-20">
              {!isPreferencesLoaded ? (
                <LoadingState />
              ) : news.length === 0 && !loading ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200/20">
                  <Newspaper
                    className="mx-auto h-12 w-12 text-slate-400"
                    aria-hidden="true"
                  />
                  <h3 className="mt-4 text-lg font-medium text-slate-800">
                    No articles found
                  </h3>
                  <p className="mt-2 text-slate-600">
                    Try adjusting your search filters or try again later.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {news.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl shadow-md p-6 border border-slate-200/20 transition-all duration-200 hover:shadow-lg"
                    >
                      <NewsCard news={item} />
                    </div>
                  ))}
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-800" />
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 bg-slate-800 rounded-full opacity-30" />
                    </div>
                  </div>
                </div>
              )}

              {/* Infinite Scroll Trigger */}
              <div ref={ref} className="h-24" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
