export function PageHeader({
  title,
  subtitle,
  action,
  emoji,
  badge,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  emoji?: string;
  badge?: string;
}) {
  return (
    <div className="page-header mb-10 flex flex-wrap items-end justify-between gap-5">
      <div className="max-w-2xl">
        {badge && <span className="cute-badge mb-3 inline-flex">{badge}</span>}
        <h1 className="page-title">
          {emoji && (
            <span className="page-title-emoji" aria-hidden>
              {emoji}
            </span>
          )}
          {title}
        </h1>
        {subtitle && <p className="page-subtitle mt-2">{subtitle}</p>}
      </div>
      {action && <div className="page-header-action shrink-0">{action}</div>}
    </div>
  );
}
