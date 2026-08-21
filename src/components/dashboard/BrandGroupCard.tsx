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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PLATFORM_CATALOG } from "@/config/socialPlatforms";
import { useActiveAgentRun, useRunAutomationNow } from "@/hooks/useAutomation";
import {
  useDeleteAccountGroup,
  useRemoveAccountFromGroup,
  useSetGroupAccountActive,
  useUpdateAccountGroup,
} from "@/hooks/useAccountGroups";
import { cn } from "@/lib/utils";
import {
  describeCadence,
  groupTone,
  HOUSE_FRAMES,
  type AccountGroup,
} from "@/types/accountGroup";
import {
  Bot,
  CalendarClock,
  Loader2,
  Pencil,
  Play,
  Plus,
  Star,
  Trash2,
  Unplug,
} from "lucide-react";
import { useState } from "react";

interface BrandGroupCardProps {
  group: AccountGroup;
  onEdit: () => void;
  onAddPages: () => void;
}

export function BrandGroupCard({
  group,
  onEdit,
  onAddPages,
}: BrandGroupCardProps) {
  const update = useUpdateAccountGroup();
  const setActive = useSetGroupAccountActive();
  const removeAccount = useRemoveAccountFromGroup();
  const deleteGroup = useDeleteAccountGroup();
  const runNow = useRunAutomationNow();
  const { data: activeRun } = useActiveAgentRun();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const initials =
    group.name
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 2)
      .toUpperCase() || "BR";

  const canAutopilot = group.activeMemberCount > 0 && group.topics.length > 0;

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-start gap-3 border-b border-border/50 p-5">
        <span
          className={cn(
            "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
            groupTone(group.color),
          )}
        >
          {initials}
        </span>

        <div className="min-w-[140px] flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold">{group.name}</p>
            {group.isDefault && (
              <Badge variant="secondary" className="gap-1">
                <Star className="h-3 w-3" />
                Default
              </Badge>
            )}
            {group.autopilotEnabled && (
              <Badge className="gap-1">
                <Bot className="h-3 w-3" />
                Agents on
              </Badge>
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {group.description || "No description"}
          </p>
        </div>

        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            title="Edit this brand"
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit {group.name}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => setConfirmingDelete(true)}
            title="Delete this brand"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete {group.name}</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border/50 px-5 py-3 text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" />
          {describeCadence(group)}
        </span>
        <span className="text-dim-5">
          {group.postsPerRun} post{group.postsPerRun === 1 ? "" : "s"} per run ·{" "}
          {group.slideCount ?? HOUSE_FRAMES[group.defaultFormat] ?? 5} frames
        </span>
        <span className="ml-auto font-bold text-emerald">
          {group.activeMemberCount}/{group.members.length} live
        </span>
      </div>

      <div className="flex-1 space-y-1.5 p-5">
        {group.members.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No pages in this brand yet. Add one and it starts publishing here.
          </p>
        ) : (
          group.members.map((member) => {
            const catalog = PLATFORM_CATALOG[member.platform];
            const disconnected = !member.accountIsActive;

            return (
              <div
                key={member.accountId}
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-lg border border-border bg-inset px-3 py-2.5",
                  disconnected && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold",
                    catalog?.tone,
                  )}
                >
                  {catalog?.short ?? "??"}
                </span>
                <div className="min-w-[100px] flex-1">
                  <p className="truncate text-xs font-bold">
                    {member.pageName ?? member.pageId}
                  </p>
                  <p className="mt-0.5 text-[11px] text-dim-5">
                    {disconnected
                      ? "Disconnected — reconnect it in Settings"
                      : (catalog?.displayName ?? member.platform)}
                  </p>
                </div>

                <Switch
                  checked={member.isActive && !disconnected}
                  disabled={disconnected || setActive.isPending}
                  onCheckedChange={(isActive) =>
                    setActive.mutate({
                      id: group.id,
                      accountId: member.accountId,
                      isActive,
                    })
                  }
                  aria-label={`Publish to ${member.pageName ?? member.pageId}`}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 flex-shrink-0 p-0 text-muted-foreground hover:text-destructive"
                  disabled={removeAccount.isPending}
                  onClick={() =>
                    removeAccount.mutate({
                      id: group.id,
                      accountId: member.accountId,
                    })
                  }
                  title="Take this page out of the brand"
                >
                  <Unplug className="h-3.5 w-3.5" />
                  <span className="sr-only">
                    Remove {member.pageName ?? member.pageId} from {group.name}
                  </span>
                </Button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-5 py-3.5">
        {/* One brand on demand, rather than every switched-on brand at once. */}
        <Button
          size="sm"
          disabled={!canAutopilot || Boolean(activeRun) || runNow.isPending}
          onClick={() => runNow.mutate(group.id)}
          title={
            activeRun
              ? "A run is already going"
              : canAutopilot
                ? `Draft ${group.postsPerRun} post${group.postsPerRun === 1 ? "" : "s"} for ${group.name} now`
                : "Add topics and switch a page on first"
          }
        >
          {runNow.isPending ? (
            <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Play className="mr-1 h-3.5 w-3.5" />
          )}
          Run now
        </Button>

        <Button variant="outline" size="sm" onClick={onAddPages}>
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add pages
        </Button>

        {!group.isDefault && (
          <Button
            variant="ghost"
            size="sm"
            disabled={update.isPending}
            onClick={() =>
              update.mutate({ id: group.id, payload: { isDefault: true } })
            }
          >
            Make default
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-dim-5">
            {group.autopilotEnabled ? "Live" : "Paused"}
          </span>
          <Switch
            checked={group.autopilotEnabled}
            disabled={
              update.isPending || (!canAutopilot && !group.autopilotEnabled)
            }
            onCheckedChange={(autopilotEnabled) =>
              update.mutate({ id: group.id, payload: { autopilotEnabled } })
            }
            aria-label={`Let the agents run ${group.name}`}
          />
        </div>
      </div>

      {!canAutopilot && (
        <p className="border-t border-border/50 bg-gold/5 px-5 py-2.5 text-[11px] text-gold">
          {group.topics.length === 0
            ? "Add topics before the agents can run this brand."
            : "Switch on at least one page before the agents can run this brand."}
        </p>
      )}

      <AlertDialog open={confirmingDelete} onOpenChange={setConfirmingDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {group.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              The brand and its cadence go away. The {group.members.length}{" "}
              connected page
              {group.members.length === 1 ? "" : "s"} stay installed and can be
              grouped again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteGroup.mutate(group.id)}
            >
              Delete brand
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
