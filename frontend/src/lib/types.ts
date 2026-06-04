export type UserRole = 'admin' | 'member';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organizationId: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: { id: string; name: string; email: string } | null;
}

export interface PaginatedCustomers {
  data: Customer[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface Note {
  id: string;
  content: string;
  customerId: string;
  organizationId: string;
  createdById: string;
  createdAt: string;
  createdBy: { id: string; name: string; email: string };
}

export interface ApiError {
  message: string | string[];
  statusCode: number;
}
