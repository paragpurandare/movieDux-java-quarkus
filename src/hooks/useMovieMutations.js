import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { App as AntApp } from 'antd';
import { movieApi } from '../api/movieApi';
import { watchlistApi } from '../api/watchlistApi';

export default function useMovieMutations() {
  const { message } = AntApp.useApp();
  const { mutate, cache } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);

  const refreshAllQueries = async () => {
    await Promise.all([
      mutate(
        (key) =>
          key === 'movies' ||
          (Array.isArray(key) && key[0] === 'movies'),
        undefined,
        { revalidate: true }
      ),
      mutate('watchlist', undefined, { revalidate: true }),
    ]);
  };

  const createMovie = async (movie) => {
    setIsMutating(true);
    try {
      const result = await movieApi.create(movie);
      await refreshAllQueries();
      message.success('Movie added successfully.');
      return result;
    } catch (error) {
      console.error('[createMovie Error]:', error);
      message.error(
        error?.userMessage ||
        error?.message ||
        'Failed to add movie.'
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  const updateMovie = async (movie) => {
    setIsMutating(true);
    try {
      const result = await movieApi.update(movie);
      await refreshAllQueries();
      message.success('Movie updated successfully.');
      return result;
    } catch (error) {
      console.error('[updateMovie Error]:', error);
      message.error(
        error?.userMessage ||
        error?.message ||
        'Failed to update movie.'
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  const deleteMovie = async (movieOrId) => {
    const movieId = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.id
        : movieOrId
    );

    setIsMutating(true);
    try {
      // 1. Check if this movie exists in the watchlist cache
      const cachedWatchlistData = cache.get('watchlist')?.data;
      const watchlistItems = cachedWatchlistData?.dataList || [];
      const watchlistEntry = watchlistItems.find(
        (item) => String(item.movieId ?? item.id) === movieId
      );

      // 2. If it is in the watchlist, delete it from the watchlist first
      // to prevent Foreign Key constraint violation in the database
      if (watchlistEntry) {
        console.log(
          `Movie ${movieId} is in watchlist (entry ${watchlistEntry.id}). Removing from watchlist first to avoid FK constraint error...`
        );
        try {
          await watchlistApi.remove(movieId, watchlistEntry.id);
        } catch (wlError) {
          console.warn('Could not pre-remove from watchlist:', wlError.message);
        }
      }

      // 3. Delete the movie from Quarkus backend
      const result = await movieApi.delete(movieOrId);

      // 4. Invalidate and revalidate all SWR caches so the UI reflects the true DB state
      await refreshAllQueries();
      message.success('Movie deleted successfully.');
      return result;
    } catch (error) {
      console.error('[deleteMovie Error]:', error);
      // Revalidate to ensure UI does not show false optimistic deletion
      await refreshAllQueries();
      message.error(
        error?.userMessage ||
        error?.message ||
        'Failed to delete movie. If it is in your watchlist, remove it first.'
      );
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  return {
    createMovie,
    updateMovie,
    deleteMovie,
    isMutating,
  };
}
