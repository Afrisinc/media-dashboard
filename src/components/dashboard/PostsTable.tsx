import { useSocialMediaPosts } from "@/hooks/useSocialMediaPosts";
import {
  useDeleteSocialMediaPost,
  useUpdateSocialMediaPost,
  usePublishScheduledPost,
} from "@/hooks/useSocialMediaPosting";
import { EditPostDialog } from "./EditPostDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Film,
  Newspaper,
  CheckCircle,
  XCircle,
  Loader2,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ExternalLink,
  LayoutList,
  Inbox,
  Eye,
  Edit2,
  Trash2,
  Send,
  ZoomIn,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PlatformIcon } from "@/components/ui/platform-icon";
import { MediaLightbox } from "./MediaLightbox";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-amber/10 text-amber border-amber/30",
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
  const { data, isLoading, error } = useSocialMediaPosts({
    limit: 10,
    offset: 0,
  });
  const deletePostMutation = useDeleteSocialMediaPost();
  const updatePostMutation = useUpdateSocialMediaPost();
  const publishPostMutation = usePublishScheduledPost();
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(
    null,
  );
  const [editingPost, setEditingPost] = useState<SocialMediaPost | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmPost, setDeleteConfirmPost] =
    useState<SocialMediaPost | null>(null);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const posts = data?.posts || [];
  const total = data?.total || 0;

  if (isLoading) {
    return (
      <Card className="border-border/50">
        <CardContent className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading posts...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="py-10 text-center">
          <XCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <p className="text-destructive font-medium">Failed to load posts</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please try again later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-muted">
              <LayoutList className="w-4 h-4 text-muted-foreground" />
            </div>
            <div>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>{total} total posts</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Inbox className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No posts yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first post using the form above. Your posts will
              appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Message</TableHead>
                  <TableHead className="font-semibold">Platform</TableHead>
                  <TableHead className="font-semibold">Format</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Published</TableHead>
                  <TableHead className="font-semibold text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => {
                  const status =
                    statusConfig[post.status as keyof typeof statusConfig];
                  const StatusIcon = status?.icon || Clock;
                  const statusClass = status?.className || "";

                  return (
                    <TableRow
                      key={post.id}
                      className={cn(
                        "transition-colors",
                        index % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                      )}
                    >
                      <TableCell>
                        <div className="space-y-1 max-w-xs">
                          <p className="font-medium text-foreground line-clamp-2">
                            {post.message || "(No message)"}
                          </p>
                          {post.link && (
                            <a
                              href={post.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {post.link.length > 30
                                ? `${post.link.slice(0, 30)}...`
                                : post.link}
                            </a>
                          )}
                          {post.aiGenerated && (
                            <Badge
                              variant="secondary"
                              className="w-fit text-xs"
                            >
                              AI Generated
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <PlatformIcon platform={post.platform} />
                          <span className="text-sm capitalize">
                            {post.platform}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <PostFormatBadge postFormat={post.postFormat} />
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1.5 w-fit font-medium border",
                            statusClass,
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status?.label || "Unknown"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {post.createdAt ? (
                          <>
                            {format(new Date(post.createdAt), "MMM d, yyyy")}
                            <br />
                            <span className="text-xs">
                              {format(new Date(post.createdAt), "HH:mm")}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {post.publishedAt ? (
                          <>
                            {format(new Date(post.publishedAt), "MMM d, yyyy")}
                            <br />
                            <span className="text-xs">
                              {format(new Date(post.publishedAt), "HH:mm")}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
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
                                onClick={() => {
                                  setEditingPost(post);
                                }}
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
                                publishingPostId === post.id &&
                                publishPostMutation.isPending
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
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
