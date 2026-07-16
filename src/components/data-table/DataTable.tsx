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
import { FilterBar } from "./FilterBar";
import { ExportDropdown } from "./ExportDropdown";
import type { DataTableProps, DataTableQuery, SortOrder } from "./types";

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

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between gap-3">
            <div className="flex-1">
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
        <CardHeader>
          <CardTitle className="text-base">
            Total: {total.toLocaleString()} {total === 1 ? "record" : "records"}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {columns.map((column) => (
                        <TableHead
                          key={String(column.key)}
                          style={{ width: column.width }}
                          className={`${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""} ${
                            column.sortable
                              ? "cursor-pointer select-none hover:bg-muted/50"
                              : ""
                          }`}
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
                            className={
                              column.align === "center"
                                ? "text-center"
                                : column.align === "right"
                                  ? "text-right"
                                  : ""
                            }
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
              <div className="flex items-center justify-between pt-4 border-t">
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
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={query.page >= totalPages}
                    onClick={() => handlePageChange(query.page + 1)}
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
