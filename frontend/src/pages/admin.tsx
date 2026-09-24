import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, MessageSquare } from "lucide-react";
import { dashboardApi } from "../api/dashboard";
import { PageTitle, QueryState } from "../components/shared";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ReportTable } from "../features/reports/reports-page";
export function AdminPage() {
  const query = useQuery({ queryKey: ["admin"], queryFn: dashboardApi.admin });
  return (
    <>
      <PageTitle
        title="Администрирование"
        description="Контроль городских событий и обращений жителей"
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link to="/incidents?new=1">
            <Plus />
            Создать инцидент
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/reports">
            <MessageSquare />
            Посмотреть обращения
          </Link>
        </Button>
      </div>
      <QueryState queries={[query]}>
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {[
            ["Пользователи", query.data?.users],
            ["Все обращения", query.data?.reports],
            ["Активные инциденты", query.data?.activeIncidents],
          ].map(([label, count]) => (
            <Card key={label} className="p-6">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{count}</p>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Последние обращения</CardTitle>
          </CardHeader>
          <ReportTable reports={query.data?.latestReports ?? []} />
        </Card>
      </QueryState>
    </>
  );
}
