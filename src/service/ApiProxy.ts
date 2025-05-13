import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';
import { getAccessToken, refreshToken, clearTokens } from './KeycloakService';
import { trackEvent } from './Mixpanel';
import { getImagesWithDefaults } from '../utils/imageUtils';

//const API_URL = "http://192.168.0.205:9090";
const baseURL = 'https://agence.mview.ma/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const accessToken = await getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  async (response: AxiosResponse) => {
    // Handle empty images array in successful responses
    if (response.status === 200 && response.data) {

      // Handle array response
      if (Array.isArray(response.data)) {
        const processedData = await Promise.all(response.data.map(async item => {
          if (item.images && Array.isArray(item.images) && item.images.length === 0) {
            const id = item.id || 'default';
            item.images = await getImagesWithDefaults(item.images, id);
          }
          return item;
        }));
        response.data = processedData;
      }
      // Handle single object response
      else if (response.data.images && Array.isArray(response.data.images) && response.data.images.length === 0) {
        const id = response.data.id || 'default';
        response.data.images = await getImagesWithDefaults(response.data.images, id);
      }
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Track server errors (5xx)
    if (error.response?.status && error.response.status >= 500) {
      trackEvent('Server_Error', {
        status: error.response.status,
        url: originalRequest.url,
        method: originalRequest.method,
        data: error.response.data
      });
    }

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Get new token
        const newAccessToken = await refreshToken();
        // Update header
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        // Retry the request
        return api(originalRequest);
      } catch (refreshError) {
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
