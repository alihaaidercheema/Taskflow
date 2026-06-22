import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Rehydrate user from localStorage on page refresh
    const token = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials) => {
    const response = await authService.login(credentials);
    const { access_token } = response.data;
    localStorage.setItem("access_token", access_token);

    // Decode user info from token payload (base64)
    const payload = JSON.parse(atob(access_token.split(".")[1]));
    const userData = { email: payload.sub };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    return response;
  };

  const register = async (data) => {
    const response = await authService.register(data);
    return response;
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
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
