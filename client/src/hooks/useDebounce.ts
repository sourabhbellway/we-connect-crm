import { useState, useEffect } from "react";

/**
 * Custom hook for debouncing values
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds
 * @returns The debounced value
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debounced search with immediate clear
 * @param initialValue - Initial search value
 * @param delay - Debounce delay in milliseconds
 * @returns Object with search value, debounced value, and setter
 */
export const useDebouncedSearch = (
  initialValue: string = "",
  delay: number = 300
) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [debouncedSearchValue, setDebouncedSearchValue] =
    useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // If search value is empty, immediately update debounced value
    if (searchValue === "") {
      setDebouncedSearchValue("");
      setIsSearching(false);
      return;
    }

    // Set searching state
    setIsSearching(true);

    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchValue);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchValue, delay]);

  const setSearch = (value: string) => {
    setSearchValue(value);
  };

  const clearSearch = () => {
    setSearchValue("");
  };

  return {
    searchValue,
    debouncedSearchValue,
    setSearch,
    clearSearch,
    isSearching,
  };
};
