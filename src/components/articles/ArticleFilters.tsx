import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useArticles";
import type { ArticleType, ArticleFilters as Filters } from "@/types/article";

interface ArticleFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

const articleTypes: { value: ArticleType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "editorial", label: "Editorials" },
  { value: "news", label: "News" },
  { value: "opinion", label: "Opinion" },
];

export function ArticleFiltersComponent({
  filters,
  onFiltersChange,
}: ArticleFiltersProps) {
  const { data: categories = [] } = useCategories();
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>();

  // Debounce search to smooth loading and reduce API calls
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onFiltersChange({
        ...filters,
        search: searchValue || undefined,
        page: 1,
      });
    }, 500); // Wait 500ms after user stops typing

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  const handleCategoryChange = (categorySlug: string) => {
    onFiltersChange({
      ...filters,
      category: categorySlug === "all" ? undefined : categorySlug,
      page: 1,
    });
  };

  const handleTypeChange = (type: ArticleType | "all") => {
    onFiltersChange({
      ...filters,
      type: type === "all" ? undefined : type,
      page: 1,
    });
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search articles..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2">
        {articleTypes.map((type) => (
          <Button
            key={type.value}
            variant={
              filters.type === type.value ||
              (!filters.type && type.value === "all")
                ? "default"
                : "outline"
            }
            size="sm"
            onClick={() => handleTypeChange(type.value)}
            className="rounded-full"
          >
            {type.label}
          </Button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!filters.category ? "secondary" : "ghost"}
          size="sm"
          onClick={() => handleCategoryChange("all")}
          className="rounded-full"
        >
          All Categories
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={filters.category === category.slug ? "secondary" : "ghost"}
            size="sm"
            onClick={() => handleCategoryChange(category.slug)}
            className="rounded-full"
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
