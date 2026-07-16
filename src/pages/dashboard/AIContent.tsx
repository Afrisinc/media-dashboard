import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import CreatePostForm from "@/components/dashboard/CreatePostForm";
import PostsTable from "@/components/dashboard/PostsTable";
import { useAIPosts } from "@/hooks/useAIPosts";

const AIContent = () => {
  const { data: posts } = useAIPosts(100);

  const stats = {
    total: posts?.length || 0,
    published: posts?.filter((p) => p.status === "published").length || 0,
    pending: posts?.filter((p) => p.status === "pending").length || 0,
    failed: posts?.filter((p) => p.status === "failed").length || 0,
  };

  const statCards = [
    { label: "Total Posts", value: stats.total, icon: TrendingUp },
    { label: "Published", value: stats.published, icon: CheckCircle2 },
    { label: "Pending", value: stats.pending, icon: Clock },
    { label: "Failed", value: stats.failed, icon: AlertCircle },
  ];

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="heading-section">AI Content Studio</h1>
          <p className="text-secondary">
            Generate and manage AI-powered social media posts
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            className="border-border/50 hover:shadow-card transition-shadow duration-300"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold mt-2">{stat.value}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted">
                  <stat.icon className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CreatePostForm />
        </div>
        <div className="lg:col-span-2">
          <PostsTable />
        </div>
      </div>
    </div>
  );
};

export default AIContent;
