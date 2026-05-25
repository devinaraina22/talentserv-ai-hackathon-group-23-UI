export function StatCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
}) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-bold text-clinic-900">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
