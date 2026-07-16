import { useAIPosts } from "@/hooks/useAIPosts";
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
import { format } from "date-fns";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Facebook,
  Instagram,
  ExternalLink,
  LayoutList,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: {
    label: "Draft",
    icon: FileText,
    className: "bg-muted text-muted-foreground border-muted",
  },
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
};

const PlatformIcon = ({ platform }: { platform: string }) => {
  if (platform === "both") {
    return (
      <div className="flex items-center gap-1">
        <Facebook className="w-4 h-4 text-blue-500" />
        <Instagram className="w-4 h-4 text-pink-500" />
      </div>
    );
  }
  if (platform === "facebook") {
    return <Facebook className="w-4 h-4 text-blue-500" />;
  }
  return <Instagram className="w-4 h-4 text-pink-500" />;
};

const PostsTable = () => {
  const { data: posts, isLoading, error } = useAIPosts(10); // Fetch latest 10 posts for table

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
              <CardDescription>
                {posts?.length || 0} total posts generated
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!posts || posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <Inbox className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No posts yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first AI-generated post using the form on the left.
              Your posts will appear here.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="font-semibold">Topic</TableHead>
                  <TableHead className="font-semibold">Platform</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Created</TableHead>
                  <TableHead className="font-semibold">Published</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post, index) => {
                  const status =
                    statusConfig[post.status as keyof typeof statusConfig] ||
                    statusConfig.draft;
                  const StatusIcon = status.icon;

                  return (
                    <TableRow
                      key={post.id}
                      className={cn(
                        "transition-colors",
                        index % 2 === 0 ? "bg-transparent" : "bg-muted/10",
                      )}
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {post.topic_name || post.topic}
                          </p>
                          {(post.fb_hashtags || post.insta_hashtags) && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {post.fb_hashtags || post.insta_hashtags}
                            </p>
                          )}
                          {(post.fb_url || post.insta_url) && (
                            <a
                              href={post.fb_url || post.insta_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Post
                            </a>
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
                            status.className,
                          )}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(post.created_at), "MMM d, yyyy")}
                        <br />
                        <span className="text-xs">
                          {format(new Date(post.created_at), "HH:mm")}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {post.published_at && post.published_at !== "null" ? (
                          <>
                            {format(new Date(post.published_at), "MMM d, yyyy")}
                            <br />
                            <span className="text-xs">
                              {format(new Date(post.published_at), "HH:mm")}
                            </span>
                          </>
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PostsTable;
