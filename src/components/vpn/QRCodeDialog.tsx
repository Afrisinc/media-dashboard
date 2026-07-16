import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QrCode, Download, Copy, Check, Smartphone } from "lucide-react";
import { VPNServer, VPNDevice } from "@/types/vpn";
import { toast } from "sonner";

interface QRCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  config: string;
  device?: VPNDevice;
  server?: VPNServer;
  protocol: string;
}

export function QRCodeDialog({
  isOpen,
  onClose,
  config,
  device,
  server,
  protocol,
}: QRCodeDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(config);
    setCopied(true);
    toast.success("Configuration copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById("vpn-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${device?.name.toLowerCase().replace(/\s+/g, "-")}-${server?.name.toLowerCase()}-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
    toast.success("QR code downloaded");
  };

  const protocolLabels: Record<string, string> = {
    wireguard: "WireGuard",
    openvpn: "OpenVPN",
    ikev2: "IKEv2",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code with your mobile VPN app to import the
            configuration.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Config Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>{device?.name}</span>
            </div>
            <Badge variant="outline">{protocolLabels[protocol]}</Badge>
          </div>

          {/* QR Code */}
          <Card className="bg-white">
            <CardContent className="p-6 flex items-center justify-center">
              <QRCodeSVG
                id="vpn-qr-code"
                value={config}
                size={220}
                level="M"
                includeMargin={true}
                bgColor="#ffffff"
                fgColor="#000000"
              />
            </CardContent>
          </Card>

          {/* Server Info */}
          {server && (
            <div className="text-center text-sm text-muted-foreground">
              <p>Server: {server.name}</p>
              <p>
                {server.location}, {server.country}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Instructions:</strong> Open your VPN app (WireGuard,
              OpenVPN Connect, etc.) and use the "Scan QR Code" or "Import from
              QR" option to add this tunnel.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleCopy} className="flex-1">
            {copied ? (
              <Check className="h-4 w-4 mr-2" />
            ) : (
              <Copy className="h-4 w-4 mr-2" />
            )}
            {copied ? "Copied" : "Copy Config"}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadQR}
            className="flex-1"
          >
            <Download className="h-4 w-4 mr-2" />
            Save QR Image
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface QRCodeGeneratorProps {
  servers?: VPNServer[];
  devices?: VPNDevice[];
  isLoading: boolean;
  onGenerateConfig: (
    deviceId: string,
    serverId: string,
    protocol: "wireguard" | "openvpn" | "ikev2",
  ) => Promise<string>;
}

export function QRCodeGenerator({
  servers,
  devices,
  isLoading,
  onGenerateConfig,
}: QRCodeGeneratorProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [selectedServer, setSelectedServer] = useState<string>("");
  const [selectedProtocol, setSelectedProtocol] = useState<
    "wireguard" | "openvpn" | "ikev2"
  >("wireguard");
  const [generatedConfig, setGeneratedConfig] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedDevice || !selectedServer) return;

    setIsGenerating(true);
    try {
      const config = await onGenerateConfig(
        selectedDevice,
        selectedServer,
        selectedProtocol,
      );
      setGeneratedConfig(config);
      setShowQR(true);
      toast.success("QR code generated successfully");
    } catch {
      toast.error("Failed to generate configuration");
    } finally {
      setIsGenerating(false);
    }
  };

  const onlineServers = servers?.filter((s) => s.status === "online") ?? [];
  const device = devices?.find((d) => d.id === selectedDevice);
  const server = servers?.find((s) => s.id === selectedServer);

  if (isLoading) {
    return null;
  }

  return (
    <>
      <Card className="border-dashed">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <QrCode className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Quick QR Setup</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Generate a QR code for instant mobile configuration
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3">
              <div className="space-y-2">
                <Label className="text-left block">Device</Label>
                <Select
                  value={selectedDevice}
                  onValueChange={setSelectedDevice}
                >
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
                <Label className="text-left block">Server</Label>
                <Select
                  value={selectedServer}
                  onValueChange={setSelectedServer}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select server" />
                  </SelectTrigger>
                  <SelectContent>
                    {onlineServers.map((server) => (
                      <SelectItem key={server.id} value={server.id}>
                        {server.name} ({server.load}% load)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-left block">Protocol</Label>
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
                    <SelectItem value="wireguard">WireGuard</SelectItem>
                    <SelectItem value="openvpn">OpenVPN</SelectItem>
                    <SelectItem value="ikev2">IKEv2</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="default"
                className="w-full mt-4"
                onClick={handleGenerate}
                disabled={!selectedDevice || !selectedServer || isGenerating}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate QR Code"}
              </Button>
            </div>
          </div>
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
