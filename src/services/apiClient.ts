import axios, { AxiosInstance } from "axios";
import { logoutHandler, getToken } from "@/lib/authUtils";
import { getRuntimeConfig, isRuntimeConfigLoaded } from "@/lib/config";

let apiClientInstance: AxiosInstance | null = null;

const createApiClient = () => {
  let baseURL: string;

  try {
    const config = getRuntimeConfig();
    baseURL = config.serverUrl || config.apiUrl || "";
  } catch {
    baseURL = import.meta.env.VITE_API_URL || "";
  }

  const instance = axios.create({ baseURL });

  instance.interceptors.request.use(async (request) => {
    const token = getToken();
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const isTokenError =
        error?.response?.data?.error?.name === "TokenExpiredError" ||
        error?.response?.data?.error === "Token was not provided" ||
        error?.response?.data?.error?.message === "Token was not provided";

      const is401WithTokenMessage =
        error?.response?.status === 401 &&
        (error?.response?.data?.message?.toLowerCase()?.includes("token") ||
          error?.response?.data?.resp_msg?.toLowerCase()?.includes("token") ||
          (typeof error?.response?.data?.error === "string" &&
            error?.response?.data?.error?.toLowerCase()?.includes("token")));

      if (isTokenError || is401WithTokenMessage) {
        await logoutHandler();
      }

      throw error;
    },
  );

  return instance;
};

export default function getApiClient() {
  if (!apiClientInstance || !isRuntimeConfigLoaded()) {
    apiClientInstance = createApiClient();
  }
  return apiClientInstance;
}
