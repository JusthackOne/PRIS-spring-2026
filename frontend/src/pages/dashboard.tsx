import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  TriangleAlert,
  MessageSquare,
  BusFront,
  Droplets,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { dashboardApi } from "../api/dashboard";
import { incidentsApi } from "../api/incidents";
import { transportApi } from "../api/transport";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  PageTitle,
  QueryState,
  StatusBadge,
  Empty,
} from "../components/shared";
import { CityMap } from "../components/city-map";
import { categories, categoryColors, dateTime } from "../utils/labels";
export function DashboardPage() {
  const stats = useQuery({ queryKey: ["stats"], queryFn: dashboardApi.stats });
  const incidents = useQuery({
    queryKey: ["incidents"],
    queryFn: () => incidentsApi.list(),
  });
  const vehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => transportApi.vehicles(),
  });
  const metrics = [
    {
      label: "Активные инциденты",
      value: stats.data?.activeIncidents,
      icon: TriangleAlert,
      color: "text-orange-600 bg-orange-50",
      hint: "Требуют внимания",
      to: "/incidents",
    },
    {
      label: "Открытые обращения",
      value: stats.data?.openReports,
      icon: MessageSquare,
      color: "text-blue-600 bg-blue-50",
      hint: "Ожидают решения",
      to: "/reports",
    },
    {
      label: "Транспорт на маршрутах",
      value: stats.data?.activeVehicles,
      icon: BusFront,
      color: "text-emerald-600 bg-emerald-50",
      hint: "В движении по городу",
      to: "/transport",
    },
    {
      label: "Коммунальные проблемы",
      value: stats.data?.utilityProblems,
      icon: Droplets,
      color: "text-violet-600 bg-violet-50",
      hint: "Работа городских служб",
      to: "/map",
    },
  ];
  const distribution =
    stats.data?.distribution.map((row) => ({
      ...row,
      name: categories[row.type],
    })) ?? [];
  return (
    <>
      <PageTitle
        title="Обзор города"
        description="Всё важное о городской инфраструктуре в одном месте"
      >
        <Button asChild>
          <Link to="/reports/new">
            <Plus />
            Сообщить о проблеме
          </Link>
        </Button>
      </PageTitle>
      <QueryState queries={[stats]}>
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, icon: Icon, color, hint, to }) => (
            <Card key={label} className="p-4">
              <div className="flex items-center justify-between">
                <span
                  className={`flex size-10 items-center justify-center rounded-lg ${color}`}
                >
                  <Icon className="size-5" />
                </span>
                <Link
                  to={to}
                  aria-label={label}
                  className="text-muted-foreground hover:text-primary"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight">
                {value ?? "—"}
              </p>
              <p className="mt-1 text-sm font-medium">{label}</p>
              <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
            </Card>
          ))}
        </div>
      </QueryState>
      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Город на карте</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              События и транспорт · Москва
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/map">
              Открыть карту
              <ArrowUpRight />
            </Link>
          </Button>
        </div>
        <QueryState queries={[incidents, vehicles]}>
          <CityMap
            incidents={incidents.data ?? []}
            vehicles={vehicles.data ?? []}
          />
        </QueryState>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Последние события</CardTitle>
            <Link className="text-xs font-medium text-primary" to="/incidents">
              Все события →
            </Link>
          </CardHeader>
          <QueryState queries={[incidents]}>
            {incidents.data?.length ? (
              <div className="px-6 pb-3">
                {incidents.data.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 border-t py-4"
                  >
                    <span
                      className="mt-1.5 size-2 shrink-0 rounded-full"
                      style={{ background: categoryColors[item.type] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.address}
                      </p>
                      <p className="mt-2 text-[11px] text-muted-foreground">
                        {dateTime(item.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                ))}
              </div>
            ) : (
              <Empty text="Городских событий пока нет" />
            )}
          </QueryState>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Инциденты по категориям</CardTitle>
            <p className="text-xs text-muted-foreground">
              Все зарегистрированные события
            </p>
          </CardHeader>
          <CardContent>
            <QueryState queries={[stats]}>
              {distribution.length ? (
                <>
                  <div
                    className="h-48"
                    aria-label="Круговая диаграмма категорий инцидентов"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distribution}
                          dataKey="count"
                          nameKey="name"
                          innerRadius={52}
                          outerRadius={78}
                          paddingAngle={4}
                          isAnimationActive={false}
                        >
                          {distribution.map((row) => (
                            <Cell
                              key={row.type}
                              fill={categoryColors[row.type]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [value, "Количество"]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {distribution.map((row) => (
                      <div
                        key={row.type}
                        className="flex items-center gap-2 text-xs"
                      >
                        <span
                          className="size-2 rounded-full"
                          style={{ background: categoryColors[row.type] }}
                        />
                        <span className="text-muted-foreground">
                          {row.name}
                        </span>
                        <span className="ml-auto font-medium">{row.count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <Empty text="Нет данных для диаграммы" />
              )}
            </QueryState>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
