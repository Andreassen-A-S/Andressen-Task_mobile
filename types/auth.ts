import type { User } from "./users";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface VerifyResponse {
  user: User;
}
