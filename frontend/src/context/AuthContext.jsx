import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rehydrate: if token exists, fetch current user profile from /auth/me
    const token = localStorage.getItem("access_token");
    if (token) {
      api
        .get("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token expired or invalid — clean up
          localStorage.removeItem("access_token");
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { access_token } = response.data;
    localStorage.setItem("access_token", access_token);

    // Fetch full user profile from /auth/me
    const meResponse = await api.get("/auth/me");
    setUser(meResponse.data);
    return meResponse.data;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
