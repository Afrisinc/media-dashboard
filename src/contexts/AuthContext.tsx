import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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
  signOut: () => Promise<void>;
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

  const signOut = async () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("token_type");
    localStorage.removeItem("token_expires_at");
  };

  const value = useMemo(
    () => ({
      user,
      session: null,
      token,
      loading,
      signOut,
      handleSSO,
    }),
    [user, token, loading, signOut, handleSSO],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
