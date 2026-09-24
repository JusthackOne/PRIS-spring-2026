import { api } from "./client";
import type { Stats, AdminStats } from "../types";
export const dashboardApi = {
  stats: () => api<Stats>("/dashboard/stats"),
  admin: () => api<AdminStats>("/dashboard/admin"),
};
