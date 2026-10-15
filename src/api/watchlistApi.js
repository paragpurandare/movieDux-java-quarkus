import httpClient from './httpClient';
import { API_ENDPOINTS } from './endpoints';

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

      if (response.status === 204 || !response.data) {
        return {
          status: '204',
          dataList: [],
          errors: [],
        };
      }

      const dataList =
        response.data?.dataList ??
        (Array.isArray(response.data?.data) ? response.data.data : []);

      return {
        ...response.data,
        dataList,
      };
    } catch (error) {
      console.error('[watchlistApi.query Error]:', error.userMessage || error.message);
      throw error;
    }
  },

  async updateList(request) {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.watchlist.base,
        request
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        const failedItem = response.data.data.find((item) => item.statusFlag === false);
        if (failedItem) {
          const msg = failedItem.message || 'Watchlist mutation rejected by backend.';
          console.error('[watchlistApi mutation item failed]:', failedItem);
          const err = new Error(msg);
          err.userMessage = msg;
          throw err;
        }
      }

      return response.data;
    } catch (error) {
      console.error('[watchlistApi.updateList Error]:', error.userMessage || error.message);
      throw error;
    }
  },

  async add(movieOrId) {
    const movieId = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.movieId || movieOrId.id
        : movieOrId
    );

    return watchlistApi.updateList({
      deleteFlag: false,
      data: [
        {
          id: null,
          movieId,
        },
      ],
    });
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

    return watchlistApi.updateList({
      deleteFlag: true,
      data: [
        {
          id: targetId,
          movieId,
        },
      ],
    });
  },
};
