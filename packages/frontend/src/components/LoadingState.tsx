import { Newspaper } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({
  message = 'Loading your preferences...',
}: LoadingStateProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-12 text-center border border-slate-200/20">
      <div className="relative">
        <Newspaper
          className="mx-auto h-12 w-12 text-slate-400 animate-pulse"
          aria-hidden="true"
        />
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-1">
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <div
              className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
          </div>
        </div>
      </div>
      <h3 className="mt-6 text-lg font-medium text-slate-800">{message}</h3>
    </div>
  );
}
