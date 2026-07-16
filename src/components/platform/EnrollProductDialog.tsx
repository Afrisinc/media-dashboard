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
import { useEnrollAccountInProduct } from "@/hooks/usePlatform";
import type { PlatformAccount } from "@/types/platform";
import { toast } from "sonner";

interface EnrollProductDialogProps {
  account: PlatformAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

type Plan = "FREE" | "PRO" | "ENTERPRISE";

export function EnrollProductDialog({
  account,
  isOpen,
  onClose,
}: EnrollProductDialogProps) {
  const [formData, setFormData] = useState({
    product_code: "",
    plan: "FREE" as Plan,
  });

  const enrollMutation = useEnrollAccountInProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.product_code || !account) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await enrollMutation.mutateAsync({
        accountId: account.id,
        productData: {
          product_code: formData.product_code,
          plan: formData.plan,
        },
      });
      toast.success(`Account enrolled in product successfully`);
      setFormData({
        product_code: "",
        plan: "FREE",
      });
      onClose();
    } catch {
      toast.error("Failed to enroll account in product");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Enroll in Product</DialogTitle>
          <DialogDescription>
            Add a product to {account?.owner?.firstName || "this account"}'s
            enrollment
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product_code">Product Code *</Label>
            <Input
              id="product_code"
              placeholder="e.g., notify, auth, vpn"
              value={formData.product_code}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  product_code: e.target.value,
                }))
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the product code (e.g., notify, auth, vpn)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan *</Label>
            <Select
              value={formData.plan}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, plan: value as Plan }))
              }
            >
              <SelectTrigger id="plan">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FREE">Free</SelectItem>
                <SelectItem value="PRO">Pro</SelectItem>
                <SelectItem value="ENTERPRISE">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? "Enrolling..." : "Enroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
