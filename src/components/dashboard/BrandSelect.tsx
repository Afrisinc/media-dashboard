import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAccountGroups } from "@/hooks/useAccountGroups";

const NO_BRAND = "__default__";

interface BrandSelectProps {
  value: string;
  onChange: (groupId: string) => void;
  defaultLabel?: string;
  showLivePages?: boolean;
  id?: string;
  ariaLabel?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export function BrandSelect({
  value,
  onChange,
  defaultLabel = "Default brand",
  showLivePages = true,
  id,
  ariaLabel,
  triggerClassName,
  disabled = false,
}: Readonly<BrandSelectProps>) {
  const { data: groups } = useAccountGroups();

  return (
    <Select
      value={value || NO_BRAND}
      onValueChange={(next) => onChange(next === NO_BRAND ? "" : next)}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        aria-label={ariaLabel}
        className={triggerClassName}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NO_BRAND}>{defaultLabel}</SelectItem>
        {(groups ?? []).map((group) => (
          <SelectItem key={group.id} value={group.id}>
            {showLivePages
              ? `${group.name} · ${group.activeMemberCount} live page${group.activeMemberCount === 1 ? "" : "s"}`
              : group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
