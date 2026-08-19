declare global {
  interface Window {
    __ENV__?: Record<string, string>;
  }
}

export interface RuntimeConfig {
  serverUrl: string;
  apiUrl: string;
  authUiUrl: string;
}

let config: RuntimeConfig | null = null;
let configLoaded = false;

function isPlaceholder(value: string | undefined): boolean {
  return !value || value.startsWith("__");
}

function validateConfig(cfg: Partial<RuntimeConfig>): RuntimeConfig {
  const errors: string[] = [];

  if (!cfg.serverUrl) {
    errors.push("VITE_API_URL or config.serverUrl is required");
  }
  if (!cfg.apiUrl) {
    errors.push("VITE_API_URL or config.apiUrl is required");
  }
  if (!cfg.authUiUrl) {
    errors.push("VITE_AUTH_UI_URL or config.authUiUrl is required");
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join("\n")}`);
  }

  return {
    serverUrl: cfg.serverUrl!,
    apiUrl: cfg.apiUrl!,
    authUiUrl: cfg.authUiUrl!,
  };
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (configLoaded) {
    return config!;
  }

  try {
    // Check for runtime-injected environment variables first (via env-config.js)
    // Skip placeholder values (e.g., __VITE_API_URL__) and fall back to import.meta.env
    const injectedEnv = window.__ENV__;
    const apiUrl = !isPlaceholder(injectedEnv?.VITE_API_URL)
      ? injectedEnv?.VITE_API_URL
      : import.meta.env.VITE_API_URL;
    const authUiUrl = !isPlaceholder(injectedEnv?.VITE_AUTH_UI_URL)
      ? injectedEnv?.VITE_AUTH_UI_URL
      : import.meta.env.VITE_AUTH_UI_URL;

    // Only load config.json if we don't have the required env vars
    if (isPlaceholder(apiUrl) || isPlaceholder(authUiUrl)) {
      const response = await fetch("/config.json", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Failed to load config.json: ${response.status}`);
      }

      const runtimeConfig = await response.json();

      config = validateConfig({
        serverUrl: runtimeConfig.serverUrl || apiUrl,
        apiUrl: runtimeConfig.apiUrl || apiUrl,
        authUiUrl: runtimeConfig.authUiUrl || authUiUrl,
      });
    } else {
      config = validateConfig({
        serverUrl: apiUrl,
        apiUrl: apiUrl,
        authUiUrl: authUiUrl,
      });
    }

    configLoaded = true;
    return config;
  } catch (error) {
    console.error(
      "Failed to load config, falling back to environment variables",
      error,
    );
    const injectedEnv = window.__ENV__;
    const apiUrl = !isPlaceholder(injectedEnv?.VITE_API_URL)
      ? injectedEnv?.VITE_API_URL
      : import.meta.env.VITE_API_URL;
    const authUiUrl = !isPlaceholder(injectedEnv?.VITE_AUTH_UI_URL)
      ? injectedEnv?.VITE_AUTH_UI_URL
      : import.meta.env.VITE_AUTH_UI_URL;

    config = validateConfig({
      serverUrl: apiUrl,
      apiUrl: apiUrl,
      authUiUrl: authUiUrl,
    });
    configLoaded = true;
    return config;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  if (!configLoaded || !config) {
    throw new Error(
      "Configuration not loaded. Call loadRuntimeConfig() first.",
    );
  }
  return config;
}

export function getConfigValue(key: keyof RuntimeConfig): string {
  const cfg = getRuntimeConfig();
  const value = cfg[key];
  if (!value) {
    throw new Error(`Configuration value ${key} is required but not set`);
  }
  return value;
}

export function isRuntimeConfigLoaded(): boolean {
  return configLoaded;
}
