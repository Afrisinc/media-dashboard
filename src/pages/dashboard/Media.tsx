import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Video, Mic } from "lucide-react";

const DashboardMedia = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center gap-4">
      <div>
        <h1 className="heading-section">Media</h1>
        <p className="text-secondary">Manage articles, videos, and podcasts</p>
      </div>
      <Button variant="default">
        <Plus className="w-4 h-4 mr-2" />
        Create Content
      </Button>
    </div>
    <div className="grid sm:grid-cols-3 gap-6">
      <Card className="hover:shadow-card-hover transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2.5 rounded-lg bg-muted">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle>Articles</CardTitle>
            <p className="text-xs text-muted-foreground">24 published</p>
          </div>
        </CardHeader>
      </Card>
      <Card className="hover:shadow-card-hover transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2.5 rounded-lg bg-muted">
            <Video className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle>Videos</CardTitle>
            <p className="text-xs text-muted-foreground">12 published</p>
          </div>
        </CardHeader>
      </Card>
      <Card className="hover:shadow-card-hover transition-all duration-300">
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="p-2.5 rounded-lg bg-muted">
            <Mic className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <CardTitle>Podcasts</CardTitle>
            <p className="text-xs text-muted-foreground">8 episodes</p>
          </div>
        </CardHeader>
      </Card>
    </div>
  </div>
);

export default DashboardMedia;
