import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/data-table/DataTable";
import { useLoginEvents } from "@/hooks/usePlatform";
import { LoginEventResponse } from "@/types/auth.security";
import type {
  DataTableQuery,
  ColumnConfig,
} from "@/components/data-table/types";

const columns: ColumnConfig<LoginEventResponse>[] = [
  {
    key: "email",
    label: "Email",
    sortable: true,
    width: "20%",
  },
  {
    key: "name",
    label: "Name",
    width: "12%",
  },
  {
    key: "type",
    label: "Type",
    filterable: true,
    filterType: "select",
    filterOptions: [
      { label: "Login Event", value: "login_event" },
      { label: "Login Failure", value: "login_failure" },
    ],
    render: (value: string) => (
      <Badge variant="outline">
        {value === "login_event" ? "Event" : "Failure"}
      </Badge>
    ),
    width: "10%",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    filterable: true,
    filterType: "select",
    filterOptions: [
      { label: "Success", value: "success" },
      { label: "Failed", value: "failed" },
    ],
    render: (value: string) => (
      <Badge variant={value === "success" ? "default" : "destructive"}>
        {value.charAt(0).toUpperCase() + value.slice(1)}
      </Badge>
    ),
    width: "10%",
  },
  {
    key: "ip",
    label: "IP Address",
    sortable: true,
    width: "12%",
    render: (value: string) => (
      <span className="font-mono text-sm">{value}</span>
    ),
  },
  {
    key: "phone",
    label: "Phone",
    width: "12%",
  },
  {
    key: "reason",
    label: "Reason",
    width: "12%",
    render: (value: string | null) => (
      <span className="text-sm">
        {value ? (
          <Badge variant="outline" className="text-xs">
            {value}
          </Badge>
        ) : (
          "—"
        )}
      </span>
    ),
  },
  {
    key: "createdAt",
    label: "Timestamp",
    sortable: true,
    width: "20%",
    render: (value: string) => new Date(value).toLocaleString(),
  },
];

export function LoginEventsTable() {
  const [query, setQuery] = useState<DataTableQuery>({
    page: 1,
    limit: 10,
    search: "",
  });

  const { data, isLoading, error } = useLoginEvents({
    page: query.page,
    limit: query.limit,
    search: query.search,
    sortBy: query.sort_order || "desc",
  });

  const handleQueryChange = (newQuery: DataTableQuery) => {
    setQuery(newQuery);
  };

  return (
    <DataTable<LoginEventResponse>
      columns={columns}
      data={data?.data || []}
      total={data?.meta.total || 0}
      loading={isLoading}
      error={error}
      onQueryChange={handleQueryChange}
      rowKey="id"
      enableSearch
      enableColumnFilters
      searchPlaceholder="Search by email, name, phone, or IP..."
      emptyMessage="No login events found"
      pageSize={10}
    />
  );
}
