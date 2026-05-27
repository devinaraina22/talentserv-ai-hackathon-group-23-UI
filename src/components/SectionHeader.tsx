export function SectionHeader({
  title,
  description,
  emoji,
}: {
  title: string;
  description?: string;
  emoji?: string;
}) {
  return (
    <div className="section-header mb-4">
      <h2 className="section-title">
        {emoji && <span className="section-emoji" aria-hidden>{emoji}</span>}
        {title}
      </h2>
      {description && <p className="section-desc">{description}</p>}
    </div>
  );
}
