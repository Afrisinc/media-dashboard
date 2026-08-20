export type PostFormatName = "post" | "story" | "single";

export type PostDraftStatus =
  | "drafting"
  | "rendered"
  | "awaiting_approval"
  | "approved"
  | "scheduled"
  | "rejected"
  | "failed";

export interface AuditFinding {
  slide: number;
  rule: string;
  detail: string;
  severity: "error" | "warning";
}

export interface AuditReport {
  slug: string;
  format: PostFormatName;
  width: number;
  height: number;
  slides: Array<{
    index: number;
    filename: string;
    surface: string;
    headline_size: number;
    bytes: number;
  }>;
  findings: AuditFinding[];
  passed: boolean;
}

export interface PostDraft {
  id: string;
  userId: string;
  topic: string;
  format: PostFormatName;
  serviceLine: string | null;
  offer: string | null;
  audience: string | null;
  status: PostDraftStatus;
  caption: string | null;
  hashtags: string[];
  claims: string[];
  claimsApproved: boolean;
  auditReport: AuditReport | null;
  auditPassed: boolean;
  slideUrls: string[];
  approvedBy: string | null;
  approvedAt: string | null;
  scheduledAt: string | null;
  socialPostIds: string[];
  aiProvider: string | null;
  aiModel: string | null;
  generationTries: number;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PostDraftPage {
  items: PostDraft[];
  total: number;
  page: number;
  limit: number;
}

export interface PostBrief {
  topic: string;
  format?: PostFormatName;
  slideCount?: number;
  serviceLine?: string;
  offer?: string;
  audience?: string;
  /** Publish to every live page in this brand. Omit for the workspace default. */
  groupId?: string;
}

export interface SchedulePayload {
  platform?: string;
  pageId?: string;
  groupId?: string;
  scheduledAt?: string;
}

export const FORMAT_LABELS: Record<PostFormatName, string> = {
  post: "Carousel",
  single: "Single post",
  story: "Story",
};

export const STATUS_LABELS: Record<PostDraftStatus, string> = {
  drafting: "Drafting",
  rendered: "Needs a fix",
  awaiting_approval: "In review",
  approved: "Approved",
  scheduled: "Scheduled",
  rejected: "Rejected",
  failed: "Failed",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const STATUS_VARIANT: Record<PostDraftStatus, BadgeVariant> = {
  drafting: "secondary",
  rendered: "outline",
  awaiting_approval: "default",
  approved: "default",
  scheduled: "default",
  rejected: "secondary",
  failed: "destructive",
};

export function isReviewable(draft: PostDraft): boolean {
  return draft.status === "awaiting_approval" || draft.status === "rendered";
}

export function blockingFindings(draft: PostDraft): AuditFinding[] {
  return (draft.auditReport?.findings ?? []).filter(
    (finding) => finding.severity === "error",
  );
}
