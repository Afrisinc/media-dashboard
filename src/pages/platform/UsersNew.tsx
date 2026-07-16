import { useState } from "react";
import { Eye, Ban, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DataTable,
  type ColumnConfig,
  type DataTableQuery,
} from "@/components/data-table";
import { CopyableText } from "@/components/ui/copyable-text";
import {
  usePlatformUsers,
  useSuspendUser,
  useReactivateUser,
} from "@/hooks/usePlatform";
import type { PlatformUser } from "@/types/platform";
import { toast } from "sonner";

export default function UsersNew() {
  const [query, setQuery] = useState<DataTableQuery>({
    page: 1,
    limit: 10,
    search: "",
    filters: {},
  });

  const [selectedUser, setSelectedUser] = useState<PlatformUser | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    user: PlatformUser;
    action: "suspend" | "reactivate";
  } | null>(null);

  // Convert DataTable query to platform service params
  const params = {
    search: query.search,
    status: query.filters?.status || "ALL",
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  };

  const { data, isLoading, error } = usePlatformUsers(params);
  const suspendMutation = useSuspendUser();
  const reactivateMutation = useReactivateUser();

  const statusVariant = (s: string) =>
    s === "ACTIVE"
      ? "default"
      : s === "SUSPENDED"
        ? "destructive"
        : "secondary";

  const handleAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.action === "suspend") {
        await suspendMutation.mutateAsync(confirmAction.user.id);
        toast.success(`User ${confirmAction.user.email} suspended`);
      } else {
        await reactivateMutation.mutateAsync(confirmAction.user.id);
        toast.success(`User ${confirmAction.user.email} reactivated`);
      }
    } catch {
      toast.error("Action failed");
    }
    setConfirmAction(null);
  };

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    // Implement export logic here
    // This should call an API endpoint with current query params
    toast.success(`Exporting as ${format.toUpperCase()}...`);
  };

  // Define columns
  const columns: ColumnConfig<PlatformUser>[] = [
    {
      key: "id",
      label: "User ID",
      sortable: true,
      render: (value) => <CopyableText text={value} truncateAt={8} />,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "fullName",
      label: "Name",
      sortable: true,
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
        { label: "Pending", value: "PENDING" },
      ],
      render: (value) => <Badge variant={statusVariant(value)}>{value}</Badge>,
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
      render: (value) =>
        value ? new Date(value).toLocaleDateString() : "Never",
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_, user) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedUser(user);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {user.status === "ACTIVE" ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmAction({ user, action: "suspend" });
              }}
            >
              <Ban className="h-4 w-4 text-destructive" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmAction({ user, action: "reactivate" });
              }}
            >
              <CheckCircle className="h-4 w-4 text-secondary" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">View and manage platform users</p>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        total={data?.meta.total || 0}
        loading={isLoading}
        error={error as Error}
        onQueryChange={setQuery}
        enableSearch={true}
        enableExport={true}
        enableDateRange={false}
        enableColumnFilters={true}
        rowKey="id"
        searchPlaceholder="Search by email or name..."
        emptyMessage="No users found"
        pageSize={10}
      />

      {/* User Detail Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              Full details for {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono">{selectedUser.id}</span>
                <span className="text-muted-foreground">Email</span>
                <span>{selectedUser.email}</span>
                <span className="text-muted-foreground">Name</span>
                <span>{selectedUser.fullName || "—"}</span>
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant={statusVariant(selectedUser.status)}
                  className="w-fit"
                >
                  {selectedUser.status}
                </Badge>
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(selectedUser.createdAt).toLocaleString()}</span>
                <span className="text-muted-foreground">Last Login</span>
                <span>
                  {selectedUser.lastLogin
                    ? new Date(selectedUser.lastLogin).toLocaleString()
                    : "Never"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedUser(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Action */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.action === "suspend"
                ? "Suspend User"
                : "Reactivate User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {confirmAction?.action}{" "}
              <strong>{confirmAction?.user.email}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>
              {confirmAction?.action === "suspend" ? "Suspend" : "Reactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
