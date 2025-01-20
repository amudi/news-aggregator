import '@testing-library/jest-dom';
import { render, screen } from '@/utils/test-utils';
import { NewsCard } from '../NewsCard';
import { format } from 'date-fns';

const mockNews = {
  id: '1',
  title: 'Test News Title',
  summary: 'Test news summary',
  publishedAt: '2024-02-28T12:00:00Z',
  state: 'CA',
  topics: [
    { id: '1', name: 'Technology' },
    { id: '2', name: 'Politics' },
  ],
  articleUrl: 'https://example.com',
  createdAt: '2024-02-28T12:00:00Z',
  updatedAt: '2024-02-28T12:00:00Z',
  snippet: 'Test snippet',
};

describe('NewsCard', () => {
  it('renders news card with correct information', () => {
    render(<NewsCard news={mockNews} />);

    expect(screen.getByText(mockNews.title)).toBeInTheDocument();
    expect(screen.getByText(mockNews.summary)).toBeInTheDocument();
    expect(screen.getByText(mockNews.state)).toBeInTheDocument();
    expect(screen.getByText('Technology')).toBeInTheDocument();
    expect(screen.getByText('Politics')).toBeInTheDocument();
    expect(
      screen.getByText(format(new Date(mockNews.publishedAt), 'MMM d, yyyy'))
    ).toBeInTheDocument();
  });

  it('links to the news detail page', () => {
    render(<NewsCard news={mockNews} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', `/news/${mockNews.id}`);
  });
});
