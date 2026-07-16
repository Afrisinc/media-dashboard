// Articles Service - Integrates with N8N Articles API

import type {
  Article,
  ArticleCategory,
  ArticlesResponse,
  ArticleFilters,
} from "@/types/article";
import { getRuntimeConfig } from "@/lib/config";
import {
  mockArticles,
  mockFeaturedArticle,
  mockCategories,
} from "@/lib/mockArticles";
import { stripHtmlTags } from "@/lib/seo";

// Backend article response shape
interface BackendArticle {
  id: string;
  slug?: string;
  source_headline?: string;
  source_summary?: string;
  source_url?: string;
  image_url?: string;
  category?: string;
  pub_date?: string;
  updated_at?: string;
  read_time?: number;
  is_featured?: boolean;
  ai_generated?: boolean;
  tags?: string[];
  author?: { name?: string; avatar?: string; role?: string };
}

// Cached categories
let categoriesCache: ArticleCategory[] | null = null;

// Category placeholder images mapping
const categoryPlaceholders: Record<string, string> = {
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

// Get placeholder image by category (supports string or array)
export function getCategoryPlaceholderImage(
  category?: string | string[],
): string {
  // Handle empty/null input
  if (!category) {
    return categoryPlaceholders.general;
  }

  // If it's an array, use the first category
  const categoryToCheck = Array.isArray(category) ? category[0] : category;

  if (!categoryToCheck) {
    return categoryPlaceholders.general;
  }

  const categoryLower = categoryToCheck.toLowerCase();

  // Check for exact match
  if (categoryPlaceholders[categoryLower]) {
    return categoryPlaceholders[categoryLower];
  }

  // Check for partial match (e.g., "fintech-related" matches "fintech")
  for (const [key, value] of Object.entries(categoryPlaceholders)) {
    if (categoryLower.includes(key) || key.includes(categoryLower)) {
      return value;
    }
  }

  // Default fallback
  return categoryPlaceholders.general;
}

// Check if a string is a valid image URL
function isValidImageUrl(url: string | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  // Check if it starts with http/https or data URI
  return /^(https?:\/\/|data:image\/)/.test(trimmed);
}

// Parse comma-separated categories into array
function parseCategories(categoryString?: string): string | string[] {
  if (!categoryString) return "general";

  // If it's already an array, return as is
  if (Array.isArray(categoryString)) return categoryString;

  // If it contains commas, split and trim
  if (typeof categoryString === "string" && categoryString.includes(",")) {
    return categoryString
      .split(",")
      .map((cat) => cat.trim())
      .filter((cat) => cat.length > 0);
  }

  return categoryString;
}

// Map backend article response to our Article type
async function mapBackendArticle(
  backendArticle: BackendArticle,
): Promise<Article> {
  // Parse categories from backend (handles comma-separated string)
  const parsedCategories = parseCategories(backendArticle.category);
  const categoryForPlaceholder = Array.isArray(parsedCategories)
    ? parsedCategories[0] || "general"
    : parsedCategories || "general";

  const placeholderImage = getCategoryPlaceholderImage(categoryForPlaceholder);

  // Use image_url only if it's a valid URL, otherwise use placeholder
  const featuredImage = isValidImageUrl(backendArticle.image_url)
    ? backendArticle.image_url.trim()
    : placeholderImage;

  // Derive a human-readable source name from the source URL
  const sourceName = (() => {
    try {
      return new URL(backendArticle.source_url || "").hostname.replace(
        /^www\./,
        "",
      );
    } catch {
      return "News Feed";
    }
  })();

  // Strip HTML from summary for display, keep original for content
  const cleanSummary = stripHtmlTags(backendArticle.source_summary);

  return {
    id: backendArticle.id,
    slug: backendArticle.slug || backendArticle.id.toString(),
    title: backendArticle.source_headline || "",
    summary: cleanSummary,
    content: backendArticle.source_summary || "",
    featured_image: featuredImage,
    category: parsedCategories,
    type: "news",
    tags: Array.isArray(backendArticle.tags) ? backendArticle.tags : [],
    source: {
      name: sourceName,
      url: backendArticle.source_url || "",
    },
    published_at: backendArticle.pub_date || new Date().toISOString(),
    updated_at:
      backendArticle.updated_at ||
      backendArticle.pub_date ||
      new Date().toISOString(),
    read_time:
      backendArticle.read_time ||
      Math.ceil(
        (backendArticle.source_summary?.split(" ").length || 0) / 200,
      ) ||
      1,
    is_featured: backendArticle.is_featured || false,
    ai_generated: backendArticle.ai_generated || false,
    seo: {
      meta_title: backendArticle.source_headline || "",
      meta_description: cleanSummary,
      og_image: featuredImage,
    },
  };
}

// API Functions - Call real N8N Articles API endpoints

/**
 * Fetch all articles with optional search and pagination
 * GET /articles?search=...&page=1&limit=10
 */
export async function fetchArticles(
  filters: ArticleFilters = {},
): Promise<ArticlesResponse> {
  try {
    const config = getRuntimeConfig();
    const searchParams = new URLSearchParams();

    if (filters.search) {
      searchParams.append("search", filters.search);
    }

    const page = filters.page || 1;
    const limit = filters.per_page || 10;
    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${config.serverUrl}/articles?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.status}`);
    }

    const data = await response.json();

    // Map backend response to our format
    const articles = await Promise.all(
      (data.data?.data || []).map(mapBackendArticle),
    );

    return {
      articles,
      total: data.data?.pagination?.total || 0,
      page: data.data?.pagination?.page || page,
      per_page: data.data?.pagination?.limit || limit,
      total_pages: data.data?.pagination?.totalPages || 0,
    };
  } catch {
    // API unavailable — return mock data filtered by search
    const page = filters.page || 1;
    const limit = filters.per_page || 10;
    let filtered = mockArticles;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q),
      );
    }
    const start = (page - 1) * limit;
    return {
      articles: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      per_page: limit,
      total_pages: Math.ceil(filtered.length / limit),
    };
  }
}

/**
 * Fetch articles by category with pagination
 * GET /articles/category/:category?page=1&limit=10
 */
export async function fetchArticlesByCategory(
  category: string,
  filters: ArticleFilters = {},
): Promise<ArticlesResponse> {
  try {
    const config = getRuntimeConfig();
    const searchParams = new URLSearchParams();

    const page = filters.page || 1;
    const limit = filters.per_page || 10;
    searchParams.append("page", page.toString());
    searchParams.append("limit", limit.toString());

    const url = `${config.serverUrl}/articles/category/${encodeURIComponent(category)}?${searchParams.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch articles by category: ${response.status}`,
      );
    }

    const data = await response.json();

    // Map backend response to our format
    const articles = await Promise.all(
      (data.data?.data || []).map(mapBackendArticle),
    );

    return {
      articles,
      total: data.data?.pagination?.total || 0,
      page: data.data?.pagination?.page || page,
      per_page: data.data?.pagination?.limit || limit,
      total_pages: data.data?.pagination?.totalPages || 0,
    };
  } catch {
    // API unavailable — return mock data filtered by category
    const page = filters.page || 1;
    const limit = filters.per_page || 10;
    const filtered = mockArticles.filter((a) => {
      const cats = Array.isArray(a.category) ? a.category : [a.category];
      return cats.some((c) => c.toLowerCase() === category.toLowerCase());
    });
    const start = (page - 1) * limit;
    return {
      articles: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      per_page: limit,
      total_pages: Math.ceil(filtered.length / limit),
    };
  }
}

/**
 * Fetch single article by ID
 * GET /articles/:id
 */
export async function fetchArticleById(id: string): Promise<Article | null> {
  const config = getRuntimeConfig();
  const url = `${config.serverUrl}/articles/${encodeURIComponent(id)}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    throw new Error(`Failed to fetch article: ${response.status}`);
  }

  const data = await response.json();
  return mapBackendArticle(data.data);
}

/**
 * Fetch article by slug
 * Tries GET /articles/slug/:slug first; falls back to mock data.
 */
export async function fetchArticleBySlug(
  slug: string,
): Promise<Article | null> {
  try {
    const config = getRuntimeConfig();
    const url = `${config.serverUrl}/articles/slug/${encodeURIComponent(slug)}`;

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`Failed to fetch article by slug: ${response.status}`);
    }

    const data = await response.json();
    return mapBackendArticle(data.data);
  } catch {
    // API unavailable — search mock data
    return mockArticles.find((a) => a.slug === slug) || null;
  }
}

