import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FacebookPage } from "@/hooks/useSocialMediaIntegrations";

interface PageSelectionDialogProps {
  open: boolean;
  pages: FacebookPage[];
  selectedPageIds: Set<string>;
  onPageToggle: (pageId: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function PageSelectionDialog({
  open,
  pages,
  selectedPageIds,
  onPageToggle,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: PageSelectionDialogProps) {
  const hasSelection = selectedPageIds.size > 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Pages to Connect</DialogTitle>
          <DialogDescription>
            Choose which pages you want to connect to Afrisinc
          </DialogDescription>
        </DialogHeader>

        {pages.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No pages found for your account
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {pages.map((page) => (
              <label
                key={page.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-inset cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedPageIds.has(page.id)}
                  onCheckedChange={() => onPageToggle(page.id)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{page.name}</p>
                  {page.category && (
                    <p className="text-xs text-muted-foreground">
                      {page.category}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2.5 border-t border-border pt-4">
          <span className="flex-1 text-xs text-muted-foreground">
            {selectedPageIds.size === 0
              ? "Select at least one page"
              : `${selectedPageIds.size} page${selectedPageIds.size === 1 ? "" : "s"} selected`}
          </span>
          <Button variant="outline" disabled={isSubmitting} onClick={onCancel}>
            Cancel
          </Button>
          <Button disabled={!hasSelection || isSubmitting} onClick={onConfirm}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              "Connect Pages"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
