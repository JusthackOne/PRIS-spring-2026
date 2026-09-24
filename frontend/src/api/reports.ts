import { api } from "./client";
import type { Report, ReportInput, ReportStatus } from "../types";
export const reportsApi = {
  list: () => api<Report[]>("/reports"),
  get: (id: string) => api<Report>(`/reports/${id}`),
  create: (data: ReportInput) =>
    api<Report>("/reports", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, status: ReportStatus) =>
    api<Report>(`/reports/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};
