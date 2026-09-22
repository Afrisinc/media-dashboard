import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FilterBar } from "./FilterBar";
import { ExportDropdown } from "./ExportDropdown";
import type { DataTableProps, DataTableQuery, SortOrder } from "./types";

// Literal class names so Tailwind can see them.
const CARD_BREAKPOINT = {
  md: { cards: "md:hidden", table: "hidden md:block" },
  lg: { cards: "lg:hidden", table: "hidden lg:block" },
  xl: { cards: "xl:hidden", table: "hidden xl:block" },
} as const;

const HIDE_BELOW = {
  lg: "hidden lg:table-cell",
  xl: "hidden xl:table-cell",
  "2xl": "hidden 2xl:table-cell",
} as const;

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  total,
  loading = false,
  error = null,
  onQueryChange,
  enableSearch = true,
  enableExport = false,
  enableDateRange = false,
  enableColumnFilters = false,
  rowKey,
  onRowClick,
  emptyMessage = "No data found",
  searchPlaceholder = "Search...",
  pageSize = 10,
  mobileLayout = "table",
  cardsBelow = "md",
}: DataTableProps<T>) {
  const [query, setQuery] = useState<DataTableQuery>({
    page: 1,
    limit: pageSize,
    search: "",
    filters: {},
  });

  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<SortOrder>(null);

  // Notify parent when query changes
  useEffect(() => {
    onQueryChange(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSort = (columnKey: string) => {
    const column = columns.find((c) => String(c.key) === columnKey);
    if (!column?.sortable) return;

    let newSortOrder: SortOrder;
    if (sortBy === columnKey) {
      newSortOrder =
        sortOrder === "asc" ? "desc" : sortOrder === "desc" ? null : "asc";
    } else {
      newSortOrder = "asc";
    }

    setSortBy(newSortOrder ? columnKey : undefined);
    setSortOrder(newSortOrder);

    setQuery((prev) => ({
      ...prev,
      sort_by: newSortOrder ? columnKey : undefined,
      sort_order: newSortOrder || undefined,
      page: 1,
    }));
  };

  const handleSearchChange = (search: string) => {
    setQuery((prev) => ({ ...prev, search, page: 1 }));
  };

  const handleDateRangeChange = (dateRange: { start: string; end: string }) => {
    setQuery((prev) => ({
      ...prev,
      start_date: dateRange.start || undefined,
      end_date: dateRange.end || undefined,
      page: 1,
    }));
  };

  const handleColumnFiltersChange = (filters: Record<string, string>) => {
    setQuery((prev) => ({ ...prev, filters, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    // This should be implemented by the parent component
    // You can expose an onExport prop if needed
  };

  const totalPages = Math.ceil(total / query.limit);
  const filterableColumns = enableColumnFilters
    ? columns.filter((c) => c.filterable)
    : [];

  const renderCellValue = (column: (typeof columns)[0], row: T) => {
    const value = row[column.key as keyof T];
    if (column.render) {
      return column.render(value, row);
    }
    return value?.toString() || "—";
  };

  const mobilePlacement = (column: (typeof columns)[0], index: number) =>
    column.mobilePlacement ?? (index === 0 ? "title" : "field");
  const mobileColumns = (placement: "title" | "field" | "footer") =>
    columns.filter(
      (column, index) => mobilePlacement(column, index) === placement,
    );

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="min-w-0 flex-1">
              <FilterBar
                search={query.search}
                onSearchChange={handleSearchChange}
                enableDateRange={enableDateRange}
                dateRange={
                  query.start_date && query.end_date
                    ? { start: query.start_date, end: query.end_date }
                    : undefined
                }
                onDateRangeChange={handleDateRangeChange}
                columnFilters={query.filters || {}}
                onColumnFiltersChange={handleColumnFiltersChange}
                filterableColumns={filterableColumns}
                enableSearch={enableSearch}
                searchPlaceholder={searchPlaceholder}
              />
            </div>
            {enableExport && (
              <div className="flex items-center">
                <ExportDropdown
                  onExport={handleExport}
                  disabled={loading || data.length === 0}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-base">
            Total: {total.toLocaleString()} {total === 1 ? "record" : "records"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {error ? (
            <div className="text-center py-12">
              <p className="text-destructive">
                Error loading data: {error.message}
              </p>
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <>
              {mobileLayout === "cards" && (
                <ul
                  className={cn(
                    "grid grid-cols-1 gap-3 md:grid-cols-2",
                    CARD_BREAKPOINT[cardsBelow].cards,
                  )}
                >
                  {data.map((row) => (
                    <li
                      key={String(row[rowKey as keyof T])}
                      className={cn(
                        "space-y-3 rounded-lg border border-border/60 p-4",
                        onRowClick && "cursor-pointer hover:bg-muted/50",
                      )}
                      onClick={() => onRowClick?.(row)}
                    >
                      {mobileColumns("title").map((column) => (
                        <div key={String(column.key)} className="min-w-0">
                          {renderCellValue(column, row)}
                        </div>
                      ))}
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                        {mobileColumns("field").map((column) => (
                          <div key={String(column.key)} className="min-w-0">
                            <dt className="text-xs text-muted-foreground">
                              {column.label}
                            </dt>
                            <dd className="mt-1">
                              {renderCellValue(column, row)}
                            </dd>
                          </div>
                        ))}
                      </dl>
                      {mobileColumns("footer").map((column) => (
                        <div
                          key={String(column.key)}
                          className="border-t border-border/50 pt-2"
                        >
                          {renderCellValue(column, row)}
                        </div>
                      ))}
                    </li>
                  ))}
                </ul>
              )}

              <div
                className={cn(
                  mobileLayout === "cards" && CARD_BREAKPOINT[cardsBelow].table,
                )}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead
                          key={String(column.key)}
                          style={{ width: column.width }}
                          className={cn(
                            "px-3",
                            column.align === "center" && "text-center",
                            column.align === "right" && "text-right",
                            column.sortable &&
                              "cursor-pointer select-none hover:bg-muted/50",
                            column.hideBelow && HIDE_BELOW[column.hideBelow],
                          )}
                          onClick={() =>
                            column.sortable && handleSort(String(column.key))
                          }
                        >
                          <div className="flex items-center gap-2">
                            {column.label}
                            {column.sortable && (
                              <div className="flex flex-col">
                                {sortBy === String(column.key) ? (
                                  sortOrder === "asc" ? (
                                    <ChevronsUp className="h-4 w-4" />
                                  ) : sortOrder === "desc" ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : null
                                ) : null}
                              </div>
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row) => (
                      <TableRow
                        key={String(row[rowKey as keyof T])}
                        className={
                          onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                        }
                        onClick={() => onRowClick?.(row)}
                      >
                        {columns.map((column) => (
                          <TableCell
                            key={String(column.key)}
                            className={cn(
                              "px-3",
                              column.align === "center" && "text-center",
                              column.align === "right" && "text-right",
                              column.hideBelow && HIDE_BELOW[column.hideBelow],
                            )}
                          >
                            {renderCellValue(column, row)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  Page {query.page} of {totalPages} ({total.toLocaleString()}{" "}
                  total)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={query.page === 1}
                    onClick={() => handlePageChange(query.page - 1)}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={query.page >= totalPages}
                    onClick={() => handlePageChange(query.page + 1)}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
