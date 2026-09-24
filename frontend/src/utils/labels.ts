import type { IncidentType } from "../types";
export const categories: Record<IncidentType, string> = {
  ACCIDENT: "Происшествия",
  ROAD_WORK: "Дорожные работы",
  UTILITY: "Коммунальные проблемы",
  SAFETY: "Безопасность",
  OTHER: "Другое",
};
export const statuses = {
  ACTIVE: "Активен",
  OPEN: "Открыто",
  IN_PROGRESS: "В работе",
  RESOLVED: "Решено",
  STOPPED: "На остановке",
  OUT_OF_SERVICE: "Вне маршрута",
};
export const transportTypes = {
  BUS: "Автобус",
  TRAM: "Трамвай",
  TROLLEYBUS: "Троллейбус",
};
export const categoryColors: Record<IncidentType, string> = {
  ACCIDENT: "#df735c",
  ROAD_WORK: "#d6a448",
  UTILITY: "#4b8dc5",
  SAFETY: "#9875c2",
  OTHER: "#82949c",
};
export const dateTime = (value: string) =>
  new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
