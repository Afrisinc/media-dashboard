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
  /** Instagram requires each Page to have a linked professional account. */
  requiresInstagramAccount?: boolean;
}

export function PageSelectionDialog({
  open,
  pages,
  selectedPageIds,
  onPageToggle,
  onConfirm,
  onCancel,
  isSubmitting = false,
  requiresInstagramAccount = false,
}: PageSelectionDialogProps) {
  const hasSelection = selectedPageIds.size > 0;

  const isEligible = (page: FacebookPage) =>
    !requiresInstagramAccount || !!page.instagramBusinessAccount;

  const eligibleCount = pages.filter(isEligible).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {requiresInstagramAccount
              ? "Select Instagram Accounts to Connect"
              : "Select Pages to Connect"}
          </DialogTitle>
          <DialogDescription>
            {requiresInstagramAccount
              ? "Instagram publishes through the Facebook Page it is linked to. Only Pages with a linked professional account can be connected."
              : "Choose which pages you want to connect to Afrisinc"}
          </DialogDescription>
        </DialogHeader>

        {pages.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            No pages found for your account
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-96 overflow-y-auto">
            {pages.map((page) => {
              const eligible = isEligible(page);
              const instagram = page.instagramBusinessAccount;

              return (
                <label
                  key={page.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border border-border transition-colors",
                    eligible
                      ? "hover:bg-inset cursor-pointer"
                      : "opacity-60 cursor-not-allowed",
                  )}
                >
                  <Checkbox
                    checked={selectedPageIds.has(page.id)}
                    onCheckedChange={() => onPageToggle(page.id)}
                    disabled={!eligible}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {requiresInstagramAccount && instagram?.username
                        ? `@${instagram.username}`
                        : page.name}
                    </p>
                    {requiresInstagramAccount ? (
                      <p className="text-xs text-muted-foreground">
                        {eligible
                          ? `via ${page.name}`
                          : `${page.name} — no Instagram professional account linked`}
                      </p>
                    ) : (
                      page.category && (
                        <p className="text-xs text-muted-foreground">
                          {page.category}
                        </p>
                      )
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {requiresInstagramAccount &&
          pages.length > 0 &&
          eligibleCount === 0 && (
            <p className="text-xs text-muted-foreground border-t border-border pt-3">
              None of your Pages have a linked Instagram professional account.
              In Instagram, switch the account to Business or Creator, then link
              it to a Facebook Page from Page settings.
            </p>
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
