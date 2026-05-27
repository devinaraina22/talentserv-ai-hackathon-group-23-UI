import type { LucideIcon } from "lucide-react";

const cardThemes = [
  { tint: "stat-card-pink", icon: "icon-pink" },
  { tint: "stat-card-purple", icon: "icon-purple" },
  { tint: "stat-card-blue", icon: "icon-blue" },
  { tint: "stat-card-mint", icon: "icon-mint" },
] as const;

export function StatCard({
  title,
  value,
  description,
  subtitle,
  icon: Icon,
  tintIndex = 0,
}: {
  title: string;
  value: string | number;
  description?: string;
  subtitle?: string;
  icon?: LucideIcon;
  tintIndex?: number;
}) {
  const theme = cardThemes[tintIndex % cardThemes.length];

  return (
    <div className={`stat-card ${theme.tint}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="stat-card-label">{title}</p>
          {description && <p className="stat-card-desc">{description}</p>}
          <p className="stat-card-value mt-2">{value}</p>
          {subtitle && <p className="stat-card-footnote mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`stat-card-icon ${theme.icon}`}>
            <Icon className="h-5 w-5" strokeWidth={2.25} />
          </div>
        )}
      </div>
    </div>
  );
}
