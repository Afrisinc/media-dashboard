import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
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
        <IconBox icon={Sparkles} tone="primary" />
        <div>
          <h1 className="heading-section">AI Content Studio</h1>
          <p className="text-secondary">
            Generate and manage AI-powered social media posts
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <StatGrid columns={4}>
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            size="sm"
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            iconTone="muted"
            className="border-border/50 hover:shadow-card transition-shadow duration-300"
          />
        ))}
      </StatGrid>

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
