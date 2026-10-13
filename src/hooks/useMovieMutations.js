import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { App as AntApp } from 'antd';
import { movieApi } from '../api/movieApi';

async function executeMovieMutation(_key, { arg }) {
  const { operation, movie } = arg;

  switch (operation) {
    case 'create':
      return movieApi.create(movie);

    case 'update':
      return movieApi.update(movie);

    case 'delete':
      return movieApi.delete(movie);

    default:
      throw new Error('Unsupported movie operation.');
  }
}

export default function useMovieMutations() {
  const { message } = AntApp.useApp();
  const { mutate } = useSWRConfig();

  const {
    trigger,
    isMutating,
  } = useSWRMutation(
    'movie-mutations',
    executeMovieMutation
  );

  const refreshMovieQueries = async () => {
    await mutate(
      (key) =>
        key === 'movies' ||
        (Array.isArray(key) && key[0] === 'movies'),
      undefined,
      { revalidate: true }
    );
  };

  const execute = async (
    operation,
    movie,
    successText
  ) => {
    try {
      const result = await trigger({
        operation,
        movie,
      });

      await refreshMovieQueries();
      message.success(successText);

      return result;
    } catch (error) {
      message.error(
        error?.userMessage ||
        error?.message ||
        'The movie operation failed.'
      );

      throw error;
    }
  };

  return {
    createMovie: (movie) =>
      execute(
        'create',
        movie,
        'Movie added successfully.'
      ),

    updateMovie: (movie) =>
      execute(
        'update',
        movie,
        'Movie updated successfully.'
      ),

    deleteMovie: (movie) =>
      execute(
        'delete',
        movie,
        'Movie deleted successfully.'
      ),

    isMutating,
  };
}
