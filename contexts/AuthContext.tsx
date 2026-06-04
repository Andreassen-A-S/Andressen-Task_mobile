import { createContext, useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import * as Device from "expo-device";
import { User, UserRole } from "@/types/users";
import { login as apiLogin, refreshToken as apiRefreshToken, registerPushToken } from "@/lib/api";
import { setAuthToken } from "@/helpers/helpers";
import { registerUnauthorizedHandler } from "@/lib/api/apiClient";
import { registerForPushNotifications } from "@/helpers/notifications";
import { API_URL } from "@/constants/api";

const SUPER_ADMIN_MOBILE_ERROR = "Super admin accounts can only be used in the web portal.";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  user: User | null;
  isInitializing: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const clearAuth = async () => {
    await SecureStore.deleteItemAsync("refresh_token");
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  useEffect(() => {
    // Register 401 handler — fired by apiFetch when a refresh attempt also fails
    registerUnauthorizedHandler(() => {
      clearAuth().catch(() => {});
    });

    const initializeAuth = async () => {
      try {
        const stored = await SecureStore.getItemAsync("refresh_token");
        if (!stored) return;

        const response = await apiRefreshToken(stored);

        if (response.user.role === UserRole.SUPER_ADMIN) {
          throw new Error(SUPER_ADMIN_MOBILE_ERROR);
        }

        await SecureStore.setItemAsync("refresh_token", response.refresh_token);
        setAuthToken(response.token);
        setIsAuthenticated(true);
        setUser(response.user);
        setUserRole(response.user.role);
        registerForPushNotifications().catch((err) => console.warn("Push registration failed:", err));
      } catch {
        await clearAuth();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const device_name = Device.deviceName ?? Device.modelName ?? undefined;
    const response = await apiLogin({ email, password, device_name });

    if (!response.token || !response.user) {
      throw new Error("Invalid login response");
    }

    if (response.user.role === UserRole.SUPER_ADMIN) {
      throw new Error(SUPER_ADMIN_MOBILE_ERROR);
    }

    await SecureStore.setItemAsync("refresh_token", response.refresh_token);
    setAuthToken(response.token);
    setIsAuthenticated(true);
    setUser(response.user);
    setUserRole(response.user.role);
    registerForPushNotifications().catch((err) => console.warn("Push registration failed:", err));
  };

  const logout = async () => {
    const stored = await SecureStore.getItemAsync("refresh_token");
    await registerPushToken(null).catch(() => {});
    if (stored) {
      // Best-effort server-side revocation; don't block logout on failure
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: stored }),
      }).catch(() => {});
    }
    await clearAuth();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
