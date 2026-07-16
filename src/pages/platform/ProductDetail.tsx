import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Layers,
  BarChart3,
  Users,
  Settings,
  Activity,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  useProductEnrollments,
  useProductById,
  useProductAccounts,
  useUpdateProduct,
} from "@/hooks/usePlatform";
import { toast } from "sonner";

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsData, setSettingsData] = useState({
    name: "",
    description: "",
    status: "ACTIVE",
  });

  // Fetch data
  const { data: products } = useProductEnrollments();
  const { data: productDetails, isLoading: productLoading } = useProductById(
    productId || null,
  );
  const { data: accounts, isLoading: accountsLoading } = useProductAccounts(
    productId || "",
  );
  const updateMutation = useUpdateProduct();

  const enrollment = products?.find((p) => p.productId === productId);

  // Initialize settings data when productDetails loads
  if (productDetails && !settingsData.name) {
    setSettingsData({
      name: productDetails.name,
      description: productDetails.description || "",
      status: productDetails.status || "ACTIVE",
    });
  }

  if (!productLoading && !enrollment) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Product not found</p>
        </div>
      </div>
    );
  }

  const handleSaveSettings = async () => {
    if (!productId) return;
    try {
      await updateMutation.mutateAsync({
        productId,
        updateData: {
          name: settingsData.name,
          description: settingsData.description,
          status: settingsData.status,
        },
      });
      toast.success("Product settings updated");
    } catch (error: unknown) {
      const err = error as { message?: string };
      const errorMessage = err?.message || "Failed to update product";
      toast.error(errorMessage);
    }
  };

  // Dummy activity (placeholder until API is available)
  const dummyActivity = [
    {
      id: 1,
      action: "New account enrolled",
      account: "Tech Corp Inc",
      time: "2 hours ago",
    },
    {
      id: 2,
      action: "Plan upgraded to Enterprise",
      account: "John Doe",
      time: "4 hours ago",
    },
    {
      id: 3,
      action: "Account suspended",
      account: "Jane Smith",
      time: "1 day ago",
    },
    {
      id: 4,
      action: "Payment received",
      account: "Digital Solutions",
      time: "2 days ago",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back to Products
      </Button>

      {/* Product Header */}
      {productLoading ? (
        <Skeleton className="h-20 w-full rounded-lg" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="heading-section">
                {productDetails?.name || enrollment?.productName}
              </h1>
              <p className="text-secondary">
                Complete dashboard for managing your product
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      {productLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-up">
          <Card className="border-border hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Total Enrollments
                </p>
                <div className="text-3xl font-bold">
                  {enrollment?.totalEnrollments || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Accounts using this product
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Active
                </p>
                <div className="text-3xl font-bold text-emerald-600">
                  {enrollment?.active || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Currently active
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Suspended
                </p>
                <div className="text-3xl font-bold text-red-600">
                  {enrollment?.suspended || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Suspended accounts
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-card-hover transition-all duration-300">
            <CardContent className="pt-6">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                  Revenue
                </p>
                <div className="text-3xl font-bold">$12.4K</div>
                <p className="text-xs text-emerald-600">↑ 12% this month</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Accounts</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Plan Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Free Plans</span>
                      <span className="text-sm font-bold">
                        {enrollment?.plans.FREE || 0}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{
                          width: `${enrollment?.totalEnrollments ? (enrollment.plans.FREE / enrollment.totalEnrollments) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Pro Plans</span>
                      <span className="text-sm font-bold">
                        {enrollment?.plans.PRO || 0}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{
                          width: `${enrollment?.totalEnrollments ? (enrollment.plans.PRO / enrollment.totalEnrollments) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Enterprise Plans
                      </span>
                      <span className="text-sm font-bold">
                        {enrollment?.plans.ENTERPRISE || 0}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{
                          width: `${enrollment?.totalEnrollments ? (enrollment.plans.ENTERPRISE / enrollment.totalEnrollments) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  Product Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Health Status
                    </span>
                    <Badge>Healthy</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Last Updated
                    </span>
                    <span className="text-sm font-medium">2 hours ago</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      API Status
                    </span>
                    <Badge variant="outline">Operational</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Uptime
                    </span>
                    <span className="text-sm font-medium">99.98%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Accounts Tab */}
        <TabsContent value="accounts" className="space-y-6">
          <Card className="border-border">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle>Enrolled Accounts</CardTitle>
                <Button variant="outline" size="sm">
                  Add Account
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {accountsLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : !accounts || accounts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No enrolled accounts
                </p>
              ) : (
                <div className="rounded-lg border border-border/50 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="font-semibold">Account</TableHead>
                        <TableHead className="font-semibold">Type</TableHead>
                        <TableHead className="font-semibold">Owner</TableHead>
                        <TableHead className="font-semibold">Status</TableHead>
                        <TableHead className="font-semibold">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accounts.map((account, idx) => (
                        <TableRow
                          key={account.id}
                          className={
                            idx % 2 === 0 ? "bg-transparent" : "bg-muted/10"
                          }
                        >
                          <TableCell className="font-mono text-xs">
                            {account.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{account.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {account.ownerName || account.owner?.email}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                account.status === "ACTIVE"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {account.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dummyActivity.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{item.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.account}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0 whitespace-nowrap">
                      {item.time}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Product Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {productLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-muted-foreground block">
                        Product Name
                      </label>
                      <Input
                        value={settingsData.name}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            name: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-muted-foreground block">
                        Product Code
                      </label>
                      <Input value={productDetails?.code || ""} disabled />
                      <p className="text-xs text-muted-foreground">
                        Unique identifier (cannot be changed)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-muted-foreground block">
                        Description
                      </label>
                      <textarea
                        value={settingsData.description}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Add a description for this product"
                        className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold uppercase text-muted-foreground block">
                        Status
                      </label>
                      <select
                        value={settingsData.status}
                        onChange={(e) =>
                          setSettingsData({
                            ...settingsData,
                            status: e.target.value,
                          })
                        }
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground text-sm"
                      >
                        <option value="PROVISIONING">Provisioning</option>
                        <option value="ACTIVE">Active</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="DEPRECATED">Deprecated</option>
                        <option value="COMING_SOON">Coming Soon</option>
                        <option value="BETA">Beta</option>
                        <option value="LIVE">Live</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-3">
                    <Button
                      className="w-full"
                      onClick={handleSaveSettings}
                      disabled={updateMutation.isPending}
                    >
                      {updateMutation.isPending ? "Saving..." : "Save Settings"}
                    </Button>
                    <Button variant="outline" className="w-full">
                      Deactivate Product
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
