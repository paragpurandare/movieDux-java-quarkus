import useSWR from 'swr';
import { useMemo } from 'react';
import { movieApi } from '../api/movieApi';

export default function useMovies(criteria = {}) {
  const serializedKey = useMemo(
    () => JSON.stringify(criteria || {}),
    [criteria]
  );

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR(
    ['movies', serializedKey],
    () => movieApi.query(criteria),
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const movies = useMemo(() => {
    const rawList =
      data?.dataList ??
      (Array.isArray(data?.data) ? data.data : []);

    return rawList.map((movie) => {
      const id = String(movie.id);
      return {
        ...movie,
        id,
        actors: movie.actors || '',
        genre: movie.genre || 'General',
        image: movie.image || (movie.posterUrl ? null : `${id}.jpg`),
        rating: movie.rating != null ? String(movie.rating) : 'N/A',
      };
    });
  }, [data]);

  return {
    movies,
    rawResponse: data,
    error,
    errorMessage: error?.userMessage || error?.message || null,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    refreshMovies: mutate,
  };
}
