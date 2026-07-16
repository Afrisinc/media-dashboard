import type { Request, Response, NextFunction } from "express";
import fs from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  generateArticleMetaTags,
  generateDefaultMetaTags,
  isSocialCrawler,
  stripHtmlTags,
  SITE_SEO,
  type ArticleSEO,
} from "../src/lib/seo.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";

// In production, server runs from /app/dist-server/server/
// In dev, server runs from /project/server/
const distPath = isProduction
  ? resolve(__dirname, "../../dist")
  : resolve(__dirname, "../dist");
const rootPath = isProduction
  ? resolve(__dirname, "../..")
  : resolve(__dirname, "..");

// Backend article response shape
interface BackendArticle {
  id: string;
  slug?: string;
  source_headline?: string;
  title?: string;
  source_summary?: string;
  summary?: string;
  image_url?: string;
  og_image?: string;
  category?: string | string[];
  pub_date?: string;
  published_at?: string;
  updated_at?: string;
  author?: { name?: string };
  tags?: string[];
}

// Article page pattern: /media/articles/:slug
const ARTICLE_PATTERN = /^\/media\/articles\/([^/]+)$/;

// Category placeholder images (mirrors articlesService.ts)
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  technology:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80",
  business:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
  africa:
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf92e?w=1200&q=80",
  crypto:
    "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1200&q=80",
  blockchain:
    "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
  fintech:
    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=80",
  innovation:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
  ai: "https://images.unsplash.com/photo-1677442d019cecf3e5fa5aeddab77b02ef61208fa?w=1200&q=80",
  healthcare:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200&q=80",
  edtech:
    "https://images.unsplash.com/photo-1516534775068-bb57e39c139f?w=1200&q=80",
  startup:
    "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=80",
  infrastructure:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80",
  general:
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",
};

/**
 * Check if a string is a valid image URL
 */
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return /^(https?:\/\/|data:image\/)/.test(trimmed);
}

/**
 * Get placeholder image by category
 */
function getCategoryPlaceholder(category?: string | string[]): string {
  if (!category) return CATEGORY_PLACEHOLDERS.general;

  const cat = Array.isArray(category) ? category[0] : category;
  if (!cat) return CATEGORY_PLACEHOLDERS.general;

  const catLower = cat.toLowerCase();

  // Exact match
  if (CATEGORY_PLACEHOLDERS[catLower]) {
    return CATEGORY_PLACEHOLDERS[catLower];
  }

  // Partial match
  for (const [key, value] of Object.entries(CATEGORY_PLACEHOLDERS)) {
    if (catLower.includes(key) || key.includes(catLower)) {
      return value;
    }
  }

  return CATEGORY_PLACEHOLDERS.general;
}

/**
 * Load API URL from config.json or environment
 */
function getApiUrl(): string {
  // Environment variable takes priority
  if (process.env.API_URL) return process.env.API_URL;
  if (process.env.VITE_API_URL) return process.env.VITE_API_URL;

  // Try to load from config.json
  try {
    const configPath = isProduction
      ? resolve(distPath, "config.json")
      : resolve(rootPath, "public/config.json");
    const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    if (config.serverUrl) return config.serverUrl;
  } catch {
    // Config not found, use default
  }

  return "";
}

/**
 * Fetch article data from API
 */
async function fetchArticle(slug: string): Promise<ArticleSEO | null> {
  try {
    const apiUrl = getApiUrl();
    if (!apiUrl) {
      console.warn("[SEO] No API URL configured");
      return null;
    }
    const response = await fetch(
      `${apiUrl}/articles/slug/${encodeURIComponent(slug)}`,
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    if (!response.ok) return null;

    const data = (await response.json()) as { data?: BackendArticle };
    const article = data.data;

    if (!article) return null;

    // Get category for placeholder fallback
    const category = article.category;
    const primaryCategory = Array.isArray(category) ? category[0] : category;

    // Determine the best image URL
    // Priority: image_url > og_image > category placeholder > default
    let imageUrl: string;
    if (isValidImageUrl(article.image_url)) {
      imageUrl = article.image_url!.trim();
    } else if (isValidImageUrl(article.og_image)) {
      imageUrl = article.og_image!.trim();
    } else {
      imageUrl = getCategoryPlaceholder(category);
    }

    return {
      title: article.source_headline || article.title || "",
      description: stripHtmlTags(article.source_summary || article.summary),
      image: imageUrl,
      url: `${SITE_SEO.siteUrl}/media/articles/${slug}`,
      type: "article",
      publishedTime: article.pub_date || article.published_at,
      modifiedTime: article.updated_at,
      author: article.author?.name,
      section: primaryCategory || "News",
      tags: article.tags || [],
    };
  } catch (error) {
    console.error("Failed to fetch article for SEO:", error);
    return null;
  }
}

/**
 * Inject meta tags into HTML template
 */
function injectMetaTags(html: string, metaTags: string): string {
  // Replace the existing meta tags in <head>
  // Find the closing </head> and inject before it
  const headCloseIndex = html.indexOf("</head>");
  if (headCloseIndex === -1) return html;

  // Remove existing OG/Twitter meta tags to avoid duplicates
  const cleanedHtml = html
    .replace(/<meta property="og:[^"]*"[^>]*>/g, "")
    .replace(/<meta name="twitter:[^"]*"[^>]*>/g, "")
    .replace(/<meta name="description"[^>]*>/g, "")
    .replace(/<title>[^<]*<\/title>/g, "");

  const newHeadCloseIndex = cleanedHtml.indexOf("</head>");
  return (
    cleanedHtml.slice(0, newHeadCloseIndex) +
    "\n    " +
    metaTags +
    "\n  " +
    cleanedHtml.slice(newHeadCloseIndex)
  );
}

/**
 * SSR Middleware for social media crawlers
 * Intercepts article page requests from bots and injects proper meta tags
 */
export async function seoMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const userAgent = req.headers["user-agent"] || "";

  // Only process for social crawlers
  if (!isSocialCrawler(userAgent)) {
    return next();
  }

  // Check if this is an article page
  const match = req.path.match(ARTICLE_PATTERN);
  if (!match) {
    return next();
  }

  const slug = match[1];
  console.log(`[SEO] Processing article for crawler: ${slug}`);

  try {
    // Fetch article data
    const article = await fetchArticle(slug);

    // Read HTML template
    const indexPath = isProduction
      ? resolve(distPath, "index.html")
      : resolve(rootPath, "index.html");
    let html = fs.readFileSync(indexPath, "utf-8");

    // Generate and inject meta tags
    const metaTags = article
      ? generateArticleMetaTags(article)
      : generateDefaultMetaTags();

    html = injectMetaTags(html, metaTags);

    res.status(200).set({ "Content-Type": "text/html" }).end(html);
  } catch (error) {
    console.error("[SEO] Error processing request:", error);
    next();
  }
}
