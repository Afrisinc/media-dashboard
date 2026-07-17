export interface RuntimeConfig {
  serverUrl: string;
  apiUrl: string;
  authUiUrl: string;
}

let config: RuntimeConfig | null = null;
let configLoaded = false;

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
      serverUrl: import.meta.env.VITE_API_URL || runtimeConfig.serverUrl,
      apiUrl: import.meta.env.VITE_API_URL || runtimeConfig.apiUrl,
      authUiUrl: import.meta.env.VITE_AUTH_UI_URL || runtimeConfig.authUiUrl,
    });

    configLoaded = true;
    return config;
  } catch (error) {
    console.error(
      "Failed to load config.json, falling back to environment variables",
      error,
    );
    config = validateConfig({
      serverUrl: import.meta.env.VITE_API_URL,
      apiUrl: import.meta.env.VITE_API_URL,
      authUiUrl: import.meta.env.VITE_AUTH_UI_URL,
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
