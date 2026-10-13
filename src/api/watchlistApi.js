import httpClient from './httpClient';
import { API_ENDPOINTS } from './endpoints';

const STORAGE_KEY = 'moviedux_watchlist';

function getLocalWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Failed to read local watchlist:', error);
    return [];
  }
}

function saveLocalWatchlist(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Failed to save local watchlist:', error);
  }
}

export const watchlistApi = {
  async query(criteria = {}) {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.watchlist.query,
        {
          deleteFlag: false,
          data: criteria || {},
        }
      );

      const dataList =
        response.data?.dataList ??
        (Array.isArray(response.data?.data) ? response.data.data : []);

      // Keep local backup synchronized with backend
      saveLocalWatchlist(dataList);

      return {
        ...response.data,
        dataList,
        source: 'backend',
      };
    } catch (backendError) {
      console.warn(
        'Quarkus backend watchlist service unreachable or failed. Falling back to local state:',
        backendError.userMessage || backendError.message
      );

      const localList = getLocalWatchlist().map((item) => {
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

      return {
        status: '200',
        dataList: localList,
        errors: [],
        source: 'fallback',
        fallbackError: backendError.userMessage || backendError.message,
      };
    }
  },

  async updateList(request) {
    const response = await httpClient.post(
      API_ENDPOINTS.watchlist.base,
      request
    );

    return response.data;
  },

  async add(movieOrId) {
    const movieId = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.movieId || movieOrId.id
        : movieOrId
    );

    try {
      const result = await watchlistApi.updateList({
        deleteFlag: false,
        data: [
          {
            id: null,
            movieId,
          },
        ],
      });

      // Extract generated backend id if present
      const generatedId =
        result?.data?.[0]?.data?.id ||
        result?.dataList?.[0]?.id ||
        null;

      // Sync local storage
      const current = getLocalWatchlist();
      if (!current.some((item) => String(item.movieId ?? item.id ?? item) === movieId)) {
        current.push({
          id: generatedId ? String(generatedId) : movieId,
          movieId,
        });
        saveLocalWatchlist(current);
      }

      return {
        ...result,
        source: 'backend',
      };
    } catch (backendError) {
      console.warn(
        'Quarkus backend add to watchlist failed. Storing locally:',
        backendError.userMessage || backendError.message
      );

      const current = getLocalWatchlist();
      if (!current.some((item) => String(item.movieId ?? item.id ?? item) === movieId)) {
        current.push({
          id: movieId,
          movieId,
        });
        saveLocalWatchlist(current);
      }

      return {
        status: '200',
        source: 'fallback',
        data: [
          {
            data: { id: movieId, movieId },
            statusFlag: true,
          },
        ],
      };
    }
  },

  async remove(movieOrId, watchlistId = null) {
    const movieId = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.movieId || movieOrId.id
        : movieOrId
    );

    const targetId = String(
      watchlistId ||
      (typeof movieOrId === 'object' && movieOrId !== null ? movieOrId.id : null) ||
      movieId
    );

    try {
      const result = await watchlistApi.updateList({
        deleteFlag: true,
        data: [
          {
            id: targetId,
            movieId,
          },
        ],
      });

      // Sync local storage
      const current = getLocalWatchlist();
      const filtered = current.filter(
        (item) => String(item.movieId ?? item.id ?? item) !== movieId
      );
      saveLocalWatchlist(filtered);

      return {
        ...result,
        source: 'backend',
      };
    } catch (backendError) {
      console.warn(
        'Quarkus backend remove from watchlist failed. Updating locally:',
        backendError.userMessage || backendError.message
      );

      const current = getLocalWatchlist();
      const filtered = current.filter(
        (item) => String(item.movieId ?? item.id ?? item) !== movieId
      );
      saveLocalWatchlist(filtered);

      return {
        status: '200',
        source: 'fallback',
        data: [
          {
            data: { id: targetId, movieId },
            statusFlag: true,
          },
        ],
      };
    }
  },
};
