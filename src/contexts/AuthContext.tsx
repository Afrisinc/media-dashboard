import React, { createContext, useContext, useEffect, useState } from "react";

interface CustomUser {
  id: string;
  email: string;
  accountIds: string[];
}

interface AuthContextType {
  user: CustomUser | null;
  session: null;
  token: string | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored custom user and token
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const tokenExpiresAt = localStorage.getItem("token_expires_at");

    if (storedUser && storedToken) {
      try {
        // Check if token has expired
        if (tokenExpiresAt && Date.now() > parseInt(tokenExpiresAt)) {
          // Token expired, clear storage
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("token_type");
          localStorage.removeItem("token_expires_at");
        } else {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch {
        // Failed to parse stored user data
      }
    }

    // Mark as not loading after checking localStorage
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { getRuntimeConfig } = await import("@/lib/config");
      const config = getRuntimeConfig();
      const response = await fetch(`${config.serverUrl}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, fullName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: new Error(errorData.resp_msg || "Registration failed"),
        };
      }

      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error : new Error("Registration failed"),
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Call custom endpoint instead of Supabase
      const { getRuntimeConfig } = await import("@/lib/config");
      const config = getRuntimeConfig();
      const response = await fetch(`${config.serverUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { error: new Error(errorData.resp_msg || "Login failed") };
      }

      const data = await response.json();

      if (data.success && data.data?.token && data.data?.user_id) {
        // Create user object from response data
        const customUser: CustomUser = {
          id: data.data.user_id,
          email: data.data.email,
          accountIds: data.data.account_ids || [],
        };
        setUser(customUser);
        setToken(data.data.token);
        localStorage.setItem("user", JSON.stringify(customUser));
        localStorage.setItem("token", data.data.token);

        // Store token metadata
        if (data.data.token_type) {
          localStorage.setItem("token_type", data.data.token_type);
        }
        if (data.data.expires_in) {
          localStorage.setItem(
            "token_expires_at",
            String(Date.now() + data.data.expires_in * 1000),
          );
        }

        return { error: null };
      }

      return { error: new Error(data.resp_msg || "Login failed") };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Login failed"),
      };
    }
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("token_expires_at");
  };

  const resetPassword = async (email: string) => {
    try {
      const { getRuntimeConfig } = await import("@/lib/config");
      const config = getRuntimeConfig();
      const response = await fetch(`${config.serverUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: new Error(errorData.resp_msg || "Password reset failed"),
        };
      }

      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error : new Error("Password reset failed"),
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session: null,
        token,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
