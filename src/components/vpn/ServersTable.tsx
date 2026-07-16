import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Server,
  Settings,
  Power,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { VPNServer } from "@/types/vpn";
import { useCreateServer } from "@/hooks/useVPN";

interface ServersTableProps {
  servers?: VPNServer[];
  isLoading: boolean;
}

const serverFormSchema = z.object({
  id: z
    .string()
    .min(1, "Server ID is required")
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers, and hyphens only"),
  name: z.string().min(1, "Server name is required").max(100),
  location: z.string().min(1, "Location is required").max(100),
  countryCode: z
    .string()
    .length(2, "Country code must be 2 letters")
    .toUpperCase(),
  regionCode: z.string().min(1, "Region code is required").max(50),
  publicIp: z.string().ip("Must be a valid IP address"),
  agentUrl: z.string().url("Must be a valid URL"),
  agentApiKey: z.string().min(8, "API key must be at least 8 characters"),
  wireguardPort: z.coerce
    .number()
    .min(1)
    .max(65535, "Port must be between 1-65535"),
  serverPublicKey: z
    .string()
    .min(20, "Public key must be at least 20 characters"),
  networkCidr: z
    .string()
    .regex(
      /^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/,
      "Must be valid CIDR notation (e.g., 192.168.0.0/24)",
    ),
  maxClients: z.coerce
    .number()
    .min(1, "Must have at least 1 client")
    .max(10000),
  bandwidthLimitMbps: z.coerce
    .number()
    .min(1, "Bandwidth limit is required")
    .max(100000),
  latitude: z.coerce.number().min(-90).max(90, "Latitude must be -90 to 90"),
  longitude: z.coerce
    .number()
    .min(-180)
    .max(180, "Longitude must be -180 to 180"),
});

type ServerFormData = z.infer<typeof serverFormSchema>;

const statusColors = {
  active: "bg-emerald-500",
  inactive: "bg-destructive",
  maintenance: "bg-amber-500",
  online: "bg-emerald-500",
  offline: "bg-destructive",
};

const healthStatusColors = {
  healthy: "bg-emerald-500",
  degraded: "bg-amber-500",
  unhealthy: "bg-destructive",
};

const protocolLabels = {
  wireguard: "WireGuard",
  openvpn: "OpenVPN",
  ikev2: "IKEv2",
};

export function ServersTable({ servers, isLoading }: ServersTableProps) {
  const [search, setSearch] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const createServerMutation = useCreateServer();

  const form = useForm<ServerFormData>({
    resolver: zodResolver(serverFormSchema),
    defaultValues: {
      id: "",
      name: "",
      location: "",
      countryCode: "",
      regionCode: "",
      publicIp: "",
      agentUrl: "",
      agentApiKey: "",
      wireguardPort: 51820,
      serverPublicKey: "",
      networkCidr: "",
      maxClients: 250,
      bandwidthLimitMbps: 1000,
      latitude: 0,
      longitude: 0,
    },
  });

  const onSubmit = async (data: ServerFormData) => {
    try {
      await createServerMutation.mutateAsync({
        ...data,
        countryCode: data.countryCode.toUpperCase(),
      });
      toast.success("Server created successfully!");
      setAddDialogOpen(false);
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create server";
      toast.error(message);
    }
  };

  const filteredServers = servers?.filter(
    (server) =>
      server.name.toLowerCase().includes(search.toLowerCase()) ||
      server.location.toLowerCase().includes(search.toLowerCase()) ||
      server.country.toLowerCase().includes(search.toLowerCase()),
  );

  const getLoadColor = (load: number) => {
    if (load < 50) return "bg-emerald-500";
    if (load < 80) return "bg-amber-500";
    return "bg-destructive";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Servers ({servers?.length ?? 0})
          </CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search servers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Server
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Server</DialogTitle>
                  <DialogDescription>
                    Configure a new VPN server endpoint.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    {/* Server Identity */}
                    <div className="space-y-3 border-b pb-4">
                      <h3 className="text-sm font-semibold">Server Identity</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Server ID *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. eu-paris" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Server Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g. Paris" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-3 border-b pb-4">
                      <h3 className="text-sm font-semibold">Location</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="location"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Location *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Paris, France"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="countryCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country Code *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. FR"
                                  maxLength={2}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="regionCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Region Code *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. eu-west" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="latitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Latitude *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 48.8566"
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="longitude"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Longitude *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 2.3522"
                                  type="number"
                                  step="0.0001"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Network Configuration */}
                    <div className="space-y-3 border-b pb-4">
                      <h3 className="text-sm font-semibold">
                        Network Configuration
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="publicIp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Public IP *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 203.0.113.2"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="networkCidr"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Network CIDR *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 192.168.89.0/24"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* WireGuard Configuration */}
                    <div className="space-y-3 border-b pb-4">
                      <h3 className="text-sm font-semibold">
                        WireGuard Configuration
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="wireguardPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WireGuard Port *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 51820"
                                  type="number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxClients"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Max Clients *</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. 250"
                                  type="number"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="serverPublicKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Server Public Key *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="e.g. HCn4ftHEkTyPHEPoAJCbXKQ2mxS+A3rObr/kgqyg0W0="
                                className="font-mono text-xs"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Agent Configuration */}
                    <div className="space-y-3 border-b pb-4">
                      <h3 className="text-sm font-semibold">
                        Agent Configuration
                      </h3>
                      <FormField
                        control={form.control}
                        name="agentUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agent URL *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. https://wg-agent-fr.example.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="agentApiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Agent API Key *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter secret API key"
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Performance Configuration */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Performance</h3>
                      <FormField
                        control={form.control}
                        name="bandwidthLimitMbps"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bandwidth Limit (Mbps) *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. 1000"
                                type="number"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <DialogFooter className="pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setAddDialogOpen(false)}
                        disabled={createServerMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        type="submit"
                        disabled={createServerMutation.isPending}
                      >
                        {createServerMutation.isPending && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        {createServerMutation.isPending
                          ? "Creating..."
                          : "Create Server"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-6 px-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Server</TableHead>
                <TableHead className="hidden sm:table-cell">Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Health</TableHead>
                <TableHead className="hidden lg:table-cell">
                  IP Address
                </TableHead>
                <TableHead className="hidden lg:table-cell">Clients</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredServers?.map((server) => (
                <TableRow key={server.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{server.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {server.location}, {server.country}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {getFlagEmoji(server.countryCode)}
                      </span>
                      <div>
                        <p className="text-sm">{server.location}</p>
                        <p className="text-xs text-muted-foreground">
                          {server.countryCode}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${statusColors[server.status as keyof typeof statusColors]}`}
                      />
                      <span className="text-sm capitalize">
                        {server.status}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${healthStatusColors[server.healthStatus as keyof typeof healthStatusColors]}`}
                      />
                      <span className="text-xs capitalize">
                        {server.healthStatus}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-xs font-mono">{server.publicIp}</span>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-sm">
                      {server.currentClients} / {server.maxClients}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-8 w-8 ${server.status === "online" ? "text-emerald-500" : "text-muted-foreground"}`}
                      >
                        <Power className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function getFlagEmoji(countryCode: string): string {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
