import { UserRole } from '../../../generated/prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  role: UserRole;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  organizationId: string;
  role: UserRole;
}
