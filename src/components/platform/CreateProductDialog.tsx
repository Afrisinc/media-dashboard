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
import { Textarea } from "@/components/ui/textarea";
import { useCreateProduct } from "@/hooks/usePlatform";
import { toast } from "sonner";

interface CreateProductDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductDialog({
  isOpen,
  onClose,
}: CreateProductDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });

  const createMutation = useCreateProduct();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.code) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
      });
      toast.success("Product created successfully");
      setFormData({ name: "", code: "", description: "" });
      onClose();
    } catch (error: unknown) {
      console.error("Error creating product:", error);

      const err = error as { message?: string; resp_msg?: string };
      const errorMessage =
        err?.message || err?.resp_msg || "Failed to create product";
      toast.error(errorMessage);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Add a new product to the platform
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Analytics Service"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Product Code *</Label>
            <Input
              id="code"
              placeholder="e.g., analytics"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  code: e.target.value.toLowerCase(),
                }))
              }
              required
            />
            <p className="text-xs text-muted-foreground">
              Unique identifier for the product (lowercase, no spaces)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Optional description of the product"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
