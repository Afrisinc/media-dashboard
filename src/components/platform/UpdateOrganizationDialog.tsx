import { useState, useEffect } from "react";
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
import { useUpdatePlatformOrganization } from "@/hooks/usePlatform";
import type { PlatformOrganization } from "@/types/platform";
import { toast } from "sonner";

interface UpdateOrganizationDialogProps {
  organization: PlatformOrganization | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UpdateOrganizationDialog({
  organization,
  isOpen,
  onClose,
}: UpdateOrganizationDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    legal_name: "",
    country: "",
    tax_id: "",
    org_email: "",
    org_phone: "",
    location: "",
  });

  // Update form data when organization changes
  useEffect(() => {
    if (organization) {
      setFormData({
        name: organization.name || "",
        legal_name: organization.legal_name || "",
        country: organization.country || "",
        tax_id: organization.tax_id || "",
        org_email: organization.org_email || "",
        org_phone: organization.org_phone || "",
        location: organization.location || "",
      });
    }
  }, [organization, isOpen]);

  const updateMutation = useUpdatePlatformOrganization();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!organization) return;

    // Validate required fields
    if (
      !formData.name ||
      !formData.legal_name ||
      !formData.country ||
      !formData.tax_id
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        organizationId: organization.id,
        updateData: formData,
      });
      toast.success(`Organization "${formData.name}" updated successfully`);
      onClose();
    } catch {
      toast.error("Failed to update organization");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Organization</DialogTitle>
          <DialogDescription>Edit organization details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Acme Corporation"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legal_name">Legal Name *</Label>
            <Input
              id="legal_name"
              name="legal_name"
              placeholder="Acme Corp Ltd."
              value={formData.legal_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              name="country"
              placeholder="US"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax_id">Tax ID *</Label>
            <Input
              id="tax_id"
              name="tax_id"
              placeholder="12-3456789"
              value={formData.tax_id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org_email">Email</Label>
            <Input
              id="org_email"
              name="org_email"
              type="email"
              placeholder="contact@acmecorp.com"
              value={formData.org_email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="org_phone">Phone</Label>
            <Input
              id="org_phone"
              name="org_phone"
              placeholder="+1 (555) 123-4567"
              value={formData.org_phone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              placeholder="San Francisco, CA"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
