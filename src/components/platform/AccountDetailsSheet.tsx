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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CopyableText } from "@/components/ui/copyable-text";
import { EnrollProductDialog } from "@/components/platform/EnrollProductDialog";
import type { PlatformAccount } from "@/types/platform";
import { Briefcase, Package, Plus } from "lucide-react";

interface AccountDetailsSheetProps {
  account: PlatformAccount | null;
  isOpen: boolean;
  onClose: () => void;
}

const typeVariant = (t: string) =>
  t === "INDIVIDUAL" ? "default" : "secondary";

export function AccountDetailsSheet({
  account,
  isOpen,
  onClose,
}: AccountDetailsSheetProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  if (!account) return null;

  const ownerName = account.owner
    ? [account.owner.firstName, account.owner.lastName]
        .filter(Boolean)
        .join(" ")
    : "Unknown";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl md:max-w-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <SheetHeader className="flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <SheetTitle>{ownerName}</SheetTitle>
              <SheetDescription className="truncate">
                {account.owner?.email || "No email"}
              </SheetDescription>
            </div>
            <Badge
              variant={typeVariant(account.type)}
              className="flex-shrink-0"
            >
              {account.type}
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
            <TabsTrigger value="details" className="gap-2">
              <Briefcase className="h-4 w-4" />
              <span className="hidden sm:inline">Details</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Products</span>
              {account.products && (
                <span className="ml-1 text-xs">
                  ({account.products.length})
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-hidden">
            <div className="pr-4">
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Account Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-start">
                        <span className="text-muted-foreground">
                          Account ID
                        </span>
                        <CopyableText text={account.id} truncateAt={12} />
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type</span>
                        <Badge variant={typeVariant(account.type)}>
                          {account.type}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Owner Name
                        </span>
                        <span className="text-right">{ownerName}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Owner Email
                        </span>
                        <span className="text-right break-words">
                          {account.owner?.email || "—"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Owner ID</span>
                        <CopyableText
                          text={account.owner_user_id}
                          truncateAt={12}
                        />
                      </div>

                      {account.organization_id && (
                        <div className="flex justify-between items-start">
                          <span className="text-muted-foreground">
                            Organization ID
                          </span>
                          <CopyableText
                            text={account.organization_id}
                            truncateAt={12}
                          />
                        </div>
                      )}

                      {account.createdAt && (
                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-muted-foreground">Created</span>
                          <span className="text-right text-xs">
                            {new Date(account.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                      {account.updatedAt && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Updated</span>
                          <span className="text-right text-xs">
                            {new Date(account.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-4 mt-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setEnrollDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Enroll Product
                  </Button>
                </div>

                {!account.products || account.products.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Package className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No products enrolled
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-2">
                    {account.products.map((product) => (
                      <Card key={product.id}>
                        <CardContent className="pt-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {product.product?.name || "Unknown Product"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Code:{" "}
                                  {product.product?.code || product.product_id}
                                </p>
                              </div>
                            </div>

                            <div className="flex gap-2 flex-wrap">
                              <Badge variant="secondary" className="text-xs">
                                {product.plan}
                              </Badge>
                              <Badge
                                variant={
                                  product.status === "ACTIVE"
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-xs"
                              >
                                {product.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </SheetContent>

      {/* Enroll Product Dialog */}
      <EnrollProductDialog
        account={account}
        isOpen={enrollDialogOpen}
        onClose={() => setEnrollDialogOpen(false)}
      />
    </Sheet>
  );
}
