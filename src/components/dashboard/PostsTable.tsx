import { useMemo, useState } from "react";
import { useSocialMediaPosts } from "@/hooks/useSocialMediaPosts";
import {
  useDeleteSocialMediaPost,
  usePublishScheduledPost,
} from "@/hooks/useSocialMediaPosting";
import { EditPostDialog } from "./EditPostDialog";
import { RepostDialog } from "./RepostDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Clock,
  Hourglass,
  Film,
  Newspaper,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  LayoutList,
  Eye,
  Edit2,
  Trash2,
  Send,
  Repeat,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { MediaLightbox } from "./MediaLightbox";
import { DataTable, type ColumnConfig } from "@/components/data-table";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber/10 text-amber border-amber/30",
  },
  in_review: {
    label: "Waiting for approval",
    icon: Hourglass,
    className: "bg-gold/12 text-gold border-gold/30",
  },
  published: {
    label: "Published",
    icon: CheckCircle,
    className: "bg-emerald/10 text-emerald border-emerald/30",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  deleted: {
    label: "Deleted",
    icon: XCircle,
    className: "bg-muted text-muted-foreground border-muted",
  },
};

const PLATFORM_FILTER_OPTIONS = [
  { label: "Facebook", value: "facebook" },
  { label: "Instagram", value: "instagram" },
  { label: "Twitter", value: "twitter" },
  { label: "LinkedIn", value: "linkedin" },
  { label: "TikTok", value: "tiktok" },
];

const STATUS_FILTER_OPTIONS = Object.entries(statusConfig).map(
  ([value, entry]) => ({ label: entry.label, value }),
);

const FORMAT_BADGES: Record<
  string,
  { label: string; icon: typeof Clock; className: string }
> = {
  feed: {
    label: "Feed",
    icon: Newspaper,
    className: "text-primary border-primary/30 bg-primary/10",
  },
  story: {
    label: "Story",
    icon: Clock,
    className: "text-indigo border-indigo/30 bg-indigo/10",
  },
  reel: {
    label: "Reel",
    icon: Film,
    className: "text-forest border-forest/30 bg-forest/10",
  },
};

const PostFormatBadge = ({ postFormat }: { postFormat?: string | null }) => {
  const entry = FORMAT_BADGES[postFormat ?? "feed"] ?? FORMAT_BADGES.feed;

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 w-fit font-medium border",
        entry.className,
      )}
    >
      <entry.icon className="w-3 h-3" />
      {entry.label}
    </Badge>
  );
};

interface DateTimeCellProps {
  value?: string | null;
}

const DateTimeCell = ({ value }: DateTimeCellProps) => {
  if (!value) {
    return <span className="text-muted-foreground/50">—</span>;
  }

  const date = new Date(value);

  return (
    <span className="text-sm text-muted-foreground whitespace-nowrap">
      {format(date, "MMM d, yyyy")}
      <br />
      <span className="text-xs">{format(date, "HH:mm")}</span>
    </span>
  );
};

interface DetailFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

const DetailField = ({ label, children, className }: DetailFieldProps) => (
  <div className={className}>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <div className="mt-1">{children}</div>
  </div>
);

