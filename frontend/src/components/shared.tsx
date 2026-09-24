import type { ReactNode } from "react";
import { AlertCircle, Inbox, LoaderCircle } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { statuses } from "../utils/labels";
export function StatusBadge({ status }: { status: keyof typeof statuses }) {
  const color =
    status === "RESOLVED"
      ? "bg-emerald-50 text-emerald-700"
      : status === "IN_PROGRESS" || status === "STOPPED"
        ? "bg-amber-50 text-amber-700"
        : status === "OUT_OF_SERVICE"
          ? "bg-slate-100 text-slate-600"
          : "bg-blue-50 text-blue-700";
  return (
    <Badge className={color}>
      <span className="size-1.5 rounded-full bg-current" />
      {statuses[status]}
    </Badge>
  );
}
export function PageTitle({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}
export function QueryState({
  queries,
  children,
}: {
  queries: {
    isPending: boolean;
    error: Error | null;
    refetch: () => unknown;
  }[];
  children: ReactNode;
}) {
  const failed = queries.find((q) => q.error);
  if (failed)
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-lg border bg-white p-10 text-center"
      >
        <AlertCircle className="text-destructive" />
        <p>{failed.error?.message}</p>
        <Button
          variant="outline"
          onClick={() => queries.forEach((q) => q.refetch())}
        >
          Повторить
        </Button>
      </div>
    );
  if (queries.some((q) => q.isPending))
    return (
      <div
        role="status"
        className="flex items-center justify-center gap-3 p-16 text-muted-foreground"
      >
        <LoaderCircle className="size-5 animate-spin" />
        Загрузка данных…
      </div>
    );
  return children;
}
export function Empty({ text = "Записей пока нет" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center text-muted-foreground">
      <Inbox className="size-8" />
      <p>{text}</p>
    </div>
  );
}
export function Field({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium">
        {label} <span className="text-muted-foreground">*</span>
      </label>
      {children}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
