import { ProtectedRoute } from '@/components/protected-route';

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
