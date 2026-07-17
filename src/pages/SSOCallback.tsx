import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const SSOCallback = () => {
  const navigate = useNavigate();
  const { handleSSO } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      handleSSO(token);
      navigate("/ai-content", { replace: true });
    } else {
      navigate("/", { replace: true });
    }
  }, [handleSSO, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-sm text-muted-foreground">
          Processing authentication...
        </p>
      </div>
    </div>
  );
};

export default SSOCallback;
