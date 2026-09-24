import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Map,
  TriangleAlert,
  BusFront,
  MessageSquare,
  ShieldCheck,
  LogOut,
  MapPin,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../features/auth/auth-context";
import { Button } from "./ui/button";
const navigation = [
  { to: "/", label: "Обзор города", icon: LayoutDashboard },
  { to: "/map", label: "Карта города", icon: Map },
  { to: "/incidents", label: "Инциденты", icon: TriangleAlert },
  { to: "/transport", label: "Транспорт", icon: BusFront },
  { to: "/reports", label: "Обращения", icon: MessageSquare },
];
export function Layout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const current = location.pathname.startsWith("/admin")
    ? "Администрирование"
    : (navigation.find(
        (n) => n.to !== "/" && location.pathname.startsWith(n.to),
      )?.label ?? "Обзор города");
  return (
    <div className="app-shell">
      {open && (
        <button
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Закрыть меню"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="flex items-center gap-3 px-6 py-8">
          <span className="flex size-10 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
            <Activity />
          </span>
          <div>
            <div className="text-xl font-semibold tracking-tight">
              CityPulse<span className="text-emerald-400">.</span>
            </div>
            <div className="mt-0.5 text-[10px] text-slate-400">
              Smart City Monitoring Platform
            </div>
          </div>
          <Button
            className="ml-auto lg:hidden"
            variant="ghost"
            size="icon"
            aria-label="Закрыть меню"
            onClick={() => setOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="px-6 pb-3 pt-6 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
          Мониторинг
        </div>
        <nav className="space-y-1 px-3" aria-label="Основная навигация">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              end={to === "/"}
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-active" : ""}`
              }
            >
              <Icon className="size-[18px]" />
              {label}
            </NavLink>
          ))}
          {user?.role === "ADMIN" && (
            <>
              <div className="px-3 pb-3 pt-8 text-[10px] uppercase tracking-[0.2em] text-slate-500">
                Управление
              </div>
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "nav-active" : ""}`
                }
              >
                <ShieldCheck className="size-[18px]" />
                Администрирование
              </NavLink>
            </>
          )}
        </nav>
        <div className="mt-auto p-6">
          <div className="rounded-lg border border-white/10 p-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="size-2 rounded-full bg-emerald-400" />
              Демонстрационный город
            </div>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              События и транспорт представлены тестовыми данными.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 p-6">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm">
            {user?.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user?.name}</p>
            <p className="text-xs text-slate-400">
              {user?.role === "ADMIN" ? "Администратор" : "Житель города"}
            </p>
          </div>
          <button
            onClick={logout}
            title="Выйти"
            aria-label="Выйти"
            className="rounded p-2 text-slate-400 hover:text-white"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <Button
              size="icon"
              variant="ghost"
              className="lg:hidden"
              aria-label="Открыть меню"
              onClick={() => setOpen(true)}
            >
              <Menu />
            </Button>
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Рабочее пространство
            </span>
            <span className="hidden text-border sm:inline">/</span>
            <span className="text-sm font-medium">{current}</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-primary" />
              Москва
            </span>
            <span className="hidden border-l pl-4 text-muted-foreground xl:inline">
              {new Intl.DateTimeFormat("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }).format(new Date())}
            </span>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
        <footer className="px-6 pb-4 text-xs text-muted-foreground">
          CityPulse · Учебная платформа мониторинга городской инфраструктуры
        </footer>
      </div>
    </div>
  );
}
