import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, UserRole } from "@/types/users";
import { verifyToken, login as apiLogin } from "@/lib/api";
import { setAuthToken } from "@/helpers/helpers";

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          setAuthToken(token);
          const response = await verifyToken(token);
          if (response?.user?.user_id) {
            setIsAuthenticated(true);
            setUser(response.user);
            setUserRole(response.user.role);
          } else {
            throw new Error("Invalid user data");
          }
        }
      } catch {
        await AsyncStorage.multiRemove(["authToken", "userRole"]);
        setAuthToken(null);
        setIsAuthenticated(false);
        setUser(null);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await apiLogin({ email, password });

      if (!response.token || !response.user) {
        throw new Error("Invalid login response");
      }

      await AsyncStorage.setItem("authToken", response.token);
      setAuthToken(response.token);

      setIsAuthenticated(true);
      setUser(response.user);
      setUserRole(response.user.role);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["authToken", "userRole"]);
    setAuthToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
