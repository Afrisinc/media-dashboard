import { Link } from "react-router-dom";
import { Clock, ArrowRight, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Article } from "@/types/article";
import { formatDistanceToNow } from "date-fns";

interface FeaturedArticleProps {
  article: Article | null;
  isLoading?: boolean;
}

export function FeaturedArticle({ article, isLoading }: FeaturedArticleProps) {
  if (isLoading) {
    return (
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        <Skeleton className="aspect-video rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    );
  }

  if (!article) return null;

  const timeAgo = formatDistanceToNow(new Date(article.published_at), {
    addSuffix: true,
  });
  const categories = Array.isArray(article.category)
    ? article.category
    : [article.category];

  return (
    <div className="grid lg:grid-cols-2 gap-8 items-center">
      {/* Image */}
      <Link
        to={`/media/articles/${article.slug}`}
        className="relative rounded-2xl overflow-hidden aspect-video group"
      >
        <img
          src={article.featured_image}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
          Featured
        </Badge>
      </Link>

      {/* Content */}
      <div className="animate-fade-up animation-delay-100">
        {/* Category + type + AI badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant="outline"
              className="bg-primary/5 text-primary border-primary/30"
            >
              {cat}
            </Badge>
          ))}
          <Badge
            variant="outline"
            className={
              article.type === "editorial"
                ? "bg-primary/10 text-primary border-primary/20"
                : article.type === "opinion"
                  ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                  : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }
          >
            {article.type === "editorial"
              ? "Afrisinc Editorial"
              : article.type === "opinion"
                ? "Opinion"
                : "News"}
          </Badge>
          {article.ai_generated && (
            <Badge
              variant="outline"
              className="bg-primary/5 text-primary border-primary/20 text-[11px]"
            >
              ✦ AI Generated
            </Badge>
          )}
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
          {article.title}
        </h2>

        <p className="text-muted-foreground text-lg mb-4 leading-relaxed">
          {article.summary}
        </p>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {article.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-xs bg-muted text-muted-foreground border border-border/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          {article.author && (
            <>
              <div className="flex items-center gap-2">
                {article.author.avatar && (
                  <img
                    src={article.author.avatar}
                    alt={article.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="font-medium text-foreground">
                  {article.author.name}
                </span>
              </div>
              <span>•</span>
            </>
          )}
          <span>{timeAgo}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {article.read_time} min read
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap">
          <Button variant="default" asChild>
            <Link to={`/media/articles/${article.slug}`}>
              Read Article
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-[#25D366] border-[#25D366]/30 hover:bg-[#25D366]/5 hover:border-[#25D366]/50"
            onClick={() => {
              const url = `${window.location.origin}/media/articles/${article.slug}`;
              window.open(
                `https://wa.me/send?text=${encodeURIComponent(`${article.title} ${url}`)}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            <MessageCircle className="w-4 h-4" />
            Share on WhatsApp
          </Button>
        </div>
      </div>
    </div>
  );
}
