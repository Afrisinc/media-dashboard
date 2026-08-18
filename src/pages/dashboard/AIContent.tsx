import { useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Wand2,
} from "lucide-react";
import { IconBox } from "@/components/ui/icon-box";
import { StatCard, StatGrid } from "@/components/ui/stat-card";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CreatePostForm from "@/components/dashboard/CreatePostForm";
import SocialMediaPostForm from "@/components/dashboard/SocialMediaPostForm";
import PostsTable from "@/components/dashboard/PostsTable";
import { useAIPosts } from "@/hooks/useAIPosts";
import { cn } from "@/lib/utils";

const AIContent = () => {
  const { data: posts } = useAIPosts(100);
  const [activeTab, setActiveTab] = useState("ai");

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
      {/* Header Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconBox icon={Sparkles} tone="primary" />
            <div>
              <h1 className="heading-section">Content Studio</h1>
              <p className="text-secondary">
                Generate AI-powered or manually post content to social media
              </p>
            </div>
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
      </div>

      {/* Main Content Section */}
      <Card className="border-border/50 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation */}
          <div className="border-b border-border/50 bg-muted/20 px-6">
            <TabsList className="h-auto gap-0 bg-transparent p-0 rounded-none">
              <TabsTrigger
                value="ai"
                className={cn(
                  "rounded-none border-b-2 border-transparent px-6 py-4 font-semibold transition-all duration-200",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=inactive]:text-muted-foreground hover:text-foreground",
                  activeTab === "ai" && "border-primary text-primary",
                )}
              >
                <Wand2 className="w-4 h-4 mr-2" />
                Generate with AI
              </TabsTrigger>
              <TabsTrigger
                value="manual"
                className={cn(
                  "rounded-none border-b-2 border-transparent px-6 py-4 font-semibold transition-all duration-200",
                  "data-[state=active]:border-primary data-[state=active]:bg-transparent",
                  "data-[state=inactive]:text-muted-foreground hover:text-foreground",
                  activeTab === "manual" && "border-primary text-primary",
                )}
              >
                <Send className="w-4 h-4 mr-2" />
                Post Manually
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - AI Generation */}
          <TabsContent value="ai" className="p-6 space-y-6 m-0">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wand2 className="w-4 h-4 text-primary" />
                    </div>
                    Create AI-Powered Posts
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Let our AI generate engaging content for your social media
                  </p>
                </div>
                <CreatePostForm />
              </div>

              <div className="hidden lg:flex items-start">
                <div className="w-full space-y-4 pt-12">
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Smart Features
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <span className="text-primary font-semibold">→</span>
                        <span>AI generates platform-optimized content</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-semibold">→</span>
                        <span>Customize with keywords and topics</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-semibold">→</span>
                        <span>Post to multiple platforms instantly</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-primary font-semibold">→</span>
                        <span>Track performance automatically</span>
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/5 border border-blue-500/20">
                    <h4 className="font-semibold text-sm mb-2">Pro Tip</h4>
                    <p className="text-sm text-muted-foreground">
                      AI content performs best when you provide specific
                      keywords and a clear topic. The more details, the better
                      the result.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab Content - Manual Posting */}
          <TabsContent value="manual" className="p-6 space-y-6 m-0">
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Send className="w-4 h-4 text-blue-500" />
                  </div>
                  Post Content Manually
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Post your own content to any social media platform
                </p>
              </div>
              <SocialMediaPostForm />
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Recent Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Recent Posts</h2>
            <p className="text-muted-foreground">
              View and manage all your published content
            </p>
          </div>
        </div>
        <PostsTable />
      </div>
    </div>
  );
};

export default AIContent;
