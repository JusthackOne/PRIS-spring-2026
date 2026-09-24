import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Activity, ArrowRight, MapPin } from "lucide-react";
import { authApi } from "../../api/auth";
import { useAuth } from "./auth-context";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Field } from "../../components/shared";
const schema = z.object({
  name: z.string().trim().max(80).optional(),
  email: z.string().trim().email("Введите корректный email"),
  password: z
    .string()
    .min(8, "Минимум 8 символов")
    .max(72, "Максимум 72 символа")
    .refine(
      (value) => new TextEncoder().encode(value).length <= 72,
      "Пароль должен занимать не более 72 байт",
    ),
});
type Values = z.infer<typeof schema>;
export function AuthPage({ registration = false }: { registration?: boolean }) {
  const { user, authenticate } = useAuth();
  const navigate = useNavigate();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", name: "" },
  });
  const mutation = useMutation({
    mutationFn: async (values: Values) => {
      if (registration && (!values.name || values.name.length < 2)) {
        form.setError("name", { message: "Минимум 2 символа" });
        throw new Error("Укажите имя");
      }
      const data = registration
        ? await authApi.register({ ...values, name: values.name! })
        : await authApi.login({
            email: values.email,
            password: values.password,
          });
      await authenticate(data.accessToken);
      navigate("/");
    },
  });
  if (user) return <Navigate to="/" replace />;
  return (
    <div className="auth-page">
      <section className="auth-story">
        <div className="flex items-center gap-3 text-2xl font-semibold">
          <Activity className="size-9" />
          CityPulse
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-emerald-200">
            Город в поле зрения
          </span>
          <h1 className="mt-6 max-w-lg text-5xl font-semibold leading-tight">
            Большой город.
            <br />
            Общая забота.
          </h1>
          <p className="mt-6 max-w-md leading-7 text-slate-300">
            События, транспорт и обращения жителей — всё, что помогает сделать
            город лучше.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-100">
          <MapPin className="size-4" />
          Москва <span className="ml-3 text-white/50">Учебный прототип</span>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2 font-semibold text-primary lg:hidden">
            <Activity />
            CityPulse
          </div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">
            Личный кабинет
          </p>
          <h2 className="text-3xl font-semibold">
            {registration ? "Создать аккаунт" : "С возвращением"}
          </h2>
          <p className="mb-8 mt-3 text-sm text-muted-foreground">
            {registration
              ? "Участвуйте в жизни вашего города"
              : "Войдите, чтобы видеть пульс города"}
          </p>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
          >
            {registration && (
              <Field
                label="Имя"
                id="name"
                error={form.formState.errors.name?.message}
              >
                <Input
                  id="name"
                  autoComplete="name"
                  {...form.register("name")}
                />
              </Field>
            )}
            <Field
              label="Электронная почта"
              id="email"
              error={form.formState.errors.email?.message}
            >
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.ru"
                {...form.register("email")}
              />
            </Field>
            <Field
              label="Пароль"
              id="password"
              error={form.formState.errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete={
                  registration ? "new-password" : "current-password"
                }
                {...form.register("password")}
              />
            </Field>
            {mutation.error && (
              <p role="alert" className="text-sm text-destructive">
                {mutation.error.message}
              </p>
            )}
            <Button className="w-full" disabled={mutation.isPending}>
              {mutation.isPending
                ? "Подождите…"
                : registration
                  ? "Зарегистрироваться"
                  : "Войти"}
              <ArrowRight />
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {registration ? "Уже есть аккаунт? " : "Нет аккаунта? "}
            <Link
              className="font-medium text-primary"
              to={registration ? "/login" : "/register"}
            >
              {registration ? "Войти" : "Зарегистрироваться"}
            </Link>
          </p>
          <p className="mt-12 text-center text-xs text-muted-foreground">
            Smart City Monitoring Platform
          </p>
        </div>
      </section>
    </div>
  );
}
