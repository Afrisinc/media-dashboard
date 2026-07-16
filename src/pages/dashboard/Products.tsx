import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Shield, Cloud, BarChart3, Lock } from "lucide-react";

const products = [
  {
    name: "Afrisinc Cloud",
    status: "Live",
    users: "1,234",
    description: "Enterprise cloud infrastructure",
    icon: Cloud,
    route: null,
  },
  {
    name: "Analytics Suite",
    status: "Live",
    users: "856",
    description: "Business intelligence & analytics",
    icon: BarChart3,
    route: null,
  },
  {
    name: "VPN Network",
    status: "Live",
    users: "567",
    description: "Secure VPN infrastructure management",
    icon: Shield,
    route: "/dashboard/products/vpn",
  },
  {
    name: "SecureID",
    status: "Beta",
    users: "342",
    description: "Identity & access management",
    icon: Lock,
    route: null,
  },
];

const DashboardProducts = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="heading-section">Products</h1>
          <p className="text-secondary">Manage your products and services</p>
        </div>
        <Button variant="default">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <Card
            key={p.name}
            className={`border-border hover:shadow-card-hover transition-all duration-300 ${p.route ? "cursor-pointer hover:-translate-y-1" : ""}`}
            onClick={() => p.route && navigate(p.route)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-lg bg-primary/10">
                  <p.icon className="w-5 h-5 text-primary" />
                </div>
                <Badge variant={p.status === "Live" ? "default" : "secondary"}>
                  {p.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <CardTitle className="text-lg">{p.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <p className="text-xs font-medium text-muted-foreground">
                {p.users} active users
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardProducts;
