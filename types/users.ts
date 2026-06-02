export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  TERMINATED = "TERMINATED",
}

export function isAdminRole(role?: UserRole | null): boolean {
  return role === UserRole.ADMIN;
}

export interface PositionSummary {
  position_id: string;
  name: string;
}

export interface OrganizationSummary {
  org_id: string;
  name: string;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  position_id: string | null;
  position: PositionSummary | null;
  role: UserRole;
  status?: UserStatus;
  profile_picture_url: string | null;
  organization_id: string | null;
  organization?: OrganizationSummary | null;
  created_at?: string;
  updated_at?: string;
}
