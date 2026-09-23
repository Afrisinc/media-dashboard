import { useState } from "react";
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
  Eye,
  Edit2,
  Trash2,
  Send,
  Repeat,
  ZoomIn,
  Plus,
  Images,
  SearchX,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { MediaLightbox } from "./MediaLightbox";
import { DataTable, type ColumnConfig } from "@/components/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { ListSkeleton } from "@/components/ui/list-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaCard, MediaCardOverlayChip } from "@/components/ui/media-card";
import { useLayoutParam } from "@/hooks/useLayoutParam";
import { LayoutToggle } from "./LayoutToggle";
import { splitTrailingHashtags } from "@/lib/hashtags";
import { isVideoUrl } from "@/lib/media";
import { PostMediaPreview } from "./PostMediaPreview";

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

const PostStatusBadge = ({
  status,
  className,
}: {
  status: string;
  className?: string;
}) => {
  const entry = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = entry?.icon || Clock;

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1.5 w-fit font-medium border",
        entry?.className || "",
        className,
      )}
    >
      <StatusIcon className="w-3 h-3" />
      {entry?.label || "Unknown"}
    </Badge>
  );
};

const AiGeneratedMark = () => (
  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
    <Sparkles className="h-3 w-3" />
    AI generated
  </span>
);

const hasViewableImages = (post: SocialMediaPost) =>
  (post.mediaUrls ?? []).some((url) => !isVideoUrl(url, post.mediaType));

const whenLabel = (post: SocialMediaPost) => {
  if (post.publishedAt) {
    return `Published ${format(new Date(post.publishedAt), "MMM d, HH:mm")}`;
  }
  if (post.scheduledAt) {
    return `Scheduled ${format(new Date(post.scheduledAt), "MMM d, HH:mm")}`;
  }
  return `Created ${format(new Date(post.createdAt), "MMM d, HH:mm")}`;
};

const PAGE_SIZE = 12;

interface PostGalleryCardProps {
  post: SocialMediaPost;
  actions: React.ReactNode;
  onOpenMedia: () => void;
  onOpenDetails: () => void;
}

const PostGalleryCard = ({
  post,
  actions,
  onOpenMedia,
  onOpenDetails,
}: PostGalleryCardProps) => (
  <MediaCard
    media={<PostMediaPreview post={post} />}
    mediaLabel={
      hasViewableImages(post) ? "View images full size" : "View post details"
    }
    onMediaClick={onOpenMedia}
    topLeft={
      <PostStatusBadge
        status={post.status}
        className="bg-background/85 shadow-sm backdrop-blur"
      />
    }
    topRight={
      <MediaCardOverlayChip className="h-7 w-7">
        <PlatformIcon platform={post.platform} />
        <span className="sr-only">{post.platform}</span>
      </MediaCardOverlayChip>
    }
    title={post.message || "(No message)"}
    onTitleClick={onOpenDetails}
    meta={
      <>
        <PostFormatBadge postFormat={post.postFormat} />
        {post.aiGenerated && <AiGeneratedMark />}
      </>
    }
    caption={whenLabel(post)}
    footer={actions}
  />
);

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

interface PostsTableProps {
  onCreate?: () => void;
}

