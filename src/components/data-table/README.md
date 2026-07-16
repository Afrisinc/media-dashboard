# DataTable Component

A professional, reusable, and feature-rich data table component for enterprise applications.

## Features

✅ **Server-side pagination** - Optimized for large datasets
✅ **Column sorting** - Ascending/Descending sort
✅ **Global search** - Debounced search across data
✅ **Column filters** - Select, multi-select, date range, etc.
✅ **Date range filtering** - Presets + custom range
✅ **Export functionality** - CSV, Excel, PDF
✅ **Loading states** - Skeleton loaders
✅ **Empty states** - Configurable empty message
✅ **Error handling** - Graceful error display
✅ **Responsive design** - Mobile-friendly
✅ **TypeScript** - Fully typed

## Basic Usage

```tsx
import { DataTable, type ColumnConfig } from "@/components/data-table";
import type { User } from "@/types/user";

const columns: ColumnConfig<User>[] = [
  {
    key: "id",
    label: "User ID",
    sortable: true,
  },
  {
    key: "email",
    label: "Email",
    sortable: true,
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
    ],
  },
];

function UsersPage() {
  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useUsers(query);

  return (
    <DataTable
      columns={columns}
      data={data?.users || []}
      total={data?.total || 0}
      loading={isLoading}
      onQueryChange={setQuery}
      enableSearch={true}
      enableExport={true}
      rowKey="id"
    />
  );
}
```

## Column Configuration

### Basic Column

```tsx
{
  key: "email",
  label: "Email",
  sortable: true,
  width: "200px",
  align: "left",
}
```

### Column with Custom Render

```tsx
{
  key: "status",
  label: "Status",
  render: (value, row) => (
    <Badge variant={value === "active" ? "default" : "destructive"}>
      {value}
    </Badge>
  ),
}
```

### Filterable Column

```tsx
{
  key: "role",
  label: "Role",
  filterable: true,
  filterType: "select",
  filterOptions: [
    { label: "Admin", value: "admin" },
    { label: "User", value: "user" },
    { label: "Guest", value: "guest" },
  ],
}
```

### Column with Copyable Text (IDs, UUIDs, etc.)

For displaying truncated text with copy-to-clipboard functionality:

```tsx
import { CopyableText } from "@/components/ui/copyable-text";

{
  key: "id",
  label: "ID",
  sortable: true,
  render: (value) => <CopyableText text={value} truncateAt={8} />,
},
```

**Features:**

- Displays first 8 characters + "..."
- Shows full text on hover (tooltip)
- Copy button appears on hover
- Click to copy full text to clipboard
- Success toast notification

**Props:**

- `text` - The full text to display and copy
- `truncateAt` - Number of characters to show (default: 8)
- `showTooltip` - Show full text on hover (default: true)
- `mono` - Use monospace font (default: true)
- `copyMessage` - Custom success message
- `showCopy` - Show copy button (default: true)

**Example with custom message:**

```tsx
{
  key: "apiKey",
  label: "API Key",
  render: (value) => (
    <CopyableText
      text={value}
      truncateAt={16}
      copyMessage="API key copied!"
    />
  ),
}
```

## Props

### DataTable Props

| Prop                  | Type              | Default           | Description              |
| --------------------- | ----------------- | ----------------- | ------------------------ |
| `columns`             | `ColumnConfig[]`  | **required**      | Column definitions       |
| `data`                | `T[]`             | **required**      | Table data               |
| `total`               | `number`          | **required**      | Total number of records  |
| `loading`             | `boolean`         | `false`           | Loading state            |
| `error`               | `Error \| null`   | `null`            | Error object             |
| `onQueryChange`       | `(query) => void` | **required**      | Query change handler     |
| `enableSearch`        | `boolean`         | `true`            | Enable global search     |
| `enableExport`        | `boolean`         | `false`           | Enable export dropdown   |
| `enableDateRange`     | `boolean`         | `false`           | Enable date range filter |
| `enableColumnFilters` | `boolean`         | `false`           | Enable column filters    |
| `rowKey`              | `string`          | **required**      | Unique row identifier    |
| `onRowClick`          | `(row) => void`   | -                 | Row click handler        |
| `emptyMessage`        | `string`          | `"No data found"` | Empty state message      |
| `searchPlaceholder`   | `string`          | `"Search..."`     | Search input placeholder |
| `pageSize`            | `number`          | `10`              | Records per page         |

### ColumnConfig

| Prop            | Type                            | Description                      |
| --------------- | ------------------------------- | -------------------------------- |
| `key`           | `string`                        | Column key (must match data key) |
| `label`         | `string`                        | Column header label              |
| `sortable`      | `boolean`                       | Enable sorting                   |
| `filterable`    | `boolean`                       | Enable filtering                 |
| `filterType`    | `FilterType`                    | Filter type (select, date, etc.) |
| `filterOptions` | `FilterOption[]`                | Options for select filter        |
| `render`        | `(value, row) => ReactNode`     | Custom cell renderer             |
| `width`         | `string`                        | Column width (CSS value)         |
| `align`         | `"left" \| "center" \| "right"` | Text alignment                   |

## Query Parameters

The component emits a `DataTableQuery` object:

```tsx
{
  page: number,
  limit: number,
  search?: string,
  sort_by?: string,
  sort_order?: "asc" | "desc",
  filters?: Record<string, any>,
  start_date?: string,
  end_date?: string,
}
```

## Server-Side Integration

The backend should accept these query parameters and return:

```json
{
  "success": true,
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 100,
      "totalPages": 10
    }
  }
}
```

## Export Functionality

To enable export:

```tsx
<DataTable
  enableExport={true}
  onExport={(format) => {
    // Call export API endpoint
    const url = `/api/users/export?format=${format}&search=${query.search}`;
    window.open(url, "_blank");
  }}
/>
```

## Date Range Filter

```tsx
<DataTable
  enableDateRange={true}
  onQueryChange={(query) => {
    // query.start_date and query.end_date will be set
    fetchData({
      ...query,
      start_date: query.start_date,
      end_date: query.end_date,
    });
  }}
/>
```

## Best Practices

1. **Always memoize columns** to prevent unnecessary re-renders
2. **Use server-side pagination** for large datasets
3. **Implement debounced search** (already built-in)
4. **Handle loading and error states**
5. **Provide meaningful empty messages**
6. **Use proper TypeScript types**

## Examples

See `/src/pages/platform/UsersNew.tsx` for a complete implementation example.

## Components Included

- `<DataTable />` - Main table component
- `<FilterBar />` - Search and filters
- `<ExportDropdown />` - Export functionality

## TypeScript Support

Fully typed with TypeScript generics:

```tsx
import type { User } from "@/types/user";

<DataTable<User> columns={columns} data={users} rowKey="id" />;
```
