import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ArticlePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ArticlePagination({
  currentPage,
  totalPages,
  onPageChange,
}: ArticlePaginationProps) {
  if (totalPages <= 1) return null;

  const pages = generatePageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="rounded-full"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={`ellipsis-${index}`}
            className="px-2 text-muted-foreground"
          >
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page as number)}
            className="rounded-full w-10 h-10"
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="rounded-full"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 3) {
    return [1, 2, 3, 4, "...", total];
  }

  if (current >= total - 2) {
    return [1, "...", total - 3, total - 2, total - 1, total];
  }

  return [1, "...", current - 1, current, current + 1, "...", total];
}
