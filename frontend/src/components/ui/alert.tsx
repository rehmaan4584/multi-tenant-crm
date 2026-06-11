export function Alert({
  variant = 'error',
  children,
}: {
  variant?: 'error' | 'info';
  children: React.ReactNode;
}) {
  const styles =
    variant === 'error'
      ? 'border-red-200 bg-red-50 text-red-800'
      : 'border-brand-100 bg-brand-50 text-brand-700';
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${styles}`}>{children}</div>
  );
}
