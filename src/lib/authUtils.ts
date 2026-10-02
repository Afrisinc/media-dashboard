import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

export interface TokenPayload {
  username?: string;
  email?: string;
  role?: string;
  [key: string]: unknown;
}

export function decodeUserToken(): TokenPayload {
  let user: TokenPayload = {};
  const token = localStorage.getItem("token");

  if (token) {
    try {
      user = jwtDecode<TokenPayload>(token);
    } catch {
      return {};
    }
  }

  return user;
}

const ADMIN_ROLES = new Set(["admin", "super_admin"]);

export function isAdminRole(role: string | null | undefined): boolean {
  return Boolean(role) && ADMIN_ROLES.has((role as string).toLowerCase());
}

export function roleFromToken(token: string | null): string | null {
  if (!token) return null;

  try {
    return jwtDecode<TokenPayload>(token).role ?? null;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return localStorage.getItem("token");
}

export function getTokenType(): string {
  return localStorage.getItem("token_type") || "Bearer";
}

export function isTokenExpired(): boolean {
  const expiresAt = localStorage.getItem("token_expires_at");
  if (!expiresAt) return false;
  return Date.now() > parseInt(expiresAt);
}

export async function logoutHandler(route?: string): Promise<void> {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("token_type");
  localStorage.removeItem("token_expires_at");

  if (route) {
    window.location.href = route;
  } else {
    try {
      const { getRuntimeConfig } = await import("./config");
      const config = getRuntimeConfig();
      window.location.href = config.authUiUrl || "/";
    } catch {
      window.location.href = "/";
    }
  }
}

export function onError(error: unknown): void {
  let errorMessage = "Request failed";

  if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    errorMessage =
      (err.resp_msg as string) ||
      (err.message as string) ||
      (err.error_msg as string) ||
      errorMessage;
  }

  toast.error(errorMessage);
}
