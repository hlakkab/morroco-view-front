import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError
} from 'axios';
import { getAccessToken, refreshToken, clearTokens } from './KeycloakService';
import { trackEvent } from './Mixpanel';

//const API_URL = "http://192.168.0.205:9090";
const baseURL = 'https://moroccoviewaws.com/api';
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
    // Image discovery is now handled asynchronously in components/slices
    // No blocking image discovery logic here
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
