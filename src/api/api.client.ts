/**
 * API Client
 * Centralized Axios instance with interceptors for authentication and error handling
 */

import { API_CONFIG, STORAGE_KEYS } from "@/config/api.config";
import { ApiError } from "@/shared/types/api.types";
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

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
    // ✅ REQUEST INTERCEPTOR - Add auth token & handle FormData
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

        console.log("🔑 API Request:", {
          url: config.url,
          method: config.method,
          hasToken: !!token,
          isFormData: config.data instanceof FormData,
        });

        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
          // console.log('✅ Authorization header added');
        } else {
          console.warn("⚠️ No token available for request to:", config.url);
        }

        // ✅ CRITICAL FIX: Detect FormData and remove Content-Type header
        // Let browser set Content-Type with boundary automatically
        if (config.data instanceof FormData) {
          console.log("🔧 FormData detected - removing Content-Type header");
          if (config.headers) {
            delete config.headers["Content-Type"];
          }
          // Don't transform FormData to JSON
          config.transformRequest = [(data) => data];
        }

        return config;
      },
      (error: AxiosError) => {
        console.error("❌ Request interceptor error:", error);
        return Promise.reject(error);
      }
    );

    // ✅ RESPONSE INTERCEPTOR - Handle errors globally
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        console.error("❌ API Error:", {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
        });

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

            if (refreshToken) {
              console.log("🔄 Attempting token refresh...");
              const response = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, { refreshToken });

              const { accessToken } = response.data;
              localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              }

              console.log("✅ Token refreshed, retrying request");
              return this.client(originalRequest);
            } else {
              console.warn("⚠️ No refresh token available");
            }
          } catch (refreshError) {
            console.error("❌ Token refresh failed:", refreshError);
            localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);

            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        const apiError: ApiError = {
          message: (error.response?.data as any)?.message || error.message || "An error occurred",
          code: (error.response?.data as any)?.code,
          errors: (error.response?.data as any)?.errors,
        };

        return Promise.reject(apiError);
      }
    );
  }

  // ✅ Generic request methods with type safety
  public get<T = any>(url: string, config = {}) {
    return this.client.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: unknown, config = {}) {
    return this.client.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: unknown, config = {}) {
    return this.client.put<T>(url, data, config);
  }

  public patch<T = any>(url: string, data?: unknown, config = {}) {
    return this.client.patch<T>(url, data, config);
  }

  public delete<T = any>(url: string, config = {}) {
    return this.client.delete<T>(url, config);
  }
}

// Export singleton instance
const apiClient = new ApiClient();
export default apiClient;
