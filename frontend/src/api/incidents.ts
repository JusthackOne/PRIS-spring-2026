import { api, queryString } from "./client";
import type { Incident, IncidentInput } from "../types";
export const incidentsApi = {
  list: (filters: { type?: string; status?: string } = {}) =>
    api<Incident[]>(`/incidents${queryString(filters)}`),
  create: (data: IncidentInput) =>
    api<Incident>("/incidents", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: IncidentInput) =>
    api<Incident>(`/incidents/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: string) =>
    api<Incident>(`/incidents/${id}`, { method: "DELETE" }),
};
