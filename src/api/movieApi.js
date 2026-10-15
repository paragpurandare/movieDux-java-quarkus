import httpClient from './httpClient';
import { API_ENDPOINTS } from './endpoints';

function toMovieDto(movie, isCreate = false) {
  return {
    id: isCreate ? null : String(movie.id),
    title: movie.title || '',
    actors: movie.actors || null,
    rating:
      movie.rating != null && movie.rating !== ''
        ? Math.round(Number(movie.rating))
        : null,
    posterUrl: movie.posterUrl || null,
  };
}

export const movieApi = {
  async query(criteria = {}) {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.movies.query,
        {
          deleteFlag: false,
          data: criteria || {},
        }
      );

      // Handle 204 No Content
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
      console.error('[movieApi.query Error]:', error.userMessage || error.message);
      throw error;
    }
  },

  async updateList(request) {
    try {
      const response = await httpClient.post(
        API_ENDPOINTS.movies.base,
        request
      );

      // Check if backend returned statusFlag === false in mutation items
      if (response.data?.data && Array.isArray(response.data.data)) {
        const failedItem = response.data.data.find((item) => item.statusFlag === false);
        if (failedItem) {
          const msg = failedItem.message || 'Operation rejected by backend processor.';
          console.error('[movieApi mutation item failed]:', failedItem);
          const err = new Error(msg);
          err.userMessage = msg;
          throw err;
        }
      }

      return response.data;
    } catch (error) {
      console.error('[movieApi.updateList Error]:', error.userMessage || error.message);
      throw error;
    }
  },

  async create(movie) {
    const dto = toMovieDto(movie, true);
    return movieApi.updateList({
      deleteFlag: false,
      data: [dto],
    });
  },

  async update(movie) {
    const dto = toMovieDto(movie, false);
    return movieApi.updateList({
      deleteFlag: false,
      data: [dto],
    });
  },

  async delete(movieOrId) {
    const id = String(
      typeof movieOrId === 'object' && movieOrId !== null
        ? movieOrId.id
        : movieOrId
    );

    const dto =
      typeof movieOrId === 'object' && movieOrId !== null
        ? toMovieDto(movieOrId, false)
        : { id };

    return movieApi.updateList({
      deleteFlag: true,
      data: [dto],
    });
  },
};
