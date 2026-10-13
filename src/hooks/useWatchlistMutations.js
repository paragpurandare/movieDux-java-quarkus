import { useState } from 'react';
import { useSWRConfig } from 'swr';
import { App as AntApp } from 'antd';
import { watchlistApi } from '../api/watchlistApi';

export default function useWatchlistMutations() {
  const { message } = AntApp.useApp();
  const { mutate } = useSWRConfig();
  const [isMutating, setIsMutating] = useState(false);

  const toggleWatchlist = async (movieOrId) => {
    const movieId = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.movieId || movieOrId.id
        : movieOrId
    );

    setIsMutating(true);
    let wasAdded = false;

    try {
      await mutate(
        'watchlist',
        async (currentData) => {
          const currentList = currentData?.dataList || [];
          const existing = currentList.find(
            (item) => String(item.movieId ?? item.id) === movieId
          );

          if (existing) {
            // Remove from watchlist
            wasAdded = false;
            await watchlistApi.remove(movieId, existing.id);
            const filtered = currentList.filter(
              (item) => String(item.movieId ?? item.id) !== movieId
            );
            return {
              ...currentData,
              dataList: filtered,
            };
          } else {
            // Add to watchlist
            wasAdded = true;
            const res = await watchlistApi.add(movieId);
            const generatedId =
              res?.data?.[0]?.data?.id ||
              res?.dataList?.[0]?.id ||
              movieId;
            const updated = [
              ...currentList,
              { id: String(generatedId), movieId },
            ];
            return {
              ...currentData,
              dataList: updated,
            };
          }
        },
        { revalidate: true }
      );

      if (wasAdded) {
        message.success('Added to watchlist.');
      } else {
        message.info('Removed from watchlist.');
      }
    } catch (error) {
      console.error('Watchlist mutation failed:', error);
      message.error(
        error?.userMessage ||
        error?.message ||
        'The watchlist operation failed.'
      );
    } finally {
      setIsMutating(false);
    }
  };

  const addToWatchlist = async (movieOrId) => {
    const movieId = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.movieId || movieOrId.id
        : movieOrId
    );

    setIsMutating(true);
    try {
      await watchlistApi.add(movieId);
      await mutate('watchlist');
      message.success('Added to watchlist.');
    } catch (error) {
      message.error(error?.userMessage || error?.message || 'Failed to add to watchlist.');
    } finally {
      setIsMutating(false);
    }
  };

  const removeFromWatchlist = async (movieOrId, watchlistId = null) => {
    const movieId = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.movieId || movieOrId.id
        : movieOrId
    );

    setIsMutating(true);
    try {
      await watchlistApi.remove(movieId, watchlistId);
      await mutate('watchlist');
      message.info('Removed from watchlist.');
    } catch (error) {
      message.error(error?.userMessage || error?.message || 'Failed to remove from watchlist.');
    } finally {
      setIsMutating(false);
    }
  };

  return {
    toggleWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isMutating,
  };
}
