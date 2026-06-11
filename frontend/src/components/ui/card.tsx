export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-4 text-text shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
