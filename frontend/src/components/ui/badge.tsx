import type { UserRole } from '@/lib/types';

const roleStyles: Record<UserRole, string> = {
  admin: 'bg-brand-50 text-brand-700 ring-brand-100',
  member: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${roleStyles[role]}`}
    >
      {role}
    </span>
  );
}
