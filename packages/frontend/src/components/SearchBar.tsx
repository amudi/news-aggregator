import { useState } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (search: string) => void;
}

const sanitizeSearchInput = (input: string): string => {
  // First remove script tags and their content
  const withoutScripts = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  // Then remove any remaining HTML tags
  const withoutTags = withoutScripts.replace(/<[^>]*>/g, '');
  // Finally trim whitespace
  return withoutTags.trim();
};

export function SearchBar({ onSearch }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  useDebounce(
    searchTerm,
    (value) => {
      const sanitizedValue = sanitizeSearchInput(value);
      if (sanitizedValue.length >= 3 || sanitizedValue.length === 0) {
        onSearch(sanitizedValue);
      }
    },
    300
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit input length to prevent excessive long strings
    const value = e.target.value.slice(0, 100);
    setSearchTerm(value);
  };

  return (
    <div className="relative">
      <input
        type="search"
        className="w-full px-4 py-2 pl-11 text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
        placeholder="Search news (minimum 3 characters)..."
        value={searchTerm}
        onChange={handleInputChange}
        aria-label="Search news"
        data-testid="search-input"
      />
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-slate-400" aria-hidden="true" />
      </span>
    </div>
  );
}
