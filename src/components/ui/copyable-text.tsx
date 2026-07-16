import { useState } from "react";
import React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyableTextProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The full text to display and copy */
  text: string;

  /** Number of characters to show before truncation. Default: 8 */
  truncateAt?: number;

  /** Whether to show full text on hover. Default: true */
  showTooltip?: boolean;

  /** Custom tooltip content (if different from text). Default: uses text */
  tooltipContent?: string;

  /** Whether to use monospace font. Default: true */
  mono?: boolean;

  /** Custom success message. Default: "Copied to clipboard" */
  copyMessage?: string;

  /** Whether to show copy button. Default: true */
  showCopy?: boolean;
}

export const CopyableText = React.forwardRef<HTMLDivElement, CopyableTextProps>(
  (
    {
      text,
      truncateAt = 8,
      showTooltip = true,
      tooltipContent,
      mono = true,
      copyMessage = "Copied to clipboard",
      showCopy = true,
      className,
      ...props
    },
    ref,
  ) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent row click in tables
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success(copyMessage);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast.error("Failed to copy");
      }
    };

    const truncatedText =
      text.length > truncateAt ? `${text.substring(0, truncateAt)}...` : text;

    const textElement = (
      <span
        className={cn(
          "text-sm",
          mono && "font-mono",
          "text-muted-foreground select-none",
        )}
      >
        {truncatedText}
      </span>
    );

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1.5 group", className)}
        {...props}
      >
        {showTooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>{textElement}</TooltipTrigger>
            <TooltipContent>
              <p className="font-mono text-xs max-w-xs break-all">
                {tooltipContent || text}
              </p>
            </TooltipContent>
          </Tooltip>
        ) : (
          textElement
        )}

        {showCopy && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleCopy}
            title="Copy to clipboard"
          >
            {copied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    );
  },
);

CopyableText.displayName = "CopyableText";
