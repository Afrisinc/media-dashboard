import { Link } from "react-router-dom";
import { Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Article } from "@/types/article";
import { formatDistanceToNow } from "date-fns";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "compact" | "featured";
}

const typeStyles = {
  news: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30",
  editorial: "bg-primary/10 text-primary border-primary/30",
  opinion:
    "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30",
};

const typeLabels = {
  news: "News",
  editorial: "Afrisinc Editorial",
  opinion: "Opinion",
};

export function ArticleCard({
  article,
  variant = "default",
}: ArticleCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
  });
  const categories = Array.isArray(article.category)
    ? article.category
    : [article.category];

  if (variant === "compact") {
    return (
      <Link to={`/media/articles/${article.slug}`} className="group block">
        <article className="flex gap-4 p-4 rounded-xl bg-card hover:bg-muted/50 transition-colors border border-border/50">
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="flex-1 min-w-0">
            <Badge
              variant="outline"
              className={`mb-2 text-[11px] font-medium ${typeStyles[article.type]}`}
            >
              {typeLabels[article.type]}
            </Badge>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 text-sm leading-snug">
              {article.title}
            </h3>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{article.read_time} min</span>
              <span className="text-border">•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/media/articles/${article.slug}`} className="group block">
      <article className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full flex flex-col border border-border/50">
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Type + AI Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
            <Badge
              variant="outline"
              className={`backdrop-blur-sm bg-background/90 text-xs font-medium ${typeStyles[article.type]}`}
            >
              {typeLabels[article.type]}
            </Badge>
            {article.ai_generated && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-background/90 backdrop-blur-sm border border-primary/20 text-primary">
                ✦ AI
              </span>
            )}
          </div>

          {/* Source indicator for aggregated content */}
          {article.source && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/90 backdrop-blur-sm text-xs font-medium text-muted-foreground">
                <ExternalLink className="w-3 h-3" />
                <span>{article.source.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1">
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.map((cat, idx) => (
              <Badge
                key={`${article.id}-${idx}-${cat}`}
                variant="outline"
                className="text-xs font-medium bg-primary/5 text-primary border-primary/30"
              >
                {cat}
              </Badge>
            ))}
          </div>

          <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-3 leading-snug">
            {article.title}
          </h3>

          <p className="text-muted-foreground text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
            {article.summary}
          </p>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
            <div className="flex items-center gap-3">
              {article.author && (
                <>
                  {article.author.avatar && (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="w-6 h-6 rounded-full object-cover ring-2 ring-border"
                    />
                  )}
                  <span className="font-medium text-foreground">
                    {article.author.name}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>{article.read_time} min read</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
