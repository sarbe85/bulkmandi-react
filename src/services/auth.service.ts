
import { API_CONFIG, STORAGE_KEYS } from '../config/api.config';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from '../shared/types/api.types';

// Helper to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

// ✅ FIXED: API request helper with proper error structure
const apiRequest = async (
  method: string,
  endpoint: string,
  body?: any
): Promise<any> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const options: RequestInit = {
    method,
    headers: {
      ...API_CONFIG.HEADERS,
    },
    signal: controller.signal,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    clearTimeout(timeoutId);

    // ✅ Parse response body for both success and error
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // ✅ Throw error with proper structure matching axios
      const error: any = new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message || `API Error: ${response.status}`
      );
      
      // ✅ Add response structure like axios
      error.response = {
        data: data,
        status: response.status,
        statusText: response.statusText,
      };
      
      throw error;
    }

    return data;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      const timeoutError: any = new Error('Request timeout. Please try again.');
      timeoutError.response = {
        data: { message: 'Request timeout. Please try again.' },
      };
      throw timeoutError;
    }

    // Re-throw if already has response property
    if (error.response) {
      throw error;
    }

    // Network error
    const networkError: any = new Error('Network error. Please check your connection.');
    networkError.response = {
      data: { message: 'Network error. Please check your connection.' },
    };
    throw networkError;
  }
};

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    return response;
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiRequest('POST', '/auth/register', {
      email: data.email,
      password: data.password,
      mobile: data.mobile,
      role: data.role,
      organizationName: data.organizationName,
    });

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
    return response;
  },

  async logout(): Promise<void> {
    try {
      const token = getAuthToken();
      if (token) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
        try {
          await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              ...API_CONFIG.HEADERS,
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },

  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        return null;
      }
    }
    return null;
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return !!token;
  },

  isOnboardingComplete(): boolean {
    const user = this.getCurrentUser();
    return user?.onboardingCompleted ?? false;
  },

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  },

  getOrganizationId(): string | null {
    const user = this.getCurrentUser();
    return user?.organizationId || null;
  },
};

export default authService;
