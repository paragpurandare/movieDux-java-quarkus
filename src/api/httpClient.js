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
  (response) => response,
  (error) => {
    if (error.response) {
      const data = error.response.data;

      error.userMessage =
        data?.message ||
        data?.error ||
        `Request failed with status ${error.response.status}.`;
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'The request timed out. Please try again.';
    } else if (error.request) {
      error.userMessage =
        'Cannot connect to the server. Check that the backend is running.';
    } else {
      error.userMessage = error.message || 'An unexpected error occurred.';
    }

    return Promise.reject(error);
  }
);

export default httpClient;
