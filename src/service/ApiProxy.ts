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
//const baseURL = 'http://192.168.1.2:9090';

// Global auth state handler - will be set by App.tsx
let globalAuthStateHandler: (() => void) | null = null;

export const setGlobalAuthStateHandler = (handler: () => void) => {
  globalAuthStateHandler = handler;
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
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

      // Handle paginated response (Spring Boot pagination format)
      if (response.data.content && Array.isArray(response.data.content)) {
        const processedContent = await Promise.all(response.data.content.map(async (item: any) => {
          if (!item.images || (Array.isArray(item.images) && item.images.length === 0)) {
            const id = item.code || item.id || 'default';
            item.images = await getImagesWithDefaults(item.images || [], id);
          }
          return item;
        }));
        response.data.content = processedContent;
      }
      // Handle direct array response
      else if (Array.isArray(response.data)) {
        const processedData = await Promise.all(response.data.map(async (item: any) => {
          if (!item.images || (Array.isArray(item.images) && item.images.length === 0)) {
            const id = item.code || item.id || 'default';
            item.images = await getImagesWithDefaults(item.images || [], id);
          }
          return item;
        }));
        response.data = processedData;
      }
      // Handle single object response
      else if (!response.data.images || (Array.isArray(response.data.images) && response.data.images.length === 0)) {
        const id = response.data.code || response.data.id || 'default';
        response.data.images = await getImagesWithDefaults(response.data.images || [], id);
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
        console.log('🔄 Token expired, attempting refresh...');
        // Try to get new token
        const newAccessToken = await refreshToken();
        
        if (newAccessToken) {
          console.log('✅ Token refreshed successfully');
          // Update header
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          // Retry the request
          return api(originalRequest);
        } else {
          throw new Error('Token refresh returned null');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        // Clear tokens
        await clearTokens();
        
        // Notify global auth state handler to update UI
        if (globalAuthStateHandler) {
          console.log('📢 Notifying auth state handler');
          globalAuthStateHandler();
        }
        
        // Return a more descriptive error
        return Promise.reject({
          ...error,
          message: 'Session expired. Please log in again.',
          isAuthError: true
        });
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
