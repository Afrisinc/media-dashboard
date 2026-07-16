import { Info } from "lucide-react";

export function AggregatedDisclaimer() {
  return (
    <div className="bg-muted/50 border border-border rounded-lg p-4 flex gap-3">
      <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
      <div className="text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Content Disclaimer:</strong> Some
          articles on this page are aggregated from external sources and are
          summarized for informational purposes. Original articles are clearly
          attributed and linked. Afrisinc does not claim ownership of aggregated
          content.
        </p>
      </div>
    </div>
  );
}
