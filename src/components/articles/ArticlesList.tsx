import { ArticleCard } from "./ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import type { Article } from "@/types/article";

interface ArticlesListProps {
  articles: Article[];
  isLoading?: boolean;
  variant?: "grid" | "list";
}

export function ArticlesList({
  articles,
  isLoading,
  variant = "grid",
}: ArticlesListProps) {
  if (isLoading) {
    return (
      <div
        className={
          variant === "grid"
            ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleCardSkeleton
            key={i}
            variant={variant === "list" ? "compact" : "default"}
          />
        ))}
      </div>
    );
  }

  if (!articles.length) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No articles found
        </h3>
        <p className="text-muted-foreground">
          Try adjusting your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "grid"
          ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }
    >
      {articles.map((article, index) => (
        <div
          key={article.id}
          className="animate-fade-up"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <ArticleCard
            article={article}
            variant={variant === "list" ? "compact" : "default"}
          />
        </div>
      ))}
    </div>
  );
}

function ArticleCardSkeleton({ variant }: { variant: "default" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className="flex gap-4 p-4 rounded-xl bg-card">
        <Skeleton className="w-20 h-20 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl overflow-hidden">
      <Skeleton className="aspect-[16/10] w-full" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-3">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
