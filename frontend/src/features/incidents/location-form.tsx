import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field } from "../../components/shared";
import { Input, Select, Textarea } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { categories, statuses } from "../../utils/labels";
import type { IncidentInput, ReportInput } from "../../types";
import { CityMap } from "../../components/city-map";
const schema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Минимум 3 символа")
    .max(160, "Максимум 160 символов"),
  description: z
    .string()
    .trim()
    .min(10, "Опишите проблему подробнее: минимум 10 символов")
    .max(3000, "Максимум 3000 символов"),
  address: z
    .string()
    .trim()
    .min(3, "Укажите адрес")
    .max(300, "Максимум 300 символов"),
  latitude: z
    .number({ invalid_type_error: "Введите число" })
    .min(-90, "От −90 до 90")
    .max(90, "От −90 до 90"),
  longitude: z
    .number({ invalid_type_error: "Введите число" })
    .min(-180, "От −180 до 180")
    .max(180, "От −180 до 180"),
  category: z.enum(["ACCIDENT", "ROAD_WORK", "UTILITY", "SAFETY", "OTHER"]),
  status: z.enum(["ACTIVE", "IN_PROGRESS", "RESOLVED"]),
});
type Values = z.infer<typeof schema>;
type Props = {
  initial?: IncidentInput;
  incident?: boolean;
  pending: boolean;
  onSubmit: (data: Values) => void;
};
export function incidentPayload(data: Values): IncidentInput {
  const { category, ...rest } = data;
  return { ...rest, type: category };
}
export function reportPayload(data: Values): ReportInput {
  return {
    title: data.title,
    description: data.description,
    category: data.category,
    address: data.address,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}
export function LocationForm({
  initial,
  incident = false,
  pending,
  onSubmit,
}: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      address: initial?.address ?? "",
      latitude: initial?.latitude ?? 55.752,
      longitude: initial?.longitude ?? 37.621,
      category: initial?.type ?? "UTILITY",
      status: initial?.status ?? "ACTIVE",
    },
  });
  const latitude = watch("latitude");
  const longitude = watch("longitude");
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field id="title" label="Название" error={errors.title?.message}>
        <Input
          id="title"
          placeholder="Например, не работает уличное освещение"
          {...register("title")}
        />
      </Field>
      <Field
        id="description"
        label="Описание"
        error={errors.description?.message}
      >
        <Textarea
          id="description"
          placeholder="Что произошло и где нужна помощь?"
          {...register("description")}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="category" label="Категория" error={errors.category?.message}>
          <Select id="category" {...register("category")}>
            {Object.entries(categories).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        {incident && (
          <Field id="status" label="Статус" error={errors.status?.message}>
            <Select id="status" {...register("status")}>
              {(["ACTIVE", "IN_PROGRESS", "RESOLVED"] as const).map((key) => (
                <option key={key} value={key}>
                  {statuses[key]}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>
      <Field id="address" label="Адрес" error={errors.address?.message}>
        <Input
          id="address"
          placeholder="Москва, улица, дом"
          {...register("address")}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="latitude" label="Широта" error={errors.latitude?.message}>
          <Input
            id="latitude"
            type="number"
            step="any"
            {...register("latitude", { valueAsNumber: true })}
          />
        </Field>
        <Field id="longitude" label="Долгота" error={errors.longitude?.message}>
          <Input
            id="longitude"
            type="number"
            step="any"
            {...register("longitude", { valueAsNumber: true })}
          />
        </Field>
      </div>
      <p className="text-xs text-muted-foreground">
        Укажите координаты или выберите точку на карте. Адрес заполните
        отдельно.
      </p>
      <CityMap
        picker={(lat, lng) => {
          setValue("latitude", Number(lat.toFixed(6)), {
            shouldValidate: true,
          });
          setValue("longitude", Number(lng.toFixed(6)), {
            shouldValidate: true,
          });
        }}
        point={
          Number.isFinite(latitude) && Number.isFinite(longitude)
            ? [latitude, longitude]
            : undefined
        }
      />
      <div className="flex justify-end border-t pt-4">
        <Button disabled={pending} type="submit">
          {pending
            ? "Сохранение…"
            : incident
              ? "Сохранить инцидент"
              : "Отправить обращение"}
        </Button>
      </div>
    </form>
  );
}
