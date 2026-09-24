import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Plus, ArrowLeft, ArrowUpRight, MapPin } from "lucide-react";
import { reportsApi } from "../../api/reports";
import { useAuth } from "../auth/auth-context";
import { useSave } from "../../hooks/use-save";
import {
  PageTitle,
  QueryState,
  Empty,
  StatusBadge,
} from "../../components/shared";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { categories, statuses, dateTime } from "../../utils/labels";
import { LocationForm, reportPayload } from "../incidents/location-form";
import type { Report, ReportInput, ReportStatus } from "../../types";
export function ReportTable({ reports }: { reports: Report[] }) {
  if (!reports.length)
    return (
      <Empty text="Обращений пока нет. Сообщите о проблеме, и она появится здесь." />
    );
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Обращение / адрес</th>
            <th>Категория</th>
            <th>Статус</th>
            <th>Создано</th>
            <th>
              <span className="sr-only">Открыть</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {reports.map((item) => (
            <tr key={item.id}>
              <td>
                <Link
                  className="font-medium hover:text-primary"
                  to={`/reports/${item.id}`}
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.address}
                </p>
              </td>
              <td>{categories[item.category]}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td className="whitespace-nowrap text-muted-foreground">
                {dateTime(item.createdAt)}
              </td>
              <td>
                <Button asChild size="icon" variant="ghost">
                  <Link
                    to={`/reports/${item.id}`}
                    aria-label={`Открыть: ${item.title}`}
                  >
                    <ArrowUpRight />
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ReportsPage() {
  const { user } = useAuth();
  const query = useQuery({ queryKey: ["reports"], queryFn: reportsApi.list });
  return (
    <>
      <PageTitle
        title={user?.role === "ADMIN" ? "Обращения жителей" : "Мои обращения"}
        description={
          user?.role === "ADMIN"
            ? "Проверяйте обращения и обновляйте ход решения"
            : "Сообщайте о проблемах и следите за их решением"
        }
      >
        <Button asChild>
          <Link to="/reports/new">
            <Plus />
            Создать обращение
          </Link>
        </Button>
      </PageTitle>
      <Card>
        <div className="border-b p-4 text-sm font-medium">
          {user?.role === "ADMIN" ? "Все обращения" : "Ваши обращения"}{" "}
          <span className="ml-2 text-muted-foreground">
            {query.data?.length ?? ""}
          </span>
        </div>
        <QueryState queries={[query]}>
          <ReportTable reports={query.data ?? []} />
        </QueryState>
      </Card>
    </>
  );
}
export function NewReportPage() {
  const navigate = useNavigate();
  const mutation = useSave(
    (data: ReportInput) => reportsApi.create(data),
    "Обращение отправлено",
    () => navigate("/reports"),
  );
  return (
    <>
      <PageTitle
        title="Новое обращение"
        description="Расскажите о проблеме — поможем городу стать лучше"
      >
        <Button variant="outline" asChild>
          <Link to="/reports">
            <ArrowLeft />К обращениям
          </Link>
        </Button>
      </PageTitle>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Что случилось?</CardTitle>
          <p className="text-sm text-muted-foreground">
            Все поля обязательны. Новое обращение получит статус «Открыто».
          </p>
        </CardHeader>
        <CardContent>
          <LocationForm
            pending={mutation.isPending}
            onSubmit={(data) => mutation.mutate(reportPayload(data))}
          />
        </CardContent>
      </Card>
    </>
  );
}
export function ReportDetailPage() {
  const { id = "" } = useParams();
  const { user } = useAuth();
  const query = useQuery({
    queryKey: ["reports", id],
    queryFn: () => reportsApi.get(id),
  });
  const mutation = useSave(
    (status: ReportStatus) => reportsApi.update(id, status),
    "Статус обращения обновлён",
  );
  const report = query.data;
  return (
    <>
      <PageTitle
        title="Карточка обращения"
        description="Информация и ход решения проблемы"
      >
        <Button variant="outline" asChild>
          <Link to="/reports">
            <ArrowLeft />К обращениям
          </Link>
        </Button>
      </PageTitle>
      <QueryState queries={[query]}>
        {report && (
          <Card className="max-w-4xl">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>{report.title}</CardTitle>
                <StatusBadge status={report.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {categories[report.category]} · {dateTime(report.createdAt)}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="whitespace-pre-wrap text-sm leading-7">
                {report.description}
              </p>
              <div className="grid gap-4 rounded-lg bg-muted p-4 sm:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Местоположение
                  </p>
                  <p className="flex items-start gap-2 text-sm">
                    <MapPin className="size-4 shrink-0 text-primary" />
                    {report.address}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {report.latitude}, {report.longitude}
                  </p>
                </div>
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">
                    Автор обращения
                  </p>
                  <p className="text-sm">{report.user.name}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Обновлено: {dateTime(report.updatedAt)}
                  </p>
                </div>
              </div>
              {user?.role === "ADMIN" && (
                <div className="border-t pt-6">
                  <h3 className="mb-3 text-sm font-medium">Изменить статус</h3>
                  <div className="flex flex-wrap gap-3">
                    {(["OPEN", "IN_PROGRESS", "RESOLVED"] as const).map(
                      (status) => (
                        <Button
                          key={status}
                          variant={
                            report.status === status ? "default" : "outline"
                          }
                          disabled={
                            mutation.isPending || report.status === status
                          }
                          onClick={() => mutation.mutate(status)}
                        >
                          {statuses[status]}
                        </Button>
                      ),
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </QueryState>
    </>
  );
}