/**
 * Fetch categories - uses first page of articles to extract unique categories
 * Note: If your backend has a dedicated categories endpoint, use that instead
 */
export async function fetchCategories(): Promise<ArticleCategory[]> {
  try {
    // Return cached categories if available
    if (categoriesCache) {
      return categoriesCache;
    }

    const config = getRuntimeConfig();
    const url = `${config.serverUrl}/articles?limit=100`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const data = await response.json();

    // Extract unique categories from articles
    const categoryMap = new Map<string, ArticleCategory>();
    (data.data?.data || []).forEach((article: BackendArticle) => {
      // Handle category as string or array of strings
      const categoryArray = Array.isArray(article.category)
        ? article.category
        : [article.category];

      // Process all categories in the array
      categoryArray.forEach((categoryRaw: string) => {
        if (categoryRaw) {
          const categorySlug = categoryRaw.toLowerCase();
          if (!categoryMap.has(categorySlug)) {
            categoryMap.set(categorySlug, {
              id: categorySlug,
              name: categoryRaw,
              slug: categorySlug,
              description: "",
            });
          }
        }
      });
    });

    categoriesCache = Array.from(categoryMap.values());
    return categoriesCache;
  } catch {
    // API unavailable — return categories derived from mock data
    return mockCategories;
  }
}

/**
 * Fetch featured article - returns first article marked as featured
 */
export async function fetchFeaturedArticle(): Promise<Article | null> {
  try {
    const response = await fetchArticles({ per_page: 1 });

    const featured = response.articles.find((a) => a.is_featured);
    return featured || response.articles[0] || null;
  } catch {
    // API unavailable — return mock featured article
    return mockFeaturedArticle;
  }
}
