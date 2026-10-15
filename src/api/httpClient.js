import axios from 'axios';

const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

httpClient.interceptors.response.use(
  (response) => {
    // Check if Avati response returned business/validation errors with 200 status
    if (response.data && Array.isArray(response.data.errors) && response.data.errors.length > 0) {
      const errorMsg =
        response.data.errors.map((e) => e.message || e.errorMessage || e.code).join(', ');
      console.error('[Avati Backend Business Error]:', errorMsg, response.config.url);
      const customError = new Error(errorMsg);
      customError.userMessage = errorMsg;
      return Promise.reject(customError);
    }
    return response;
  },
  (error) => {
    console.error(
      `[HTTP Request Failed] ${error.config?.method?.toUpperCase()} ${error.config?.url}:`,
      error.response?.status,
      error.response?.data || error.message
    );

    if (error.response) {
      const data = error.response.data;
      const serverMessage =
        data?.message ||
        data?.error ||
        (Array.isArray(data?.errors) && data.errors[0]?.message);

      if (error.response.status === 500) {
        error.userMessage =
          serverMessage ||
          'Server error (500). If you are deleting a movie, make sure it is removed from your watchlist first.';
      } else {
        error.userMessage =
          serverMessage || `Request failed with status ${error.response.status}.`;
      }
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'The request timed out. Please check that Quarkus backend is responding.';
    } else if (error.request) {
      error.userMessage =
        'Cannot connect to Quarkus server at http://localhost:8080. Please ensure the backend is running.';
    } else {
      error.userMessage = error.message || 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default httpClient;
