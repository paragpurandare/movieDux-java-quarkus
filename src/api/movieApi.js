import httpClient from './httpClient';
import { API_ENDPOINTS } from './endpoints';

const MOVIES_CACHE_KEY = 'moviedux_movies_cache';
const GENRES_MAP_KEY = 'moviedux_movie_genres';

function getGenreMap() {
  try {
    const raw = localStorage.getItem(GENRES_MAP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveGenreForMovie(id, genre) {
  if (!id || !genre) return;
  try {
    const map = getGenreMap();
    map[String(id)] = genre;
    localStorage.setItem(GENRES_MAP_KEY, JSON.stringify(map));
  } catch (error) {
    console.error('Failed to save movie genre metadata:', error);
  }
}

function getLocalMoviesCache() {
  try {
    const raw = localStorage.getItem(MOVIES_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function saveLocalMoviesCache(list) {
  try {
    localStorage.setItem(MOVIES_CACHE_KEY, JSON.stringify(list));
  } catch (error) {
    console.error('Failed to save local movies cache:', error);
  }
}

async function getOrInitFallbackMovies() {
  const cached = getLocalMoviesCache();
  if (cached && cached.length > 0) {
    return cached;
  }
  const fallbackResponse = await fetch('/movies.json');
  if (!fallbackResponse.ok) {
    throw new Error('Failed to load local movies.json fallback');
  }
  const fallbackData = await fallbackResponse.json();
  saveLocalMoviesCache(fallbackData);
  return fallbackData;
}

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
    const genreMap = getGenreMap();

    try {
      const response = await httpClient.post(
        API_ENDPOINTS.movies.query,
        {
          deleteFlag: false,
          data: criteria || {},
        }
      );

      const rawList =
        response.data?.dataList ??
        (Array.isArray(response.data?.data) ? response.data.data : []);

      const dataList = rawList.map((item) => ({
        ...item,
        genre: item.genre || genreMap[String(item.id)] || undefined,
      }));

      saveLocalMoviesCache(dataList);

      return {
        ...response.data,
        dataList,
        source: 'backend',
      };
    } catch (backendError) {
      console.warn(
        'Quarkus backend movie service unreachable or failed. Falling back to local cache / movies.json:',
        backendError.userMessage || backendError.message
      );

      try {
        const fallbackData = await getOrInitFallbackMovies();
        const dataList = fallbackData.map((item) => ({
          ...item,
          genre: item.genre || genreMap[String(item.id)] || undefined,
        }));

        return {
          status: '200',
          dataList,
          errors: [],
          source: 'fallback',
          fallbackError: backendError.userMessage || backendError.message,
        };
      } catch (fallbackError) {
        throw new Error(
          `Unable to load movies from backend or fallback: ${fallbackError.message}`,
          { cause: fallbackError }
        );
      }
    }
  },

  async updateList(request) {
    const response = await httpClient.post(
      API_ENDPOINTS.movies.base,
      request
    );

    return response.data;
  },

  async create(movie) {
    const dto = toMovieDto(movie, true);

    try {
      const result = await movieApi.updateList({
        deleteFlag: false,
        data: [dto],
      });

      const createdId =
        result?.data?.[0]?.data?.id ??
        result?.dataList?.[0]?.id ??
        String(Date.now());

      if (movie.genre) {
        saveGenreForMovie(createdId, movie.genre);
      }

      const current = getLocalMoviesCache() || [];
      saveLocalMoviesCache([
        ...current,
        {
          ...dto,
          id: String(createdId),
          genre: movie.genre || 'General',
        },
      ]);

      return {
        ...result,
        source: 'backend',
      };
    } catch (backendError) {
      console.warn(
        'Quarkus backend create movie failed. Saving to local fallback:',
        backendError.userMessage || backendError.message
      );

      const current = await getOrInitFallbackMovies();
      const maxId = current.reduce(
        (max, item) => Math.max(max, Number(item.id) || 0),
        0
      );
      const newId = String(maxId + 1);

      if (movie.genre) {
        saveGenreForMovie(newId, movie.genre);
      }

      const newMovie = {
        ...dto,
        id: newId,
        genre: movie.genre || 'General',
        image: movie.image || null,
      };

      saveLocalMoviesCache([...current, newMovie]);

      return {
        status: '200',
        source: 'fallback',
        data: [{ data: newMovie, statusFlag: true }],
      };
    }
  },

  async update(movie) {
    const dto = toMovieDto(movie, false);

    if (movie.genre) {
      saveGenreForMovie(dto.id, movie.genre);
    }

    try {
      const result = await movieApi.updateList({
        deleteFlag: false,
        data: [dto],
      });

      const current = getLocalMoviesCache();
      if (current) {
        const updated = current.map((item) =>
          String(item.id) === String(dto.id)
            ? { ...item, ...dto, genre: movie.genre || item.genre }
            : item
        );
        saveLocalMoviesCache(updated);
      }

      return {
        ...result,
        source: 'backend',
      };
    } catch (backendError) {
      console.warn(
        'Quarkus backend update movie failed. Updating local fallback:',
        backendError.userMessage || backendError.message
      );

      const current = await getOrInitFallbackMovies();
      const updated = current.map((item) =>
        String(item.id) === String(dto.id)
          ? { ...item, ...dto, genre: movie.genre || item.genre }
          : item
      );
      saveLocalMoviesCache(updated);

      return {
        status: '200',
        source: 'fallback',
        data: [{ data: dto, statusFlag: true }],
      };
    }
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

    try {
      const result = await movieApi.updateList({
        deleteFlag: true,
        data: [dto],
      });

      const current = getLocalMoviesCache();
      if (current) {
        saveLocalMoviesCache(
          current.filter((item) => String(item.id) !== id)
        );
      }

      return {
        ...result,
        source: 'backend',
      };
    } catch (backendError) {
      console.warn(
        'Quarkus backend delete movie failed. Removing from local fallback:',
        backendError.userMessage || backendError.message
      );

      const current = await getOrInitFallbackMovies();
      saveLocalMoviesCache(
        current.filter((item) => String(item.id) !== id)
      );

      return {
        status: '200',
        source: 'fallback',
        data: [{ data: { id }, statusFlag: true }],
      };
    }
  },
};
