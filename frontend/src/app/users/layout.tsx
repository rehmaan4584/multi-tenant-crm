import { ProtectedRoute } from '@/components/protected-route';

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
