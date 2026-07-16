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
import { OrganizationDetailsSheet } from "@/components/platform/OrganizationDetailsSheet";
import { CreateOrganizationDialog } from "@/components/platform/CreateOrganizationDialog";
import { AddMemberDialog } from "@/components/platform/AddMemberDialog";
import { usePlatformOrganizations } from "@/hooks/usePlatform";
import type { PlatformOrganization } from "@/types/platform";

export default function PlatformOrganizations() {
  const [query, setQuery] = useState<DataTableQuery>({
    page: 1,
    limit: 10,
    search: "",
    filters: {},
  });

  const [selectedOrg, setSelectedOrg] = useState<PlatformOrganization | null>(
    null,
  );
  const [detailsSheetOpen, setDetailsSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false);

  const handleOrgClick = (org: PlatformOrganization) => {
    setSelectedOrg(org);
    setDetailsSheetOpen(true);
  };

  // Convert DataTable query to platform service params
  const params = {
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };

  const { data, isLoading, error } = usePlatformOrganizations(params);

  const statusVariant = (s?: string) =>
    s === "ACTIVE"
      ? "default"
      : s === "SUSPENDED"
        ? "destructive"
        : "secondary";

  // Define columns
  const columns: ColumnConfig<PlatformOrganization>[] = [
    {
      key: "id",
      label: "Organization ID",
      sortable: true,
      render: (value) => <CopyableText text={value} truncateAt={8} />,
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "legal_name",
      label: "Legal Name",
      sortable: true,
      render: (value) => value || "—",
    },
    {
      key: "country",
      label: "Country",
      sortable: true,
      render: (value) => value || "—",
    },
    {
      key: "tax_id",
      label: "Tax ID",
      render: (value) => value || "—",
    },
    {
      key: "org_email",
      label: "Email",
      render: (value) => value || "—",
    },
    {
      key: "org_phone",
      label: "Phone",
      render: (value) => value || "—",
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
      filterType: "select",
      filterOptions: [
        { label: "Active", value: "ACTIVE" },
        { label: "Suspended", value: "SUSPENDED" },
      ],
      render: (value) => (
        <Badge variant={statusVariant(value)}>{value || "ACTIVE"}</Badge>
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
      render: (_, org) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOrgClick(org);
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
          <h1 className="text-2xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage platform organizations and their members
          </p>
        </div>
        <Button size="lg" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Organization
        </Button>
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
        emptyMessage="No organizations found"
        pageSize={10}
      />

      {/* Organization Details Sheet */}
      <OrganizationDetailsSheet
        organization={selectedOrg}
        isOpen={detailsSheetOpen}
        onClose={() => setDetailsSheetOpen(false)}
        onAddMember={() => setAddMemberDialogOpen(true)}
      />

      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />

      {/* Add Member Dialog */}
      <AddMemberDialog
        organization={selectedOrg}
        isOpen={addMemberDialogOpen}
        onClose={() => setAddMemberDialogOpen(false)}
      />
    </div>
  );
}
