import { useState } from "react";
import { Eye, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DataTable,
  type ColumnConfig,
  type DataTableQuery,
} from "@/components/data-table";
import { CopyableText } from "@/components/ui/copyable-text";
import { AccountDetailsSheet } from "@/components/platform/AccountDetailsSheet";
import { usePlatformAccounts } from "@/hooks/usePlatform";
import type { PlatformAccount } from "@/types/platform";

export default function PlatformAccounts() {
  const [query, setQuery] = useState<DataTableQuery>({
    page: 1,
    limit: 10,
    search: "",
    filters: {},
  });

  const [selectedAccount, setSelectedAccount] =
    useState<PlatformAccount | null>(null);
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);

  const handleAccountClick = (account: PlatformAccount) => {
    setSelectedAccount(account);
    setDetailsSheetOpen(true);
  };

  // Convert DataTable query to platform service params
  const params = {
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };

  const { data, isLoading, error } = usePlatformAccounts(params);

  // Define columns
  const columns: ColumnConfig<PlatformAccount>[] = [
    {
      key: "id",
      label: "Account ID",
      sortable: true,
      render: (value) => <CopyableText text={value} truncateAt={8} />,
    },
    {
      key: "type",
      label: "Type",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Individual", value: "INDIVIDUAL" },
        { label: "Organization", value: "ORGANIZATION" },
      ],
      render: (value) => <Badge variant="outline">{value}</Badge>,
    },
    {
      key: "owner",
      label: "Owner",
      render: (_, account) => {
        const ownerName = account.owner
          ? [account.owner.firstName, account.owner.lastName]
              .filter(Boolean)
              .join(" ")
          : "—";
        return ownerName;
      },
    },
    {
      key: "owner",
      label: "Email",
      render: (_, account) => account.owner?.email || "—",
    },
    {
      key: "products",
      label: "Products",
      render: (_, account) => (
        <div className="flex gap-1 flex-wrap">
          {account.products && account.products.length > 0 ? (
            account.products.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1 text-xs"
                title={`${p.product?.name || "Unknown"} (${p.product?.code || p.product_id})`}
              >
                <span className="font-medium">
                  {p.product?.name || "Unknown"}
                </span>
                <Badge variant="outline" className="text-xs">
                  {p.plan}
                </Badge>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">No products</span>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => (value ? new Date(value).toLocaleDateString() : "—"),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, account) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleAccountClick(account);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Accounts Management</h1>
          <p className="text-muted-foreground">
            View and manage platform accounts
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.meta.total || 0}
        loading={isLoading}
        error={error as Error}
        onQueryChange={setQuery}
        enableSearch={false}
        enableExport={true}
        enableDateRange={false}
        enableColumnFilters={true}
        rowKey="id"
        emptyMessage="No accounts found"
        pageSize={10}
      />

      {/* Account Details Sheet */}
      <AccountDetailsSheet
        account={selectedAccount}
        isOpen={detailsSheetOpen}
        onClose={() => setDetailsSheetOpen(false)}
      />
    </div>
  );
}
