export type User = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
};
export type IncidentType =
  | "ACCIDENT"
  | "ROAD_WORK"
  | "UTILITY"
  | "SAFETY"
  | "OTHER";
export type IncidentStatus = "ACTIVE" | "IN_PROGRESS" | "RESOLVED";
export type ReportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";
export type Location = {
  title: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
};
export type IncidentInput = Location & {
  type: IncidentType;
  status: IncidentStatus;
};
export type Incident = IncidentInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
};
export type ReportInput = Location & { category: IncidentType };
export type Report = ReportInput & {
  id: string;
  userId: string;
  user: User;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
};
export type Route = {
  id: string;
  name: string;
  type: "BUS" | "TRAM" | "TROLLEYBUS";
  startPoint: string;
  endPoint: string;
};
export type Vehicle = {
  id: string;
  routeId: string;
  route: Route;
  number: string;
  latitude: number;
  longitude: number;
  speed: number;
  status: "ACTIVE" | "STOPPED" | "OUT_OF_SERVICE";
  updatedAt: string;
};
export type Stats = {
  activeIncidents: number;
  openReports: number;
  activeVehicles: number;
  utilityProblems: number;
  distribution: { type: IncidentType; count: number }[];
};
export type AdminStats = {
  users: number;
  reports: number;
  activeIncidents: number;
  latestReports: Report[];
};
