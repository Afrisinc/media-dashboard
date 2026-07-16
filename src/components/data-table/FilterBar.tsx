import { useState, useEffect } from "react";
import { Search, Calendar, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import type { FilterBarProps, DateRangePreset } from "./types";

export function FilterBar({
  search = "",
  onSearchChange,
  enableDateRange = false,
  dateRange,
  onDateRangeChange,
  columnFilters = {},
  onColumnFiltersChange,
  filterableColumns = [],
  enableSearch = true,
  searchPlaceholder = "Search...",
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState(search);
  const [datePreset, setDatePreset] = useState<DateRangePreset | "">("");
  const [customDateRange, setCustomDateRange] = useState<{
    start?: Date;
    end?: Date;
  }>({});

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== search) {
        onSearchChange(searchValue);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, search, onSearchChange]);

  const handleDatePresetChange = (preset: DateRangePreset) => {
    setDatePreset(preset);
    const today = new Date();
    let start: Date;
    const end: Date = today;

    switch (preset) {
      case "today":
        start = today;
        break;
      case "7d":
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        return;
    }

    if (onDateRangeChange) {
      onDateRangeChange({
        start: format(start, "yyyy-MM-dd"),
        end: format(end, "yyyy-MM-dd"),
      });
    }
  };

  const handleCustomDateChange = () => {
    if (customDateRange.start && customDateRange.end && onDateRangeChange) {
      onDateRangeChange({
        start: format(customDateRange.start, "yyyy-MM-dd"),
        end: format(customDateRange.end, "yyyy-MM-dd"),
      });
      setDatePreset("custom");
    }
  };

  const clearDateRange = () => {
    setDatePreset("");
    setCustomDateRange({});
    if (onDateRangeChange) {
      onDateRangeChange({ start: "", end: "" });
    }
  };

  const handleColumnFilterChange = (
    columnKey: string,
    value: string | null | undefined,
  ) => {
    if (onColumnFiltersChange) {
      const newFilters = { ...columnFilters };
      if (value === "" || value === null || value === undefined) {
        delete newFilters[columnKey];
      } else {
        newFilters[columnKey] = value;
      }
      onColumnFiltersChange(newFilters);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        {enableSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="pl-9"
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => {
                  setSearchValue("");
                  onSearchChange("");
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {/* Date Range Picker */}
        {enableDateRange && (
          <div className="flex gap-2">
            <Select
              value={datePreset}
              onValueChange={(v) =>
                handleDatePresetChange(v as DateRangePreset)
              }
            >
              <SelectTrigger className="w-[140px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Custom Range
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <div className="p-3 space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Start Date
                    </label>
                    <CalendarComponent
                      mode="single"
                      selected={customDateRange.start}
                      onSelect={(date) =>
                        setCustomDateRange({ ...customDateRange, start: date })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      End Date
                    </label>
                    <CalendarComponent
                      mode="single"
                      selected={customDateRange.end}
                      onSelect={(date) =>
                        setCustomDateRange({ ...customDateRange, end: date })
                      }
                    />
                  </div>
                  <Button
                    onClick={handleCustomDateChange}
                    className="w-full"
                    size="sm"
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            {dateRange?.start && (
              <Button variant="ghost" size="sm" onClick={clearDateRange}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Column Filters */}
      {filterableColumns.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filterableColumns.map((column) => {
            if (!column.filterable) return null;

            const columnKey = String(column.key);

            if (column.filterType === "select" && column.filterOptions) {
              return (
                <Select
                  key={columnKey}
                  value={columnFilters[columnKey] || "ALL"}
                  onValueChange={(value) =>
                    handleColumnFilterChange(
                      columnKey,
                      value === "ALL" ? "" : value,
                    )
                  }
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={column.label} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All {column.label}</SelectItem>
                    {column.filterOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              );
            }

            return null;
          })}
        </div>
      )}
    </div>
  );
}
