import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, token } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center animate-pulse">
            <span className="text-primary-foreground font-bold text-lg">A</span>
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user && !token) {
    // Redirect to external auth service
    window.location.href = `http://localhost:8098/login?redirect=${encodeURIComponent(window.location.href)}`;
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