const PostsTable = () => {
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(
    null,
  );
  const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);
  const [repostingPost, setRepostingPost] = useState<SocialMediaPost | null>(
    null,
  );
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmPost, setDeleteConfirmPost] =
    useState<SocialMediaPost | null>(null);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: "",
    filters: {} as Record<string, string>,
  });

  const { data, isLoading, error } = useSocialMediaPosts({
    platform: query.filters.platform,
    status: query.filters.status,
    search: query.search || undefined,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
  });
  const deletePostMutation = useDeleteSocialMediaPost();
  const publishPostMutation = usePublishScheduledPost();

  const posts = data?.posts || [];
  const total = data?.total || 0;

  const columns = useMemo<ColumnConfig<SocialMediaPost>[]>(
    () => [
      {
        key: "message",
        label: "Message",
        render: (_value, post) => (
          <div className="space-y-1 max-w-xs">
            <p className="font-medium text-foreground line-clamp-2">
              {post.message || "(No message)"}
            </p>
            {post.link && (
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                {post.link.length > 30
                  ? `${post.link.slice(0, 30)}...`
                  : post.link}
              </a>
            )}
            {post.aiGenerated && (
              <Badge variant="secondary" className="w-fit text-xs">
                AI Generated
              </Badge>
            )}
          </div>
        ),
      },
      {
        key: "platform",
        label: "Platform",
        filterable: true,
        filterType: "select",
        filterOptions: PLATFORM_FILTER_OPTIONS,
        render: (_value, post) => (
          <div className="flex items-center gap-2">
            <PlatformIcon platform={post.platform} />
            <span className="text-sm capitalize">{post.platform}</span>
          </div>
        ),
      },
      {
        key: "postFormat",
        label: "Format",
        render: (_value, post) => (
          <PostFormatBadge postFormat={post.postFormat} />
        ),
      },
      {
        key: "status",
        label: "Status",
        filterable: true,
        filterType: "select",
        filterOptions: STATUS_FILTER_OPTIONS,
        render: (_value, post) => {
          const status = statusConfig[post.status as keyof typeof statusConfig];
          const StatusIcon = status?.icon || Clock;

          return (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1.5 w-fit font-medium border",
                status?.className || "",
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {status?.label || "Unknown"}
            </Badge>
          );
        },
      },
      {
        key: "createdAt",
        label: "Created",
        render: (_value, post) => <DateTimeCell value={post.createdAt} />,
      },
      {
        key: "scheduledAt",
        label: "Scheduled",
        render: (_value, post) => <DateTimeCell value={post.scheduledAt} />,
      },
      {
        key: "publishedAt",
        label: "Published",
        render: (_value, post) => <DateTimeCell value={post.publishedAt} />,
      },
      {
        key: "actions",
        label: "Actions",
        align: "right",
        render: (_value, post) => (
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedPost(post)}
              title="View details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            {post.status === "pending" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPost(post)}
                  title="Edit post"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-emerald hover:text-emerald/80"
                  onClick={() => {
                    setPublishingPostId(post.id);
                    publishPostMutation.mutate(post.id);
                  }}
                  disabled={
                    publishingPostId === post.id &&
                    publishPostMutation.isPending
                  }
                  title="Publish now"
                >
                  {publishingPostId === post.id &&
                  publishPostMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </>
            )}
            {post.status === "failed" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-amber hover:text-amber/80"
                onClick={() => {
                  setPublishingPostId(post.id);
                  publishPostMutation.mutate(post.id);
                }}
                disabled={
                  publishingPostId === post.id && publishPostMutation.isPending
                }
                title="Retry publish"
              >
                {publishingPostId === post.id &&
                publishPostMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            )}
            {post.status === "published" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
                onClick={() => setRepostingPost(post)}
                title="Repost"
              >
                <Repeat className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setDeleteConfirmPost(post)}
              disabled={deletePostMutation.isPending}
              title="Delete post"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [publishingPostId, publishPostMutation, deletePostMutation.isPending],
  );

  return (
    <Card className="border-border/50">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-muted">
            <LayoutList className="w-4 h-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Recent Posts</h3>
            <p className="text-sm text-muted-foreground">{total} total posts</p>
          </div>
        </div>

        <DataTable<SocialMediaPost>
          columns={columns}
          data={posts}
          total={total}
          loading={isLoading}
          error={error as Error | null}
          onQueryChange={(next) =>
            setQuery({
              page: next.page,
              limit: next.limit,
              search: next.search || "",
              filters: next.filters || {},
            })
          }
          enableSearch
          enableColumnFilters
          rowKey="id"
          searchPlaceholder="Search posts by message, caption or link..."
          emptyMessage="No posts yet. Create your first post using the form above."
          pageSize={10}
        />
      </CardContent>

      {/* Post Details Modal */}
      <Dialog
        open={!!selectedPost}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPost(null);
            setCurrentImageIndex(0);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle>Post Details</DialogTitle>
                <DialogDescription>
                  {selectedPost.platform} •{" "}
                  {format(
                    new Date(selectedPost.createdAt),
                    "MMM d, yyyy HH:mm",
                  )}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Platform & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <DetailField label="Platform">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium capitalize">
                        {selectedPost.platform}
                      </span>
                      <PostFormatBadge postFormat={selectedPost.postFormat} />
                    </div>
                  </DetailField>
                  <DetailField label="Status">
                    <Badge variant="outline">{selectedPost.status}</Badge>
                  </DetailField>
                </div>

                <DetailField label="Message">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {selectedPost.message || "—"}
                  </p>
                </DetailField>

                {selectedPost.link && (
                  <DetailField label="Link">
                    <a
                      href={selectedPost.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1 break-all"
                    >
                      {selectedPost.link}
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </DetailField>
                )}

                {/* Media Carousel */}
                {selectedPost.mediaUrls &&
                  selectedPost.mediaUrls.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">
                        Media
                        {selectedPost.mediaUrls.length > 1 && (
                          <span className="text-xs text-muted-foreground/70 ml-2">
                            ({currentImageIndex + 1} of{" "}
                            {selectedPost.mediaUrls.length})
                          </span>
                        )}
                      </p>

                      {/* Image Display */}
                      <div className="relative bg-muted rounded-lg overflow-hidden group">
                        <button
                          type="button"
                          onClick={() => setLightboxOpen(true)}
                          className="w-full block relative cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
                          aria-label={`Open image ${currentImageIndex + 1} full size`}
                        >
                          <img
                            src={selectedPost.mediaUrls[currentImageIndex]}
                            alt={
                              selectedPost.altText ||
                              `Media ${currentImageIndex + 1}`
                            }
                            className="w-full max-h-[60vh] object-contain"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-overlay/40 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                            <ZoomIn className="w-8 h-8 text-background" />
                          </span>
                        </button>

                        {/* Navigation Arrows */}
                        {selectedPost.mediaUrls.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                setCurrentImageIndex((prev) =>
                                  prev === 0
                                    ? selectedPost.mediaUrls.length - 1
                                    : prev - 1,
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() =>
                                setCurrentImageIndex((prev) =>
                                  prev === selectedPost.mediaUrls.length - 1
                                    ? 0
                                    : prev + 1,
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full text-white transition"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                              {selectedPost.mediaUrls.map((_, idx) => (
                                <button
                                  key={`dot-${idx}`}
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={cn(
                                    "w-2 h-2 rounded-full transition",
                                    idx === currentImageIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/70",
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                {selectedPost.scheduledAt && (
                  <DetailField label="Scheduled For">
                    <p className="text-sm font-medium">
                      {format(
                        new Date(selectedPost.scheduledAt),
                        "MMM d, yyyy 'at' HH:mm",
                      )}
                    </p>
                  </DetailField>
                )}

                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <DetailField label="Hashtags">
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </Badge>
                      ))}
                    </div>
                  </DetailField>
                )}

                {selectedPost.status === "published" && (
                  <DetailField label="Engagement">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {(
                        [
                          ["Likes", selectedPost.likes],
                          ["Comments", selectedPost.comments],
                          ["Shares", selectedPost.shares],
                          ["Views", selectedPost.views],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="bg-muted p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground">
                            {label}
                          </p>
                          <p className="text-lg font-semibold">{value}</p>
                        </div>
                      ))}
                    </div>
                  </DetailField>
                )}

                {/* AI Generated */}
                {selectedPost.aiGenerated && (
                  <div className="bg-amber/10 border border-amber/30 rounded-lg p-3">
                    <p className="text-sm text-amber">
                      Generated by {selectedPost.aiProvider || "AI"}
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {selectedPost.status === "failed" &&
                  selectedPost.errorMessage && (
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                      <p className="text-sm text-destructive">
                        {selectedPost.errorMessage}
                      </p>
                    </div>
                  )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-4 border-t">
                {selectedPost.status === "pending" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingPost(selectedPost);
                      setSelectedPost(null);
                    }}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {selectedPost.status === "published" && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRepostingPost(selectedPost);
                      setSelectedPost(null);
                    }}
                  >
                    <Repeat className="w-4 h-4 mr-2" />
                    Repost
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteConfirmPost(selectedPost)}
                  disabled={deletePostMutation.isPending}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setSelectedPost(null)}>
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <EditPostDialog post={editingPost} onClose={() => setEditingPost(null)} />

      <RepostDialog
        post={repostingPost}
        onClose={() => setRepostingPost(null)}
      />

      <MediaLightbox
        images={selectedPost?.mediaUrls ?? []}
        index={currentImageIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        onIndexChange={setCurrentImageIndex}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmPost}
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmPost(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmPost(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteConfirmPost) {
                  deletePostMutation.mutate(deleteConfirmPost.id);
                  setSelectedPost(null);
                  setDeleteConfirmPost(null);
                }
              }}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PostsTable;
