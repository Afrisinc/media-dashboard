interface TableCellStackProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function TableCellStack({
  title,
  subtitle,
  className,
}: TableCellStackProps) {
  return (
    <div className={className}>
      <p className="font-medium">{title}</p>
      {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
