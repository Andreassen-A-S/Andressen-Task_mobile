import type { User } from "@/types/users";

type ApiUser = Partial<User> & Pick<User, "user_id" | "email" | "role" | "name">;

export function normalizeUser(user: ApiUser): User {
  return {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    position_id: user.position_id ?? null,
    position: user.position ?? null,
    profile_picture_url: user.profile_picture_url ?? null,
    organization_id: user.organization_id ?? null,
    organization: user.organization ?? null,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}
