import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import type { ApiError } from '../types/currency';

const API_KEY = import.meta.env.VITE_CURRENCY_API_KEY;
const BASE_URL = import.meta.env.VITE_CURRENCY_API_BASE_URL;

if (!API_KEY) {
  console.error('VITE_CURRENCY_API_KEY is not defined in environment variables');
}

if (!BASE_URL) {
  console.error('VITE_CURRENCY_API_BASE_URL is not defined in environment variables');
}

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add API key to all requests
apiClient.interceptors.request.use(
  (config) => {
    if (API_KEY) {
      config.params = {
        ...config.params,
        api_key: API_KEY,
      };
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      code: error.response?.status,
    };

    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          apiError.message = 'Invalid API key. Please check your credentials.';
          break;
        case 403:
          apiError.message = 'Access forbidden. Please check your API permissions.';
          break;
        case 404:
          apiError.message = 'API endpoint not found.';
          break;
        case 429:
          apiError.message = 'Rate limit exceeded. Please try again later.';
          break;
        case 500:
          apiError.message = 'Server error. Please try again later.';
          break;
        default:
          apiError.message = data?.message || `Request failed with status ${status}`;
      }
    } else if (error.request) {
      apiError.message = 'Network error. Please check your internet connection.';
    } else {
      apiError.message = error.message || 'An unexpected error occurred';
    }

    if (import.meta.env.DEV) {
      console.error('API Error:', apiError);
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
