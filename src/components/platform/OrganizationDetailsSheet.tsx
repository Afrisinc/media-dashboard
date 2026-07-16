import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyableText } from "@/components/ui/copyable-text";
import { UpdateOrganizationDialog } from "@/components/platform/UpdateOrganizationDialog";
import {
  usePlatformOrganizationMembers,
  useRemovePlatformOrganizationMember,
} from "@/hooks/usePlatform";
import type { PlatformOrganization } from "@/types/platform";
import { Building2, Users, Trash2, Plus, Edit } from "lucide-react";
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
import { toast } from "sonner";

interface OrganizationDetailsSheetProps {
  organization: PlatformOrganization | null;
  isOpen: boolean;
  onClose: () => void;
  onAddMember?: () => void;
}

const statusVariant = (s?: string) =>
  s === "ACTIVE" ? "default" : s === "SUSPENDED" ? "destructive" : "secondary";

export function OrganizationDetailsSheet({
  organization,
  isOpen,
  onClose,
  onAddMember,
}: OrganizationDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<{
    memberId: string;
    memberEmail: string;
  } | null>(null);

  const { data: membersData, isLoading: membersLoading } =
    usePlatformOrganizationMembers(organization?.id || null);
  const removeMemMutation = useRemovePlatformOrganizationMember();

  const handleRemoveMember = async () => {
    if (!confirmRemove || !organization) return;
    try {
      await removeMemMutation.mutateAsync({
        organizationId: organization.id,
        userId: confirmRemove.memberId,
      });
      toast.success(`Member removed from ${organization.name}`);
    } catch {
      toast.error("Failed to remove member");
    }
    setConfirmRemove(null);
  };

  if (!organization) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle>{organization.name}</SheetTitle>
              <SheetDescription className="truncate">
                {organization.legal_name || "N/A"}
              </SheetDescription>
            </div>
            <Badge
              variant={statusVariant(organization.status)}
              className="flex-shrink-0"
            >
              {organization.status || "ACTIVE"}
            </Badge>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden mt-4"
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="details" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Members</span>
              {membersData && (
                <span className="ml-1 text-xs">
                  ({membersData.members.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="pr-4">
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">
                      Organization Information
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setUpdateDialogOpen(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">
                          Organization ID
                        </span>
                        <CopyableText text={organization.id} truncateAt={12} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-right break-words">
                          {organization.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Legal Name
                        </span>
                        <span className="text-right">
                          {organization.legal_name || "—"}
                        </span>
                      </div>

                      {organization.country && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Country</span>
                          <span className="text-right">
                            {organization.country}
                          </span>
                        </div>
                      )}

                      {organization.tax_id && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Tax ID</span>
                          <span className="text-right font-mono text-xs">
                            {organization.tax_id}
                          </span>
                        </div>
                      )}

                      {organization.org_email && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Email</span>
                          <span className="text-right break-words">
                            {organization.org_email}
                          </span>
                        </div>
                      )}

                      {organization.org_phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-right">
                            {organization.org_phone}
                          </span>
                        </div>
                      )}

                      {organization.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Location
                          </span>
                          <span className="text-right">
                            {organization.location}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariant(organization.status)}>
                          {organization.status || "ACTIVE"}
                        </Badge>
                      </div>

                      {organization.createdAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Created</span>
                          <span className="text-right text-xs">
                            {new Date(
                              organization.createdAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {organization.updatedAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Updated</span>
                          <span className="text-right text-xs">
                            {new Date(
                              organization.updatedAt,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {membersData?.members.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Members
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {membersData?.members.filter((m) => m.role === "OWNER")
                          .length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">Owners</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Members Tab */}
              <TabsContent value="members" className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={onAddMember}
                    disabled={!onAddMember}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>

                {membersLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : !membersData?.members.length ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No members in this organization
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {membersData.members.map((member) => (
                      <Card key={member.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            {/* Header with name and actions */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {[member.firstName, member.lastName]
                                    .filter(Boolean)
                                    .join(" ") || "Unknown"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {member.email || "No email"}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  setConfirmRemove({
                                    memberId: member.user_id,
                                    memberEmail: member.email || "Unknown",
                                  })
                                }
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>

                            {/* Badges row */}
                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary">{member.role}</Badge>
                              <Badge
                                variant={
                                  member.status === "ACTIVE"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {member.status || "ACTIVE"}
                              </Badge>
                            </div>

                            {/* Details row */}
                            {member.phone && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {member.phone && (
                                  <div>
                                    <p className="text-muted-foreground">
                                      Phone
                                    </p>
                                    <p className="font-medium">
                                      {member.phone}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>

      {/* Update Organization Dialog */}
      <UpdateOrganizationDialog
        organization={organization}
        isOpen={updateDialogOpen}
        onClose={() => setUpdateDialogOpen(false)}
      />

      {/* Confirm Remove Member Dialog */}
      <AlertDialog
        open={!!confirmRemove}
        onOpenChange={() => setConfirmRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{confirmRemove?.memberEmail}</strong> from this
              organization?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveMember}
              className="bg-destructive"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  );
}
