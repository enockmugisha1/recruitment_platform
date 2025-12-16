import React, { createContext, ReactElement, useEffect, useState } from "react";
import axios from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";

interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  exp: number;
  [key: string]: any;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthContextType {
  user: User | null;
  authTokens: AuthTokens | null;
  loginUser: (email: string, password: string) => Promise<boolean>;
  registerUser: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ) => Promise<boolean>;
  logoutUser: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactElement }) {
  const [user, setUser] = useState<User | null>(null);
  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(
    JSON.parse(localStorage.getItem("authTokens") || "null")
  );
  const [loading, setLoading] = useState(true);
  // Removed useNavigate from here

  useEffect(() => {
    if (authTokens) {
      setUser(jwtDecode(authTokens.access));
    }
    setLoading(false);
  }, [authTokens]);

  useEffect(() => {
    const refreshInterval = setInterval(() => {
      if (authTokens) {
        updateToken();
      }
    }, 4 * 60 * 1000); // Refresh token every 4 minutes

    return () => clearInterval(refreshInterval);
  }, [authTokens]);

  async function loginUser(email: string, password: string): Promise<boolean> {
    try {
      setLoading(true);
      const response = await axios.post(
        "token/",
        JSON.stringify({ email, password }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;
      setAuthTokens(data);
      const decodedUser = jwtDecode<User>(data.access);
      setUser(decodedUser);
      localStorage.setItem("authTokens", JSON.stringify(data));
      toast.success("Login successful!");
      return true;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed");
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function registerUser(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ): Promise<boolean> {
    try {
      setLoading(true);
      const response = await axios.post(
        "auth/register/",
        JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Return success status - let components handle navigation
      toast.success("Registration successful!");
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.email?.[0] || 
                      err.response?.data?.password?.[0] || 
                      err.response?.data?.detail || 
                      "Registration failed";
      toast.error(errorMsg);
      return false;
    } finally {
      setLoading(false);
    }
  }

  function logoutUser() {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    toast.info("Logged out successfully");
    // Navigation should be handled by components
  }

  async function updateToken() {
    if (!authTokens?.refresh) {
      logoutUser();
      return;
    }

    try {
      const response = await axios.post(
        "token/refresh/",
        JSON.stringify({ refresh: authTokens.refresh }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;
      setAuthTokens(data);
      localStorage.setItem("authTokens", JSON.stringify(data));
    } catch (err) {
      logoutUser();
    }
  }

  const contextData: AuthContextType = {
    user,
    authTokens,
    loginUser,
    registerUser,
    logoutUser,
    loading,
    isAuthenticated: !!authTokens,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}