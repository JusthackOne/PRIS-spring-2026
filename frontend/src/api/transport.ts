import { api, queryString } from "./client";
import type { Route, Vehicle } from "../types";
export const transportApi = {
  routes: () => api<Route[]>("/routes"),
  vehicles: (routeId?: string) =>
    api<Vehicle[]>(`/vehicles${queryString({ routeId })}`),
};
