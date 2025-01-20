import { renderHook } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('calls callback after delay', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ value }) => useDebounce(value, callback, 500),
      { initialProps: { value: 'initial' } }
    );

    // Initial render won't trigger callback because value hasn't changed
    expect(callback).not.toHaveBeenCalled();

    // Update to new value
    rerender({ value: 'updated' });
    expect(callback).not.toHaveBeenCalled();

    jest.advanceTimersByTime(500);
    expect(callback).toHaveBeenCalledWith('updated');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not call callback if value has not changed', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ value }) => useDebounce(value, callback, 500),
      { initialProps: { value: 'test' } }
    );

    // Initial value won't trigger callback
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();

    // Rerender with same value
    rerender({ value: 'test' });
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
  });

  it('cancels previous timeout on new value', () => {
    const callback = jest.fn();
    const { rerender } = renderHook(
      ({ value }) => useDebounce(value, callback, 500),
      { initialProps: { value: 'first' } }
    );

    // Change value before first timeout completes
    jest.advanceTimersByTime(250);
    rerender({ value: 'second' });

    // Complete first timeout
    jest.advanceTimersByTime(250);
    expect(callback).not.toHaveBeenCalled();

    // Complete second timeout
    jest.advanceTimersByTime(250);
    expect(callback).toHaveBeenCalledWith('second');
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('cleans up timeout on unmount', () => {
    const callback = jest.fn();
    const { unmount } = renderHook(
      ({ value }) => useDebounce(value, callback, 500),
      { initialProps: { value: 'test' } }
    );

    unmount();
    jest.advanceTimersByTime(500);
    expect(callback).not.toHaveBeenCalled();
  });
});
