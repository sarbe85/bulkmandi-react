/**
 * Authentication Service
 * Path: src/shared/services/auth.service.ts
 */

import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/shared/types/api.types";
import { API_CONFIG, STORAGE_KEYS } from "../../../config/api.config";

const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
};

class AuthService {
  // ✅ Login - Returns full AuthResponse
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const url = `${API_CONFIG.BASE_URL}/auth/login`;
    console.log("🔑 Logging in with:", credentials.email);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Login failed:", data);
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || `Login failed: ${response.status}`
      );
    }

    console.log("✅ Login successful:", {
      role: data.user.role,
      email: data.user.email,
    });
    const userData: User = data.user;
    // Store tokens
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));

    return data;
  }

  // ✅ Register - Returns full AuthResponse
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const url = `${API_CONFIG.BASE_URL}/auth/register`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message || `Registration failed: ${response.status}`
      );
    }

    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return data;
  }

  // ✅ IMPROVED: Comprehensive logout with full cleanup
  async logout(): Promise<void> {
    try {
      // Step 1: Notify backend
      const token = getAuthToken();
      if (token) {
        try {
          await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          console.log("✅ Backend logout successful");
        } catch (error) {
          console.warn(
            "⚠️ Backend logout failed, continuing with local cleanup:",
            error
          );
        }
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      // Step 2: Clear ALL authentication data
      console.log("🧹 Clearing all authentication data...");

      // Clear localStorage
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);

      // Clear other user-specific data
      localStorage.removeItem("theme");
      localStorage.removeItem("preferences");
      localStorage.removeItem("cart");

      // Clear sessionStorage
      sessionStorage.clear();

      // Step 3: Reset theme
      document.documentElement.classList.remove("dark");
      document.body.classList.remove("bg-slate-950", "text-white");

      // Step 4: Clear auth cookies
      this.clearAuthCookies();

      console.log("✅ All data cleared successfully");
    }
  }

  // ✅ Helper: Clear auth cookies
  private clearAuthCookies(): void {
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim();
      if (
        name.includes("auth") ||
        name.includes("token") ||
        name.includes("session")
      ) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
      }
    });
  }

  // ✅ Get current user
  getCurrentUser(): User | null {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        return JSON.parse(userData);
      } catch (error) {
        console.error("Failed to parse user:", error);
        return null;
      }
    }
    return null;
  }

  // ✅ Check if authenticated
  isAuthenticated(): boolean {
    return !!getAuthToken();
  }

  // ✅ Get user role
  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
}

export default new AuthService();
