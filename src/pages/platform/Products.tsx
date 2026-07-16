import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductEnrollments } from "@/hooks/usePlatform";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Layers, ChevronRight, Plus } from "lucide-react";
import { CreateProductDialog } from "@/components/platform/CreateProductDialog";
import type { ProductEnrollment } from "@/types/platform";

export default function PlatformProducts() {
  const navigate = useNavigate();
  const { data: products, isLoading } = useProductEnrollments();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-section">Product Enrollments</h1>
          <p className="text-secondary">
            View enrollment stats and manage accounts per product
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map((product) => (
            <Card
              key={product.productId}
              className="border-border hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1"
              onClick={() =>
                navigate(`/dashboard/platform/products/${product.productId}`)
              }
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-primary/10">
                    <Layers className="w-5 h-5 text-primary" />
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <CardTitle className="text-lg">
                    {product.productName}
                  </CardTitle>
                  {product.productCode && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {product.productCode}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">
                      {product.totalEnrollments}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-emerald-600">
                      {product.active}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {product.suspended}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Suspended
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border/50 flex gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs">
                    FREE: {product.plans.FREE}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    PRO: {product.plans.PRO}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ENT: {product.plans.ENTERPRISE}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Product Dialog */}
      <CreateProductDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </div>
  );
}
