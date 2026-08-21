import getApiClient from "@/services/apiClient";

/**
 * The one authorised call into content-service.
 *
 * Several hooks used to carry a private copy of this built on bare `fetch`.
 * Each copy attached its own bearer token and did its own error unwrapping,
 * which meant none of them went through the client interceptor — so an expired
 * token failed the request instead of logging the user out.
 *
 * The signature is deliberately `fetch`-shaped so call sites did not have to
 * change; the transport underneath is the shared axios client.
 */
export async function authorizedFetch<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const body =
    typeof init?.body === "string" ? JSON.parse(init.body) : init?.body;

  try {
    const response = await getApiClient().request<T>({
      url: `/media${path}`,
      method,
      data: body,
      headers: init?.headers as Record<string, string> | undefined,
    });
    return response.data;
  } catch (error) {
    throw new Error(describeApiError(error));
  }
}

/** The API returns its own message; surface that rather than a generic failure. */
export function describeApiError(error: unknown): string {
  const response = (
    error as {
      response?: {
        status?: number;
        data?: { resp_msg?: string; error?: string; message?: string };
      };
      message?: string;
    }
  )?.response;

  return (
    response?.data?.resp_msg ||
    response?.data?.error ||
    response?.data?.message ||
    (response?.status ? `Request failed: ${response.status}` : undefined) ||
    (error as { message?: string })?.message ||
    "Something went wrong. Try again."
  );
}
