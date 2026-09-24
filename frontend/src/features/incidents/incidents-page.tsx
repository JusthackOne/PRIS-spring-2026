import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { incidentsApi } from "../../api/incidents";
import { useAuth } from "../auth/auth-context";
import { useSave } from "../../hooks/use-save";
import {
  PageTitle,
  QueryState,
  Empty,
  StatusBadge,
} from "../../components/shared";
import { Button } from "../../components/ui/button";
import { Select } from "../../components/ui/input";
import { Card } from "../../components/ui/card";
import { Dialog, DeleteDialog } from "../../components/ui/dialog";
import {
  categories,
  statuses,
  dateTime,
  categoryColors,
} from "../../utils/labels";
import { LocationForm, incidentPayload } from "./location-form";
import type { Incident, IncidentInput } from "../../types";
export function IncidentsPage() {
  const { user } = useAuth();
  const admin = user?.role === "ADMIN";
  const [search, setSearch] = useSearchParams();
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<Incident | null>(null);
  const [deleting, setDeleting] = useState<Incident | null>(null);
  const open = search.get("new") === "1" || !!editing;
  const query = useQuery({
    queryKey: ["incidents", type, status],
    queryFn: () => incidentsApi.list({ type, status }),
  });
  function close() {
    setEditing(null);
    setSearch({});
  }
  const save = useSave(
    (data: IncidentInput) =>
      editing
        ? incidentsApi.update(editing.id, data)
        : incidentsApi.create(data),
    "Инцидент сохранён",
    close,
  );
  const remove = useSave(
    (id: string) => incidentsApi.remove(id),
    "Инцидент удалён",
    () => setDeleting(null),
  );
  return (
    <>
      <PageTitle
        title="Городские инциденты"
        description="События и работы, которые влияют на жизнь города"
      >
        {admin && (
          <Button onClick={() => setSearch({ new: "1" })}>
            <Plus />
            Создать инцидент
          </Button>
        )}
      </PageTitle>
      <Card>
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row">
          <Select
            aria-label="Тип инцидента"
            className="sm:w-64"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Все категории</option>
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
          <Select
            aria-label="Статус инцидента"
            className="sm:w-48"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Все статусы</option>
            {(["ACTIVE", "IN_PROGRESS", "RESOLVED"] as const).map((key) => (
              <option key={key} value={key}>
                {statuses[key]}
              </option>
            ))}
          </Select>
          <span className="ml-auto self-center text-xs text-muted-foreground">
            Найдено: {query.data?.length ?? "—"}
          </span>
        </div>
        <QueryState queries={[query]}>
          {query.data?.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Событие / адрес</th>
                    <th>Категория</th>
                    <th>Статус</th>
                    <th>Дата</th>
                    {admin && <th>Действия</th>}
                  </tr>
                </thead>
                <tbody>
                  {query.data.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="font-medium">{item.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {item.address}
                        </div>
                        <p className="mt-2 max-w-md text-xs text-muted-foreground">
                          {item.description}
                        </p>
                      </td>
                      <td>
                        <span
                          className="mr-2 inline-block size-2 rounded-full"
                          style={{ background: categoryColors[item.type] }}
                        />
                        {categories[item.type]}
                      </td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="whitespace-nowrap text-muted-foreground">
                        {dateTime(item.createdAt)}
                      </td>
                      {admin && (
                        <td>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Редактировать: ${item.title}`}
                              onClick={() => setEditing(item)}
                            >
                              <Pencil />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              aria-label={`Удалить: ${item.title}`}
                              onClick={() => setDeleting(item)}
                            >
                              <Trash2 />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="По выбранным фильтрам инцидентов нет" />
          )}
        </QueryState>
      </Card>
      {admin && (
        <>
          <Dialog
            open={open}
            onOpenChange={(value) => {
              if (!value && !save.isPending) close();
            }}
            title={editing ? "Редактировать инцидент" : "Новый инцидент"}
            description="Укажите сведения о событии и его местоположение."
          >
            <LocationForm
              key={editing?.id ?? "new"}
              initial={editing ?? undefined}
              incident
              pending={save.isPending}
              onSubmit={(data) => save.mutate(incidentPayload(data))}
            />
          </Dialog>
          <DeleteDialog
            open={!!deleting}
            onOpenChange={(value) => {
              if (!value && !remove.isPending) setDeleting(null);
            }}
            pending={remove.isPending}
            onConfirm={() => deleting && remove.mutate(deleting.id)}
          />
        </>
      )}
    </>
  );
}
