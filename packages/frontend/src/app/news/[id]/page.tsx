import { format } from 'date-fns';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { newsApi } from '@/services/newsApi';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { id: string };
}

async function getNewsById(id: string) {
  try {
    const response = await newsApi.getNewsById(id);
    return response.data;
  } catch (error) {
    return null;
  }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const news = await getNewsById(params.id);

  if (!news) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-800/[0.1] bg-[size:16px_16px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800/50 to-transparent" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link
            href="/news"
            className="flex items-center text-slate-50 mb-6 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to News
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-50 tracking-tight">
            {news.title}
          </h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-md p-6 sm:p-8 border border-slate-200/20">
          <div className="flex flex-wrap gap-4 items-center text-sm text-slate-500 mb-6">
            <span>{format(new Date(news.publishedAt), 'MMMM d, yyyy')}</span>
            <span>•</span>
            <span className="capitalize px-2 py-1 bg-slate-100 rounded">
              {news.state}
            </span>
          </div>

          <div className="prose max-w-none">
            <p className="text-slate-700 text-lg leading-relaxed mb-8">
              {news.snippet}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {news.topics.map((topic) => (
              <span
                key={topic.id}
                className="px-3 py-1 text-sm bg-slate-100 text-slate-700 rounded-full"
              >
                {topic.name}
              </span>
            ))}
          </div>

          <a
            href={news.articleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            Read Full Article
            <ExternalLink className="w-4 h-4 ml-2" aria-hidden="true" />
          </a>
        </div>
      </div>
    </main>
  );
}