const PostsTable = ({ onCreate }: PostsTableProps = {}) => {
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
  const [lightboxPost, setLightboxPost] = useState<SocialMediaPost | null>(
    null,
  );
  const [layout, setLayout] = useLayoutParam();

  const [query, setQuery] = useState({
    page: 1,
    limit: PAGE_SIZE,
    search: "",
    filters: {} as Record<string, string>,
    sortBy: undefined as string | undefined,
    sortOrder: undefined as "asc" | "desc" | undefined,
  });

  const { data, isLoading, error } = useSocialMediaPosts({
    platform: query.filters.platform,
    status: query.filters.status,
    search: query.search || undefined,
    limit: query.limit,
    offset: (query.page - 1) * query.limit,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });
  const deletePostMutation = useDeleteSocialMediaPost();
  const publishPostMutation = usePublishScheduledPost();

  const posts = data?.posts || [];
  const total = data?.total || 0;
  const filtered = !!query.search || Object.values(query.filters).some(Boolean);

  const selectedCaption = splitTrailingHashtags(
    selectedPost?.message,
    selectedPost?.tags,
  );

  const openMedia = (post: SocialMediaPost) => {
    if (!hasViewableImages(post)) {
      setSelectedPost(post);
      return;
    }
    setLightboxPost(post);
    setCurrentImageIndex(0);
    setLightboxOpen(true);
  };

  const renderActions = (post: SocialMediaPost) => (
    <div className="flex justify-end gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setSelectedPost(post)}
        title="View details"
        aria-label="View details"
      >
        <Eye className="w-4 h-4" />
      </Button>
      {post.status === "pending" && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditingPost(post)}
            title="Edit post"
            aria-label="Edit post"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-emerald hover:text-emerald/80"
            onClick={() => {
              setPublishingPostId(post.id);
              publishPostMutation.mutate(post.id);
            }}
            disabled={
              publishingPostId === post.id && publishPostMutation.isPending
            }
            title="Publish now"
            aria-label="Publish now"
          >
            {publishingPostId === post.id && publishPostMutation.isPending ? (
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
          size="icon"
          className="h-8 w-8 text-amber hover:text-amber/80"
          onClick={() => {
            setPublishingPostId(post.id);
            publishPostMutation.mutate(post.id);
          }}
          disabled={
            publishingPostId === post.id && publishPostMutation.isPending
          }
          title="Retry publish"
          aria-label="Retry publish"
        >
          {publishingPostId === post.id && publishPostMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      )}
      {post.status === "published" && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:text-primary/80"
          onClick={() => setRepostingPost(post)}
          title="Repost"
          aria-label="Repost"
        >
          <Repeat className="w-4 h-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-destructive hover:text-destructive"
        onClick={() => setDeleteConfirmPost(post)}
        disabled={deletePostMutation.isPending}
        title="Delete post"
        aria-label="Delete post"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );

  const columns: ColumnConfig<SocialMediaPost>[] = [
    {
      key: "message",
      label: "Post",
      render: (_value, post) => (
        <div className="flex max-w-sm items-start gap-3">
          <button
            type="button"
            onClick={() => openMedia(post)}
            className="h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={
              hasViewableImages(post)
                ? "View images full size"
                : "View post details"
            }
          >
            <PostMediaPreview post={post} variant="thumb" />
          </button>
          <div className="min-w-0 space-y-1">
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
            {post.aiGenerated && <AiGeneratedMark />}
          </div>
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
      hideBelow: "2xl",
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
      render: (_value, post) => <PostStatusBadge status={post.status} />,
    },
    {
      key: "createdAt",
      hideBelow: "2xl",
      label: "Created",
      sortable: true,
      render: (_value, post) => <DateTimeCell value={post.createdAt} />,
    },
    {
      key: "scheduledAt",
      label: "Scheduled",
      sortable: true,
      render: (_value, post) => <DateTimeCell value={post.scheduledAt} />,
    },
    {
      key: "publishedAt",
      label: "Published",
      sortable: true,
      render: (_value, post) => <DateTimeCell value={post.publishedAt} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      mobilePlacement: "footer",
      render: (_value, post) => renderActions(post),
    },
  ];

  return (
    <Card className="border-border/50">
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {isLoading ? (
            <Skeleton className="h-4 w-20" />
          ) : (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {`${total.toLocaleString()} ${total === 1 ? "post" : "posts"}${filtered ? " match" : ""}`}
            </p>
          )}
          <LayoutToggle value={layout} onChange={setLayout} />
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
              sortBy: next.sort_by,
              sortOrder: next.sort_order,
            })
          }
          enableSearch
          enableColumnFilters
          rowKey="id"
          searchPlaceholder="Search posts by message, caption or link..."
          emptyMessage="No posts yet. Create your first post using the form above."
          emptyState={
            filtered ? (
              <EmptyState
                icon={SearchX}
                title="No posts match"
                description="Try a different search, or clear the platform and status filters."
              />
            ) : (
              <EmptyState
                icon={Images}
                title="No posts yet"
                description="Posts you publish or schedule show up here with their images."
                action={
                  onCreate && (
                    <Button onClick={onCreate}>
                      <Plus className="mr-1.5 h-4 w-4" />
                      Create post
                    </Button>
                  )
                }
              />
            )
          }
          pageSize={PAGE_SIZE}
          mobileLayout="cards"
          cardsBelow="xl"
          chrome="plain"
          loadingSkeleton={
            <ListSkeleton rows={6} thumb label="Loading posts" />
          }
          layout={layout === "grid" ? "grid" : "table"}
          renderGridItem={(post) => (
            <PostGalleryCard
              post={post}
              actions={renderActions(post)}
              onOpenMedia={() => openMedia(post)}
              onOpenDetails={() => setSelectedPost(post)}
            />
          )}
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
        <DialogContent className="max-w-2xl">
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
                          onClick={() => {
                            setLightboxPost(selectedPost);
                            setLightboxOpen(true);
                          }}
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
                              type="button"
                              aria-label="Previous image"
                              onClick={() =>
                                setCurrentImageIndex((prev) =>
                                  prev === 0
                                    ? selectedPost.mediaUrls.length - 1
                                    : prev - 1,
                                )
                              }
                              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              type="button"
                              aria-label="Next image"
                              onClick={() =>
                                setCurrentImageIndex((prev) =>
                                  prev === selectedPost.mediaUrls.length - 1
                                    ? 0
                                    : prev + 1,
                                )
                              }
                              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/85 p-2 text-foreground shadow-sm backdrop-blur transition hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>

                            {/* Dots Indicator */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                              {selectedPost.mediaUrls.map((_, idx) => (
                                <button
                                  key={`dot-${idx}`}
                                  type="button"
                                  aria-label={`Show image ${idx + 1}`}
                                  aria-current={idx === currentImageIndex}
                                  onClick={() => setCurrentImageIndex(idx)}
                                  className={cn(
                                    "h-2 w-2 rounded-full shadow-sm ring-1 ring-foreground/20 transition",
                                    idx === currentImageIndex
                                      ? "bg-background"
                                      : "bg-background/50 hover:bg-background/75",
                                  )}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
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
                    <PostStatusBadge status={selectedPost.status} />
                  </DetailField>
                </div>

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

                {selectedCaption.hashtags.length > 0 && (
                  <DetailField label="Hashtags">
                    <div className="flex flex-wrap gap-2">
                      {selectedCaption.hashtags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
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

                <DetailField label="Message">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {selectedCaption.body || "—"}
                  </p>
                </DetailField>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2 justify-end pt-4 border-t">
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
        images={lightboxPost?.mediaUrls ?? []}
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
          <div className="flex flex-wrap gap-2 justify-end pt-4">
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
