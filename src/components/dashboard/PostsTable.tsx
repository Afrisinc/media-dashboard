import { useSocialMediaPosts } from "@/hooks/useSocialMediaPosts";
import {
  useDeleteSocialMediaPost,
  useUpdateSocialMediaPost,
  usePublishScheduledPost,
} from "@/hooks/useSocialMediaPosting";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import type { SocialMediaPost } from "@/hooks/useSocialMediaPosts";
import { ChevronLeft, ChevronRight } from "lucide-react";

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    className:
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
  published: {
    label: "Published",
    icon: CheckCircle,
    className:
      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
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

const PlatformIcon = ({ platform }: { platform: string }) => {
  switch (platform) {
    case "facebook":
      return <Facebook className="w-4 h-4 text-blue-600" />;
    case "instagram":
      return <Instagram className="w-4 h-4 text-pink-500" />;
    case "twitter":
      return <Twitter className="w-4 h-4 text-blue-400" />;
    case "linkedin":
      return <Linkedin className="w-4 h-4 text-blue-700" />;
    default:
      return <LayoutList className="w-4 h-4 text-muted-foreground" />;
  }
};

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
  const [editMessage, setEditMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmPost, setDeleteConfirmPost] =
    useState<SocialMediaPost | null>(null);
  const [publishingPostId, setPublishingPostId] = useState<string | null>(null);

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
                                  setEditMessage(post.message || "");
                                }}
                                title="Edit post"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-600 hover:text-emerald-700"
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
                              className="text-orange-600 hover:text-orange-700"
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Platform
                    </label>
                    <p className="text-sm font-medium capitalize mt-1">
                      {selectedPost.platform}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <Badge className="mt-1" variant="outline">
                      {selectedPost.status}
                    </Badge>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Message
                  </label>
                  <p className="text-sm mt-2 whitespace-pre-wrap">
                    {selectedPost.message || "—"}
                  </p>
                </div>

                {/* Link */}
                {selectedPost.link && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Link
                    </label>
                    <a
                      href={selectedPost.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center gap-1 mt-2"
                    >
                      {selectedPost.link}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {/* Media Carousel */}
                {selectedPost.mediaUrls &&
                  selectedPost.mediaUrls.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground block mb-2">
                        Media
                        {selectedPost.mediaUrls.length > 1 && (
                          <span className="text-xs text-muted-foreground/70 ml-2">
                            ({currentImageIndex + 1} of{" "}
                            {selectedPost.mediaUrls.length})
                          </span>
                        )}
                      </label>

                      {/* Image Display */}
                      <div className="relative bg-muted rounded-lg overflow-hidden">
                        <img
                          src={selectedPost.mediaUrls[currentImageIndex]}
                          alt={
                            selectedPost.altText ||
                            `Media ${currentImageIndex + 1}`
                          }
                          className="w-full h-80 object-cover"
                        />

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

                {/* Scheduled */}
                {selectedPost.scheduledAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Scheduled For
                    </label>
                    <p className="text-sm font-medium mt-1">
                      {format(
                        new Date(selectedPost.scheduledAt),
                        "MMM d, yyyy 'at' HH:mm",
                      )}
                    </p>
                  </div>
                )}

                {/* Hashtags */}
                {selectedPost.tags && selectedPost.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Hashtags
                    </label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedPost.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement */}
                {selectedPost.status === "published" && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-3 block">
                      Engagement
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Likes</p>
                        <p className="text-lg font-semibold">
                          {selectedPost.likes}
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">
                          Comments
                        </p>
                        <p className="text-lg font-semibold">
                          {selectedPost.comments}
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Shares</p>
                        <p className="text-lg font-semibold">
                          {selectedPost.shares}
                        </p>
                      </div>
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-xs text-muted-foreground">Views</p>
                        <p className="text-lg font-semibold">
                          {selectedPost.views}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Generated */}
                {selectedPost.aiGenerated && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                    <p className="text-sm text-amber-600 dark:text-amber-400">
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
                      setEditMessage(selectedPost.message || "");
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

      {/* Edit Post Modal */}
      <Dialog
        open={!!editingPost}
        onOpenChange={(open) => {
          if (!open) {
            setEditingPost(null);
            setEditMessage("");
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your scheduled post before it's published.
            </DialogDescription>
          </DialogHeader>

          {editingPost && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Message</label>
                <textarea
                  className="w-full mt-2 p-3 border border-border rounded-lg bg-background text-foreground resize-none"
                  rows={4}
                  value={editMessage}
                  onChange={(e) => setEditMessage(e.target.value)}
                  placeholder="Enter your post message..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingPost(null);
                    setEditMessage("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    updatePostMutation.mutate(
                      {
                        postId: editingPost.id,
                        payload: {
                          content: {
                            message: editMessage,
                            tags: editingPost.tags,
                            link: editingPost.link,
                            description: editingPost.description,
                            caption: editingPost.caption,
                          },
                        },
                      },
                      {
                        onSuccess: () => {
                          setEditingPost(null);
                          setEditMessage("");
                        },
                      },
                    );
                  }}
                  disabled={updatePostMutation.isPending || !editMessage.trim()}
                >
                  {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
