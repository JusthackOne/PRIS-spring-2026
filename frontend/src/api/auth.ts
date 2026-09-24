import { api } from "./client";
import type { User } from "../types";
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api<{ accessToken: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: { name: string; email: string; password: string }) =>
    api<{ accessToken: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => api<User>("/auth/me"),
};
