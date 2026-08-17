import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getRuntimeConfig } from "@/lib/config";
import { getToken } from "@/lib/authUtils";
import type { SocialPlatformKey } from "@/config/socialPlatforms";
import type { OAuthCallbackResponse } from "@/hooks/useSocialMediaIntegrations";

async function authorizedFetch(path: string) {
  const config = getRuntimeConfig();
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const response = await fetch(`${config.serverUrl}/media${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(
      body?.resp_msg || body?.message || `Request failed: ${response.status}`,
    );
  }

  return response.json();
}

export default function OAuthCallback() {
  const { platform: platformParam } = useParams<{ platform: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");
        const platform = platformParam as SocialPlatformKey;

        if (!code || !state || !platform) {
          throw new Error("Missing OAuth parameters");
        }

        const response = await authorizedFetch(
          `/social-media/oauth/callback/${platform}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
        );

        const data = response.data as OAuthCallbackResponse;

        if (!data.pages || data.pages.length === 0) {
          throw new Error("No pages found in your account");
        }

        // Store pages in sessionStorage for retrieval
        sessionStorage.setItem(
          `oauth-pages-${platform}`,
          JSON.stringify(data.pages),
        );

        // Redirect back to settings with pages
        const pagesParam = encodeURIComponent(JSON.stringify(data.pages));
        navigate(`/settings?platform=${platform}&pages=${pagesParam}`, {
          replace: true,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "OAuth failed";
        setError(message);
        toast({
          title: "OAuth Connection Failed",
          description: message,
          variant: "destructive",
        });

        setTimeout(() => {
          navigate("/settings", { replace: true });
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast, platformParam]);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-destructive">{error}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Redirecting back to settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          Connecting to your platform...
        </p>
      </div>
    </div>
  );
}
