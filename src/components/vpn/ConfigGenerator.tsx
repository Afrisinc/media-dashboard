import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileCode, Download, Copy, Check, QrCode } from "lucide-react";
import { VPNServer, VPNDevice } from "@/types/vpn";
import { useGenerateConfig } from "@/hooks/useVPN";
import { toast } from "sonner";
import { QRCodeDialog } from "./QRCodeDialog";

interface ConfigGeneratorProps {
  servers?: VPNServer[];
  devices?: VPNDevice[];
  isLoading: boolean;
}

export function ConfigGenerator({
  servers,
  devices,
  isLoading,
}: ConfigGeneratorProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState<
    "wireguard" | "openvpn" | "ikev2"
  >("wireguard");
  const [generatedConfig, setGeneratedConfig] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const generateConfigMutation = useGenerateConfig();

  const handleGenerate = async () => {
    if (!selectedDevice || !selectedServer) return;

    try {
      const config = await generateConfigMutation.mutateAsync({
        deviceId: selectedDevice,
        serverId: selectedServer,
        protocol: selectedProtocol,
      });
      setGeneratedConfig(config);
      toast.success("Configuration generated successfully");
    } catch {
      toast.error("Failed to generate configuration");
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedConfig);
    setCopied(true);
    toast.success("Configuration copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const device = devices?.find((d) => d.id === selectedDevice);
    const server = servers?.find((s) => s.id === selectedServer);
    const fileName = `${device?.name.toLowerCase().replace(/\s+/g, "-")}-${server?.name.toLowerCase()}.${selectedProtocol === "wireguard" ? "conf" : selectedProtocol === "openvpn" ? "ovpn" : "mobileconfig"}`;

    const blob = new Blob([generatedConfig], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Downloaded ${fileName}`);
  };

  const handleShowQR = () => {
    setShowQR(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const onlineServers = servers?.filter((s) => s.status === "online") ?? [];
  const device = devices?.find((d) => d.id === selectedDevice);
  const server = servers?.find((s) => s.id === selectedServer);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Configuration Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Device</Label>
              <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices?.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name} ({device.os})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Server</Label>
              <Select value={selectedServer} onValueChange={setSelectedServer}>
                <SelectTrigger>
                  <SelectValue placeholder="Select server" />
                </SelectTrigger>
                <SelectContent>
                  {onlineServers.map((server) => (
                    <SelectItem key={server.id} value={server.id}>
                      <div className="flex items-center gap-2">
                        <span>{server.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {server.load}%
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Protocol</Label>
              <Select
                value={selectedProtocol}
                onValueChange={(v: "wireguard" | "openvpn" | "ikev2") =>
                  setSelectedProtocol(v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wireguard">
                    <div className="flex items-center gap-2">
                      <span>WireGuard</span>
                      <Badge variant="outline" className="text-xs">
                        Recommended
                      </Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="openvpn">OpenVPN</SelectItem>
                  <SelectItem value="ikev2">IKEv2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            variant="default"
            onClick={handleGenerate}
            disabled={
              !selectedDevice ||
              !selectedServer ||
              generateConfigMutation.isPending
            }
            className="w-full sm:w-auto"
          >
            {generateConfigMutation.isPending
              ? "Generating..."
              : "Generate Configuration"}
          </Button>

          {generatedConfig && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <Label>Generated Configuration</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-2" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleShowQR}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </div>
              </div>
              <Textarea
                value={generatedConfig}
                readOnly
                className="font-mono text-xs h-64 bg-muted/50"
              />
              <p className="text-xs text-muted-foreground">
                ⚠️ Keep this configuration secure. Replace placeholder values
                with your actual keys.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <QRCodeDialog
        isOpen={showQR}
        onClose={() => setShowQR(false)}
        config={generatedConfig}
        device={device}
        server={server}
        protocol={selectedProtocol}
      />
    </>
  );
}
