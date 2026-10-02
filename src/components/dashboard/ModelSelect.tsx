import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_VALUE = "__default__";
const CUSTOM_VALUE = "__custom__";

export interface ModelSelectOption {
  value: string;
  label: string;
  hint?: string;
}

interface ModelSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: ModelSelectOption[];
  defaultLabel?: string;
  disabled?: boolean;
}

export function ModelSelect({
  id,
  value,
  onChange,
  options,
  defaultLabel = "Server default",
  disabled,
}: ModelSelectProps) {
  const customField = useId();
  const isKnown = options.some((option) => option.value === value);
  const [pickedCustom, setPickedCustom] = useState(false);
  const custom = pickedCustom || (Boolean(value) && !isKnown);

  const selected = custom ? CUSTOM_VALUE : value || DEFAULT_VALUE;
  const hint = options.find((option) => option.value === value)?.hint;

  const handleSelect = (next: string) => {
    if (next === CUSTOM_VALUE) {
      setPickedCustom(true);
      if (isKnown) onChange("");
      return;
    }
    setPickedCustom(false);
    onChange(next === DEFAULT_VALUE ? "" : next);
  };

  return (
    <div className="space-y-2">
      <Select value={selected} onValueChange={handleSelect} disabled={disabled}>
        <SelectTrigger id={id}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DEFAULT_VALUE}>{defaultLabel}</SelectItem>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_VALUE}>Custom model…</SelectItem>
        </SelectContent>
      </Select>

      {custom && (
        <Input
          id={customField}
          aria-label="Custom model name"
          autoComplete="off"
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Exact model name from the provider"
          disabled={disabled}
          className="font-mono text-xs"
        />
      )}

      {!custom && (
        <p className="text-[11px] text-muted-foreground">
          {hint ?? "Uses the model configured on the server."}
        </p>
      )}
    </div>
  );
}
