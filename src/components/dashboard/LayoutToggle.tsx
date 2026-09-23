import { LayoutGrid, List } from "lucide-react";
import { SegmentedControl } from "@/components/ui/segmented-control";
import type { CollectionLayout } from "@/hooks/useLayoutParam";

const LAYOUT_OPTIONS: {
  label: string;
  value: CollectionLayout;
  icon: typeof LayoutGrid;
}[] = [
  { label: "Gallery", value: "grid", icon: LayoutGrid },
  { label: "List", value: "list", icon: List },
];

interface LayoutToggleProps {
  value: CollectionLayout;
  onChange: (layout: CollectionLayout) => void;
}

export function LayoutToggle({ value, onChange }: LayoutToggleProps) {
  return (
    <SegmentedControl
      options={LAYOUT_OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
