import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BusFront, ArrowRight } from "lucide-react";
import { transportApi } from "../../api/transport";
import {
  PageTitle,
  QueryState,
  Empty,
  StatusBadge,
} from "../../components/shared";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CityMap } from "../../components/city-map";
import { dateTime, transportTypes } from "../../utils/labels";
export function TransportPage() {
  const [routeId, setRouteId] = useState("");
  const routes = useQuery({
    queryKey: ["routes"],
    queryFn: transportApi.routes,
  });
  const vehicles = useQuery({
    queryKey: ["vehicles", routeId],
    queryFn: () => transportApi.vehicles(routeId),
  });
  return (
    <>
      <PageTitle
        title="Общественный транспорт"
        description="Маршруты и транспортные средства на карте города"
      />
      <QueryState queries={[routes]}>
        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {routes.data?.map((route) => (
            <button
              key={route.id}
              className={`rounded-lg border bg-white p-4 text-left transition-colors ${route.id === routeId ? "border-primary ring-1 ring-primary" : "hover:border-primary/50"}`}
              onClick={() => setRouteId(route.id)}
            >
              <div className="mb-3 flex items-center gap-2">
                <BusFront className="size-5 text-primary" />
                <span className="text-lg font-semibold">{route.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {transportTypes[route.type]}
                </span>
              </div>
              <p className="text-xs leading-5">
                {route.startPoint}
                <ArrowRight className="my-1 size-3 text-muted-foreground" />
                {route.endPoint}
              </p>
            </button>
          ))}
        </div>
        {!routes.data?.length && <Empty text="Маршрутов пока нет" />}
      </QueryState>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">
          {routeId
            ? `Маршрут ${routes.data?.find((r) => r.id === routeId)?.name ?? ""}`
            : "Все транспортные средства"}
        </h2>
        {routeId && (
          <Button variant="outline" onClick={() => setRouteId("")}>
            Все маршруты
          </Button>
        )}
      </div>
      <QueryState queries={[vehicles]}>
        <div className="space-y-6">
          <CityMap vehicles={vehicles.data ?? []} />
          <Card>
            {vehicles.data?.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Номер</th>
                      <th>Маршрут</th>
                      <th>Скорость</th>
                      <th>Статус</th>
                      <th>Последнее обновление</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.data.map((vehicle) => (
                      <tr key={vehicle.id}>
                        <td className="font-medium">{vehicle.number}</td>
                        <td>{vehicle.route.name}</td>
                        <td>{vehicle.speed} км/ч</td>
                        <td>
                          {vehicle.status === "ACTIVE" ? (
                            <span className="text-sm text-primary">
                              На маршруте
                            </span>
                          ) : (
                            <StatusBadge status={vehicle.status} />
                          )}
                        </td>
                        <td>{dateTime(vehicle.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty text="На выбранном маршруте нет транспорта" />
            )}
          </Card>
        </div>
      </QueryState>
    </>
  );
}
