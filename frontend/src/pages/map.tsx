import { useQuery } from "@tanstack/react-query";
import { incidentsApi } from "../api/incidents";
import { transportApi } from "../api/transport";
import { CityMap } from "../components/city-map";
import { PageTitle, QueryState } from "../components/shared";
export function MapPage() {
  const incidents = useQuery({
    queryKey: ["incidents"],
    queryFn: () => incidentsApi.list(),
  });
  const vehicles = useQuery({
    queryKey: ["vehicles"],
    queryFn: () => transportApi.vehicles(),
  });
  return (
    <>
      <PageTitle
        title="Карта города"
        description="Выберите категорию и нажмите на маркер, чтобы узнать подробности"
      />
      <QueryState queries={[incidents, vehicles]}>
        <CityMap
          large
          incidents={incidents.data ?? []}
          vehicles={vehicles.data ?? []}
        />
      </QueryState>
    </>
  );
}
