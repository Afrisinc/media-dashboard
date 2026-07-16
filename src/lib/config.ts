export interface RuntimeConfig {
  serverUrl: string;
}

let config: RuntimeConfig | null = null;
let configLoaded = false;

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

    // Priority: VITE_API_URL env var (set at build time) > config.json > empty string
    config = {
      serverUrl: import.meta.env.VITE_API_URL || runtimeConfig.serverUrl || "",
    };

    // Configuration loaded

    configLoaded = true;
    return config;
  } catch {
    config = {
      serverUrl: import.meta.env.VITE_API_URL || "",
    };
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
  return cfg[key] || "";
}

export function isRuntimeConfigLoaded(): boolean {
  return configLoaded;
}
