import type { User } from "@/types/users";

type ApiUser = Partial<User> & Pick<User, "user_id" | "email" | "role" | "name">;

export function normalizeUser(user: ApiUser): User {
  return {
    ...user,
    position: user.position ?? "",
    organization_id: user.organization_id ?? null,
  } as User;
}
