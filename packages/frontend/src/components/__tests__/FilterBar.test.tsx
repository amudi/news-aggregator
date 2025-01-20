import { render, screen, fireEvent } from '@/utils/test-utils';
import { FilterBar } from '../FilterBar';
import { preferencesManager } from '@/utils/preferences';

// Mock the preferences manager
jest.mock('@/utils/preferences', () => ({
  preferencesManager: {
    get: jest.fn(),
    save: jest.fn(),
  },
  defaultPreferences: {
    topics: [],
    states: [],
  },
}));

describe('FilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (preferencesManager.get as jest.Mock).mockReturnValue({
      topics: [],
      states: [],
    });
  });

  it('renders all filter options', () => {
    render(<FilterBar onFilterChange={() => {}} />);

    expect(screen.getByTestId('topic-filter')).toBeInTheDocument();
    expect(screen.getByTestId('state-filter')).toBeInTheDocument();
    expect(screen.getByTestId('sort-filter')).toBeInTheDocument();
    expect(screen.getByTestId('order-filter')).toBeInTheDocument();
  });

  it('calls onFilterChange with topic filter', () => {
    const onFilterChange = jest.fn();
    render(<FilterBar onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByTestId('topic-filter'), {
      target: { value: 'Technology' },
    });

    expect(onFilterChange).toHaveBeenCalledWith({ topic: 'Technology' });
  });

  it('calls onFilterChange with state filter', () => {
    const onFilterChange = jest.fn();
    render(<FilterBar onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByTestId('state-filter'), {
      target: { value: 'CA' },
    });

    expect(onFilterChange).toHaveBeenCalledWith({ state: 'CA' });
  });

  it('updates preferences when filters change', () => {
    const onFilterChange = jest.fn();
    render(<FilterBar onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByTestId('topic-filter'), {
      target: { value: 'Technology' },
    });

    expect(preferencesManager.save).toHaveBeenCalledWith({
      topics: ['Technology'],
      states: [],
    });
  });

  it('loads and applies initial preferences', () => {
    const initialPreferences = {
      topics: ['Politics'],
      states: ['NY'],
    };
    (preferencesManager.get as jest.Mock).mockReturnValue(initialPreferences);

    const onFilterChange = jest.fn();
    render(<FilterBar onFilterChange={onFilterChange} />);

    expect(onFilterChange).toHaveBeenCalledWith({
      topic: 'Politics',
      state: 'NY',
    });
  });

  it('validates topic input', () => {
    const onFilterChange = jest.fn();
    render(<FilterBar onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByTestId('topic-filter'), {
      target: { value: 'InvalidTopic' },
    });

    expect(onFilterChange).toHaveBeenCalledWith({ topic: undefined });
  });

  it('validates state input', () => {
    const onFilterChange = jest.fn();
    render(<FilterBar onFilterChange={onFilterChange} />);

    fireEvent.change(screen.getByTestId('state-filter'), {
      target: { value: 'InvalidState' },
    });

    expect(onFilterChange).toHaveBeenCalledWith({ state: undefined });
  });
});
