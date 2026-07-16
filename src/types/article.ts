// Article Types - mirrors expected API response shape

export type ArticleType = "news" | "editorial" | "opinion";

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface ArticleSource {
  name: string;
  url: string;
  logo?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  featured_image: string;
  category: string | string[];
  type: ArticleType;
  source?: ArticleSource; // For aggregated news
  tags: string[];
  author?: {
    name: string;
    avatar?: string;
    role?: string;
  };
  published_at: string;
  updated_at: string;
  read_time: number; // in minutes
  is_featured: boolean;
  ai_generated?: boolean;
  seo: {
    meta_title: string;
    meta_description: string;
    og_image?: string;
  };
}

export interface ArticlesResponse {
  articles: Article[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ArticleFilters {
  category?: string;
  type?: ArticleType;
  search?: string;
  page?: number;
  per_page?: number;
}
