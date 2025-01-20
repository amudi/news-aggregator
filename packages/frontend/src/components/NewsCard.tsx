'use client';

import { News } from '@/types/news';
import { format } from 'date-fns';
import Link from 'next/link';

interface NewsCardProps {
  news: News;
}

export function NewsCard({ news }: NewsCardProps) {
  return (
    <Link
      href={`/news/${news.id}`}
      className="block hover:no-underline"
      data-testid="news-card"
    >
      <article className="p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {news.title}
        </h2>

        <p className="text-gray-600 mb-4" data-testid="news-summary">
          {news.summary}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {news.topics.map((topic) => (
            <span
              key={topic.id}
              className="px-2 py-1 text-sm bg-gray-100 text-gray-700 rounded"
              data-testid="news-topic"
            >
              {topic.name}
            </span>
          ))}
        </div>

        <div className="flex justify-between text-sm text-gray-500">
          <span data-testid="news-date">
            {format(new Date(news.publishedAt), 'MMM d, yyyy')}
          </span>
          <span
            className="capitalize px-2 py-1 bg-gray-100 rounded"
            data-testid="news-state"
          >
            {news.state}
          </span>
        </div>
      </article>
    </Link>
  );
}
