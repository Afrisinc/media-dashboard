import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyableText } from "@/components/ui/copyable-text";
import { usePlatformUserAccounts } from "@/hooks/usePlatform";
import type { PlatformUser } from "@/types/platform";
import { User, Briefcase, Package } from "lucide-react";

interface UserAccountsSheetProps {
  user: PlatformUser | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusVariant = (s: string) =>
  s === "ACTIVE" ? "default" : s === "SUSPENDED" ? "destructive" : "secondary";

export function UserAccountsSheet({
  user,
  isOpen,
  onClose,
}: UserAccountsSheetProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const { data, isLoading } = usePlatformUserAccounts(user?.id || null);

  if (!user) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle>{user.fullName || user.email}</SheetTitle>
              <SheetDescription className="truncate">
                {user.email}
              </SheetDescription>
            </div>
            <Badge
              variant={statusVariant(user.status)}
              className="flex-shrink-0"
            >
              {user.status}
            </Badge>
          </div>
        </SheetHeader>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden mt-4"
        >
          <TabsList className="grid w-full grid-cols-2 flex-shrink-0">
            <TabsTrigger value="overview" className="gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="accounts" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Accounts</span>
              {data && (
                <span className="ml-1 text-xs">({data.accounts.length})</span>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="pr-4">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* User Details Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      User Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">User ID</span>
                        <CopyableText text={user.id} truncateAt={12} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Email</span>
                        <span className="text-right break-words">
                          {user.email}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Name</span>
                        <span className="text-right">
                          {user.fullName || "—"}
                        </span>
                      </div>

                      {user.phone && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="text-right">{user.phone}</span>
                        </div>
                      )}

                      {user.location && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">
                            Location
                          </span>
                          <span className="text-right">{user.location}</span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={statusVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Created</span>
                        <span className="text-right text-xs">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Last Login
                        </span>
                        <span className="text-right text-xs">
                          {user.lastLogin
                            ? new Date(user.lastLogin).toLocaleDateString()
                            : "Never"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {data?.accounts.length || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Accounts
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {data?.accounts.reduce(
                          (sum, acc) => sum + acc.products.length,
                          0,
                        ) || 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Total Products
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Accounts Tab */}
              <TabsContent value="accounts" className="space-y-4 mt-4">
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : !data?.accounts.length ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No accounts found for this user
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  data.accounts.map((account) => (
                    <Card key={account.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {account.type} Account
                          </CardTitle>
                          <Badge variant="outline">{account.type}</Badge>
                        </div>
                        <CopyableText
                          text={account.id}
                          truncateAt={16}
                          copyMessage="Account ID copied!"
                          className="mt-2"
                        />
                      </CardHeader>
                      <CardContent>
                        {account.products.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No products enrolled
                          </p>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              Products ({account.products.length})
                            </p>
                            <div className="space-y-2">
                              {account.products.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between p-2 rounded-md bg-muted/50 text-sm"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-medium truncate">
                                        {product.product.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground truncate">
                                        Code: {product.product.code}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                    <Badge
                                      variant="secondary"
                                      className="text-xs whitespace-nowrap"
                                    >
                                      {product.plan}
                                    </Badge>
                                    <Badge
                                      variant={
                                        product.status === "ACTIVE"
                                          ? "default"
                                          : "destructive"
                                      }
                                      className="text-xs whitespace-nowrap"
                                    >
                                      {product.status}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
