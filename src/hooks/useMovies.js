import useSWR from 'swr';
import { useMemo } from 'react';
import { movieApi } from '../api/movieApi';

const DEFAULT_GENRES = {
  '1': 'Action',
  '2': 'Drama',
  '3': 'Action',
  '4': 'Drama',
  '5': 'Drama',
  '6': 'Action',
  '7': 'Drama',
  '8': 'Action',
  '9': 'Action',
  '10': 'Action',
};

export default function useMovies(criteria = {}) {
  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    ['movies', criteria],
    ([, filters]) => movieApi.query(filters),
    {
      keepPreviousData: true,
      revalidateOnFocus: true,
    }
  );

  const movies = useMemo(() => {
    const rawList =
      data?.dataList ??
      data?.data?.dataList ??
      [];

    return rawList.map((movie) => {
      const id = String(movie.id);
      return {
        ...movie,
        id,
        genre: movie.genre || DEFAULT_GENRES[id] || 'General',
        image: movie.image || (movie.posterUrl ? null : `${id}.jpg`),
        rating: movie.rating != null ? String(movie.rating) : 'N/A',
      };
    });
  }, [data]);

  return {
    movies,
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
    refreshMovies: mutate,
  };
}
