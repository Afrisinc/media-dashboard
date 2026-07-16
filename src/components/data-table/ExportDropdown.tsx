import { useState } from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ExportDropdownProps } from "./types";

export function ExportDropdown({
  onExport,
  loading = false,
  disabled = false,
}: ExportDropdownProps) {
  const [exportingFormat, setExportingFormat] = useState<string | null>(null);

  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setExportingFormat(format);
    try {
      await onExport(format);
    } finally {
      setExportingFormat(null);
    }
  };

  const isExporting = loading || exportingFormat !== null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled || isExporting}>
          {isExporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("excel")}
          disabled={isExporting}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={isExporting}
        >
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
