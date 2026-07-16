import express from "express";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import fs from "node:fs";
import { seoMiddleware } from "./seo-middleware.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 8090;

// In production, server runs from /app/dist-server/server/
// In dev, server runs from /project/server/
// So production needs ../../dist, dev needs ../dist
const distPath = isProduction
  ? resolve(__dirname, "../../dist")
  : resolve(__dirname, "../dist");
const rootPath = isProduction
  ? resolve(__dirname, "../..")
  : resolve(__dirname, "..");

// Type for Vite dev server (only used in development)
type ViteDevServer = {
  middlewares: express.Handler;
  transformIndexHtml: (url: string, html: string) => Promise<string>;
};

async function createServer() {
  const app = express();

  let vite: ViteDevServer | null = null;

  if (!isProduction) {
    // Development: dynamically import Vite and use as middleware
    const { createServer: createViteServer } = await import("vite");
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: serve static files
    app.use(express.static(distPath, { index: false }));
  }

  // SSR middleware for social crawlers on article pages
  app.use(seoMiddleware);

  // Fallback: serve index.html for SPA routing
  app.get("*", async (req, res) => {
    const indexPath = isProduction
      ? resolve(distPath, "index.html")
      : resolve(rootPath, "index.html");

    let html = fs.readFileSync(indexPath, "utf-8");

    if (!isProduction && vite) {
      html = await vite.transformIndexHtml(req.url, html);
    }

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  });

  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

createServer();
