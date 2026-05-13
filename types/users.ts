export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export function isAdminRole(role?: UserRole | null): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  position: string;
  role: UserRole;
  organization_id: string | null;
  created_at?: string;
  updated_at?: string;
}
