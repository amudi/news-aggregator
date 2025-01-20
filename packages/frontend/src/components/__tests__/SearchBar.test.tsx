import { render, screen, fireEvent, waitFor } from '@/utils/test-utils';
import { SearchBar } from '../SearchBar';
import '@testing-library/jest-dom';

describe('SearchBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('renders search input with correct placeholder', () => {
    render(<SearchBar onSearch={() => {}} />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute(
      'placeholder',
      'Search news (minimum 3 characters)...'
    );
  });

  it('calls onSearch after debounce when input length >= 3', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Should not call immediately
    expect(onSearch).not.toHaveBeenCalled();

    // Advance timers by debounce delay
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
      expect(onSearch).toHaveBeenCalledTimes(1);
    });
  });

  it('does not call onSearch when input length < 3', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'te' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onSearch).not.toHaveBeenCalled();
    });
  });

  it('calls onSearch with empty string when input is cleared', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const searchInput = screen.getByTestId('search-input');

    // First type something valid
    fireEvent.change(searchInput, { target: { value: 'test' } });
    jest.advanceTimersByTime(300);

    // Then clear it
    fireEvent.change(searchInput, { target: { value: '' } });
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onSearch).toHaveBeenLastCalledWith('');
    });
  });

  it('sanitizes input by removing HTML tags', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, {
      target: { value: '<script>alert("test")</script>test' },
    });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
    });
  });

  it('limits input to 100 characters', () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const searchInput = screen.getByTestId('search-input');
    const longString = 'a'.repeat(150);

    fireEvent.change(searchInput, { target: { value: longString } });

    expect(searchInput).toHaveValue('a'.repeat(100));
  });

  it('trims whitespace from input', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: '  test  ' } });

    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test');
    });
  });

  it('handles multiple rapid input changes with debounce', async () => {
    const onSearch = jest.fn();
    render(<SearchBar onSearch={onSearch} />);

    const searchInput = screen.getByTestId('search-input');

    // Simulate rapid typing
    fireEvent.change(searchInput, { target: { value: 't' } });
    fireEvent.change(searchInput, { target: { value: 'te' } });
    fireEvent.change(searchInput, { target: { value: 'tes' } });
    fireEvent.change(searchInput, { target: { value: 'test' } });

    // Advance time by less than debounce delay
    jest.advanceTimersByTime(200);
    expect(onSearch).not.toHaveBeenCalled();

    // Advance remaining time
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledTimes(1);
      expect(onSearch).toHaveBeenCalledWith('test');
    });
  });
});
