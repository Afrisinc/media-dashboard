import { getRuntimeConfig } from "@/lib/config";
import apiClient from "./apiClient";

export interface AuthResponse {
  success: boolean;
  data?: {
    token: string;
    token_type: string;
    expires_in: number;
    user_id: string;
    email: string;
    account_ids: string[];
  };
  resp_msg?: string;
}

export async function loginService(email: string, password: string) {
  const config = getRuntimeConfig();
  const response = await fetch(`${config.serverUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.resp_msg || "Login failed");
  }

  return (await response.json()) as AuthResponse;
}

export async function registerService(data: {
  email: string;
  password: string;
  fullName?: string;
}) {
  const config = getRuntimeConfig();
  const response = await fetch(`${config.serverUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.resp_msg || "Registration failed");
  }

  return (await response.json()) as AuthResponse;
}

export async function resetPasswordService(email: string) {
  const config = getRuntimeConfig();
  const response = await fetch(`${config.serverUrl}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.resp_msg || "Password reset failed");
  }

  return await response.json();
}

export async function validateTokenService() {
  const response = await apiClient().get("/auth/validate");
  return response.data;
}
