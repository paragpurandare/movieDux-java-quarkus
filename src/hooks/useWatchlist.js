import useSWR from 'swr';
import { useMemo } from 'react';
import { watchlistApi } from '../api/watchlistApi';

export default function useWatchlist() {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR('watchlist', () => watchlistApi.query(), {
    revalidateOnFocus: false,
  });

  const watchlistEntries = useMemo(() => {
    const rawEntries =
      data?.dataList ??
      (Array.isArray(data?.data) ? data.data : []);

    return rawEntries.map((item) => {
      if (typeof item === 'object' && item !== null) {
        return {
          id: String(item.id ?? item.movieId ?? ''),
          movieId: String(item.movieId ?? item.id ?? ''),
        };
      }
      return {
        id: String(item),
        movieId: String(item),
      };
    });
  }, [data]);

  const watchlistIds = useMemo(() => {
    return watchlistEntries.map((entry) => String(entry.movieId));
  }, [watchlistEntries]);

  return {
    watchlist: watchlistIds,
    watchlistIds,
    watchlistEntries,
    rawResponse: data,
    error,
    errorMessage: error?.userMessage || error?.message || null,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    refreshWatchlist: mutate,
  };
}
