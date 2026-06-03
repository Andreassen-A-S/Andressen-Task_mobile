import { User } from "./users";

export interface LoginRequest {
  email: string;
  password: string;
  device_name?: string;
}

export interface LoginResponse {
  token: string;
  refresh_token: string;
  user: User;
}
