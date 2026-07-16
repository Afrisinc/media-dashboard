import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddPlatformOrganizationMember } from "@/hooks/usePlatform";
import type { PlatformOrganization } from "@/types/platform";
import { toast } from "sonner";

interface AddMemberDialogProps {
  organization: PlatformOrganization | null;
  isOpen: boolean;
  onClose: () => void;
}

type Role = "OWNER" | "ADMIN" | "MEMBER";

export function AddMemberDialog({
  organization,
  isOpen,
  onClose,
}: AddMemberDialogProps) {
  const [formData, setFormData] = useState({
    user_id: "",
    role: "MEMBER" as Role,
  });

  const addMemberMutation = useAddPlatformOrganizationMember();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.user_id || !organization) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await addMemberMutation.mutateAsync({
        organizationId: organization.id,
        memberData: {
          user_id: formData.user_id,
          role: formData.role,
        },
      });
      toast.success(`Member added to ${organization.name}`);
      setFormData({
        user_id: "",
        role: "MEMBER",
      });
      onClose();
    } catch {
      toast.error("Failed to add member");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
          <DialogDescription>
            Add a new member to {organization?.name || "organization"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user_id">User ID *</Label>
            <Input
              id="user_id"
              placeholder="usr-0001"
              value={formData.user_id}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, user_id: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, role: value as Role }))
              }
            >
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OWNER">Owner</SelectItem>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="MEMBER">Member</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={addMemberMutation.isPending}>
              {addMemberMutation.isPending ? "Adding..." : "Add Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
