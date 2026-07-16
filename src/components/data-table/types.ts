import { ReactNode } from "react";

export type FilterType =
  | "text"
  | "select"
  | "multi-select"
  | "number-range"
  | "date"
  | "date-range"
  | "boolean";

export type SortOrder = "asc" | "desc" | null;

export interface FilterOption {
  label: string;
  value: string;
}

export interface ColumnConfig<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: FilterOption[];
  render?: (value: unknown, row: T) => ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface DataTableQuery {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  filters?: Record<string, string>;
  start_date?: string;
  end_date?: string;
}

export interface DataTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  total: number;
  loading?: boolean;
  error?: Error | null;
  onQueryChange: (query: DataTableQuery) => void;
  enableSearch?: boolean;
  enableExport?: boolean;
  enableDateRange?: boolean;
  enableColumnFilters?: boolean;
  rowKey: keyof T | string;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  searchPlaceholder?: string;
  pageSize?: number;
}

export interface FilterBarProps {
  search?: string;
  onSearchChange: (value: string) => void;
  enableDateRange?: boolean;
  dateRange?: { start: string; end: string };
  onDateRangeChange?: (range: { start: string; end: string }) => void;
  columnFilters?: Record<string, string>;
  onColumnFiltersChange?: (filters: Record<string, string>) => void;
  filterableColumns?: ColumnConfig<Record<string, unknown>>[];
  enableSearch?: boolean;
  searchPlaceholder?: string;
}

export interface ExportDropdownProps {
  onExport: (format: "csv" | "excel" | "pdf") => void;
  loading?: boolean;
  disabled?: boolean;
}

export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";
