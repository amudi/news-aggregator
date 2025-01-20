import { NewsFilters } from '@/types/news';
import {
  preferencesManager,
  UserPreferences,
  defaultPreferences,
} from '@/utils/preferences';
import { useState, useEffect } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: Partial<NewsFilters>) => void;
}

const validateFilterValue = (
  value: string,
  type: 'topic' | 'state'
): string => {
  const sanitized = value.trim();

  if (type === 'topic') {
    const validTopics = [
      'Politics',
      'Technology',
      'Sports',
      'Entertainment',
      'Business',
      'Health',
    ];
    return validTopics.includes(sanitized) ? sanitized : '';
  }

  if (type === 'state') {
    const stateRegex = /^[A-Z]{2}$/;
    return stateRegex.test(sanitized) ? sanitized : '';
  }

  return '';
};

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    const userPreferences = preferencesManager.get();
    setPreferences(userPreferences);

    const initialTopic = userPreferences.topics[0];
    const initialState = userPreferences.states[0];

    setSelectedTopic(initialTopic);
    setSelectedState(initialState);

    // Set initial filters based on preferences
    const initialFilters: Partial<NewsFilters> = {
      topic: initialTopic,
      state: initialState,
    };

    // Only trigger filter change if we have preferences
    if (Object.keys(initialFilters).length > 0) {
      onFilterChange(initialFilters);
    }
  }, []);

  const handleTopicChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const validatedTopic = validateFilterValue(value, 'topic');
    setSelectedTopic(value);

    // Update filters
    onFilterChange({ topic: validatedTopic || undefined });

    // Update preferences
    const newPreferences = {
      ...preferences,
      topics: validatedTopic ? [validatedTopic] : [], // Only store one topic at a time
    };
    setPreferences(newPreferences);
    preferencesManager.save(newPreferences);
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const validatedState = validateFilterValue(value, 'state');
    setSelectedState(value);

    // Update filters
    onFilterChange({ state: validatedState || undefined });

    // Update preferences
    const newPreferences = {
      ...preferences,
      states: validatedState ? [validatedState] : [], // Only store one state at a time
    };
    setPreferences(newPreferences);
    preferencesManager.save(newPreferences);
  };

  return (
    <div className="space-y-4" data-testid="filter-bar">
      <div className="flex flex-wrap gap-4">
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          onChange={handleTopicChange}
          value={selectedTopic}
          aria-label="Filter by topic"
          data-testid="topic-filter"
        >
          <option value="">All Topics</option>
          <option value="Politics">Politics</option>
          <option value="Technology">Technology</option>
          <option value="Sports">Sports</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Business">Business</option>
          <option value="Health">Health</option>
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          onChange={handleStateChange}
          value={selectedState}
          aria-label="Filter by state"
          data-testid="state-filter"
        >
          <option value="">All States</option>
          <option value="AL">Alabama</option>
          <option value="AK">Alaska</option>
          <option value="AZ">Arizona</option>
          <option value="AR">Arkansas</option>
          <option value="CA">California</option>
          <option value="CO">Colorado</option>
          <option value="CT">Connecticut</option>
          <option value="DE">Delaware</option>
          <option value="FL">Florida</option>
          <option value="GA">Georgia</option>
          <option value="HI">Hawaii</option>
          <option value="ID">Idaho</option>
          <option value="IL">Illinois</option>
          <option value="IN">Indiana</option>
          <option value="IA">Iowa</option>
          <option value="KS">Kansas</option>
          <option value="KY">Kentucky</option>
          <option value="LA">Louisiana</option>
          <option value="ME">Maine</option>
          <option value="MD">Maryland</option>
          <option value="MA">Massachusetts</option>
          <option value="MI">Michigan</option>
          <option value="MN">Minnesota</option>
          <option value="MS">Mississippi</option>
          <option value="MO">Missouri</option>
          <option value="MT">Montana</option>
          <option value="NE">Nebraska</option>
          <option value="NV">Nevada</option>
          <option value="NH">New Hampshire</option>
          <option value="NJ">New Jersey</option>
          <option value="NM">New Mexico</option>
          <option value="NY">New York</option>
          <option value="NC">North Carolina</option>
          <option value="ND">North Dakota</option>
          <option value="OH">Ohio</option>
          <option value="OK">Oklahoma</option>
          <option value="OR">Oregon</option>
          <option value="PA">Pennsylvania</option>
          <option value="RI">Rhode Island</option>
          <option value="SC">South Carolina</option>
          <option value="SD">South Dakota</option>
          <option value="TN">Tennessee</option>
          <option value="TX">Texas</option>
          <option value="UT">Utah</option>
          <option value="VT">Vermont</option>
          <option value="VA">Virginia</option>
          <option value="WA">Washington</option>
          <option value="WV">West Virginia</option>
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          onChange={(e) =>
            onFilterChange({
              sortBy: e.target.value as 'publishedAt' | 'createdAt',
            })
          }
          aria-label="Sort by"
          data-testid="sort-filter"
        >
          <option value="publishedAt">Sort by Publication Date</option>
          <option value="createdAt">Sort by Creation Date</option>
        </select>

        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
          onChange={(e) =>
            onFilterChange({ order: e.target.value as 'asc' | 'desc' })
          }
          aria-label="Sort order"
          data-testid="order-filter"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
