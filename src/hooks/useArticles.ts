import { useQuery } from "@tanstack/react-query";
import {
  fetchArticles,
  fetchArticlesByCategory,
  fetchArticleBySlug,
  fetchCategories,
  fetchFeaturedArticle,
} from "@/services/articlesService";
import type { ArticleFilters } from "@/types/article";

export function useArticles(filters: ArticleFilters = {}) {
  return useQuery({
    queryKey: ["articles", filters],
    queryFn: () =>
      filters.category
        ? fetchArticlesByCategory(filters.category, filters)
        : fetchArticles(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ["article", slug],
    queryFn: () => fetchArticleBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["article-categories"],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useFeaturedArticle() {
  return useQuery({
    queryKey: ["featured-article"],
    queryFn: fetchFeaturedArticle,
    staleTime: 1000 * 60 * 5,
  });
}
