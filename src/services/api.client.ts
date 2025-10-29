/**
 * API Client
 * Centralized Axios instance with interceptors for authentication and error handling
 * This can be easily adapted for React Native
 */

import { API_CONFIG, STORAGE_KEYS } from '@/config/api.config';
import { ApiError } from '@/shared/types/api.types';
import { storage } from '@/utils/storage.util';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.HEADERS,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = storage.getItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
        
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Attempt to refresh token
            const refreshToken = storage.getItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
            
            if (refreshToken) {
              const response = await axios.post(
                `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REFRESH_TOKEN}`,
                { refreshToken }
              );

              const { accessToken } = response.data;
              storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

              // Retry original request with new token
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - clear storage and redirect to login
            storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            storage.removeItem(STORAGE_KEYS.USER);
            
            // Redirect to login (in React Native, use navigation)
            window.location.href = '/auth/login';
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        const apiError: ApiError = {
          message: error.response?.data?.message || error.message || 'An error occurred',
          code: error.response?.data?.code,
          errors: error.response?.data?.errors,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // Generic request methods
  public get<T>(url: string, config = {}) {
    return this.client.get<T>(url, config);
  }

  public post<T>(url: string, data?: unknown, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  public put<T>(url: string, data?: unknown, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T>(url: string, data?: unknown, config = {}) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

/**
 * Usage Example:
 * 
 * import { apiClient } from '@/services/api.client';
 * 
 * const response = await apiClient.get<User>('/user/profile');
 * const data = response.data;
 */
