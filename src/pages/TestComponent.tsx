import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  DataTable,
  type ColumnConfig,
  type DataTableQuery,
} from "@/components/data-table";
import { CopyableText } from "@/components/ui/copyable-text";
import { toast } from "sonner";

// Mock data for testing
interface TestUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin: string | null;
}

const mockData: TestUser[] = Array.from({ length: 50 }, (_, i) => ({
  id: `user-${i + 1}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  role: ["Admin", "User", "Guest"][i % 3],
  status: ["active", "inactive", "pending"][i % 3] as TestUser["status"],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  lastLogin:
    i % 5 === 0 ? null : new Date(Date.now() - i * 3600000).toISOString(),
}));

export default function TestComponent() {
  const [query, setQuery] = useState<DataTableQuery>({
    page: 1,
    limit: 10,
    search: "",
    filters: {},
  });

  // Simulate server-side filtering
  const getFilteredData = () => {
    let filtered = [...mockData];

    // Search filter
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower),
      );
    }

    // Status filter
    if (query.filters?.status) {
      filtered = filtered.filter(
        (user) => user.status === query.filters?.status,
      );
    }

    // Role filter
    if (query.filters?.role) {
      filtered = filtered.filter((user) => user.role === query.filters?.role);
    }

    // Date range filter (simplified)
    if (query.start_date && query.end_date) {
      const start = new Date(query.start_date);
      const end = new Date(query.end_date);
      filtered = filtered.filter((user) => {
        const created = new Date(user.createdAt);
        return created >= start && created <= end;
      });
    }

    // Sort
    if (query.sort_by && query.sort_order) {
      filtered.sort((a, b) => {
        const aVal = a[query.sort_by as keyof TestUser];
        const bVal = b[query.sort_by as keyof TestUser];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return query.sort_order === "asc" ? comparison : -comparison;
      });
    }

    const total = filtered.length;
    const start = (query.page - 1) * query.limit;
    const end = start + query.limit;
    const paginated = filtered.slice(start, end);

    return { data: paginated, total };
  };

  const { data, total } = getFilteredData();

  const statusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const handleExport = (format: "csv" | "excel" | "pdf") => {
    toast.success(`Exporting ${total} records as ${format.toUpperCase()}`);
  };

  const handleRowClick = (user: TestUser) => {
    toast.info(`Clicked on ${user.name}`);
  };

  // Define columns
  const columns: ColumnConfig<TestUser>[] = [
    {
      key: "id",
      label: "ID",
      sortable: true,
      width: "120px",
      render: (value) => <CopyableText text={value} truncateAt={8} />,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Admin", value: "Admin" },
        { label: "User", value: "User" },
        { label: "Guest", value: "Guest" },
      ],
      render: (value) => (
        <Badge variant="outline" className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
        { label: "Pending", value: "pending" },
      ],
      render: (value) => (
        <Badge variant={statusVariant(value)} className="capitalize">
          {value}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString(),
    },
    {
      key: "lastLogin",
      label: "Last Login",
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleString() : "Never"),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, user) => (
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            toast.info(`View details for ${user.name}`);
          }}
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="heading-section">DataTable Component Test</h1>
          <p className="text-muted-foreground mt-2">
            Testing all features: search, filtering, sorting, pagination, export
          </p>
        </div>

        <DataTable
          columns={columns}
          data={data}
          total={total}
          loading={false}
          onQueryChange={setQuery}
          enableSearch={true}
          enableExport={true}
          enableDateRange={true}
          enableColumnFilters={true}
          rowKey="id"
          onRowClick={handleRowClick}
          searchPlaceholder="Search by name or email..."
          emptyMessage="No users found"
          pageSize={10}
        />

        {/* Debug Info */}
        <div className="mt-8 p-4 border rounded-lg bg-muted/50">
          <h3 className="font-semibold mb-2">Current Query State:</h3>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(query, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
