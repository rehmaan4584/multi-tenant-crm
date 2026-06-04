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
      : 'border-blue-200 bg-blue-50 text-blue-800';
  return (
    <div className={`rounded border px-3 py-2 text-sm ${styles}`}>{children}</div>
  );
}
