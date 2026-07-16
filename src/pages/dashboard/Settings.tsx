import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DashboardSettings = () => (
  <div className="space-y-6">
    <div>
      <h1 className="heading-section">Settings</h1>
      <p className="text-secondary">Manage your account and preferences</p>
    </div>
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
              Full Name
            </label>
            <Input defaultValue="John Doe" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
              Email
            </label>
            <Input defaultValue="john@afrisinc.com" />
          </div>
          <Button variant="default" className="w-full">
            Save Changes
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
              Current Password
            </label>
            <Input type="password" />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase text-muted-foreground block mb-1.5">
              New Password
            </label>
            <Input type="password" />
          </div>
          <Button variant="outline" className="w-full">
            Update Password
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
);

export default DashboardSettings;
