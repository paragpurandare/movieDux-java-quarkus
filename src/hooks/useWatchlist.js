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
    revalidateOnFocus: true,
  });

  const watchlistEntries = useMemo(() => {
    const rawEntries =
      data?.dataList ??
      data?.data?.dataList ??
      [];

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
    source: data?.source ?? (error ? 'fallback' : 'backend'),
    isFallback: data?.source === 'fallback',
    error,
    errorMessage:
      error?.userMessage ||
      error?.message ||
      data?.fallbackError ||
      null,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    refreshWatchlist: mutate,
  };
}
