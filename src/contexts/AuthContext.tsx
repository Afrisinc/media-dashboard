import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  loginService,
  registerService,
  resetPasswordService,
  AuthResponse,
} from "@/services/auth";

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
  handleSSO: (token: string) => void;
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
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    const tokenExpiresAt = localStorage.getItem("token_expires_at");

    if (storedUser && storedToken) {
      try {
        if (tokenExpiresAt && Date.now() > Number.parseInt(tokenExpiresAt)) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          localStorage.removeItem("token_type");
          localStorage.removeItem("token_expires_at");
        } else {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
        }
      } catch {
        setUser(null);
        setToken(null);
      }
    }

    setLoading(false);
  }, []);

  const handleSSO = (ssoToken: string) => {
    localStorage.setItem("token", ssoToken);
    localStorage.setItem("token_type", "Bearer");
    setToken(ssoToken);

    const now = new Date();
    const expiresAt = now.getTime() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem("token_expires_at", String(expiresAt));
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      await registerService({ email, password, fullName });
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
      const response = (await loginService(email, password)) as AuthResponse;

      if (response.success && response.data?.token && response.data?.user_id) {
        const customUser: CustomUser = {
          id: response.data.user_id,
          email: response.data.email,
          accountIds: response.data.account_ids || [],
        };
        setUser(customUser);
        setToken(response.data.token);
        localStorage.setItem("user", JSON.stringify(customUser));
        localStorage.setItem("token", response.data.token);

        if (response.data.token_type) {
          localStorage.setItem("token_type", response.data.token_type);
        }
        if (response.data.expires_in) {
          localStorage.setItem(
            "token_expires_at",
            String(Date.now() + response.data.expires_in * 1000),
          );
        }

        return { error: null };
      }

      return { error: new Error(response.resp_msg || "Login failed") };
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
      await resetPasswordService(email);
      return { error: null };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error : new Error("Password reset failed"),
      };
    }
  };

  const value = useMemo(
    () => ({
      user,
      session: null,
      token,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      handleSSO,
    }),
    [user, token, loading, signUp, signIn, signOut, resetPassword, handleSSO],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
