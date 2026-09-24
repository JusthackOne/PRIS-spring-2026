import React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Outlet,
  Route,
  Routes,
  Link,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "./features/auth/auth-context";
import { AuthPage } from "./features/auth/auth-page";
import { Layout } from "./components/layout";
import { DashboardPage } from "./pages/dashboard";
import { MapPage } from "./pages/map";
import { AdminPage } from "./pages/admin";
import { IncidentsPage } from "./features/incidents/incidents-page";
import {
  ReportsPage,
  NewReportPage,
  ReportDetailPage,
} from "./features/reports/reports-page";
import { TransportPage } from "./features/transport/transport-page";
import { Button } from "./components/ui/button";
import "./styles.css";
import "leaflet/dist/leaflet.css";
const client = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 15000, refetchInterval: 30000, retry: 1 },
  },
});
function Protected({ admin = false }: { admin?: boolean }) {
  const { user, loading, error, retry, logout } = useAuth();
  if (loading)
    return (
      <p role="status" className="p-12 text-center">
        Проверяем сессию…
      </p>
    );
  if (error)
    return (
      <div className="space-y-4 p-12 text-center">
        <p role="alert">{error.message}</p>
        <Button onClick={retry}>Повторить</Button>
        <Button variant="ghost" onClick={logout}>
          Выйти
        </Button>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  if (admin && user.role !== "ADMIN")
    return (
      <div className="space-y-4 p-8">
        <h1 className="text-xl font-semibold">Доступ ограничен</h1>
        <p>Эта страница доступна администратору.</p>
        <Link to="/" className="text-primary">
          Вернуться к обзору
        </Link>
      </div>
    );
  return <Outlet />;
}
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<AuthPage key="login" />} />
            <Route
              path="/register"
              element={<AuthPage key="register" registration />}
            />
            <Route element={<Protected />}>
              <Route element={<Layout />}>
                <Route index element={<DashboardPage />} />
                <Route path="map" element={<MapPage />} />
                <Route path="incidents" element={<IncidentsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="reports/new" element={<NewReportPage />} />
                <Route path="reports/:id" element={<ReportDetailPage />} />
                <Route path="transport" element={<TransportPage />} />
                <Route element={<Protected admin />}>
                  <Route path="admin" element={<AdminPage />} />
                </Route>
                <Route
                  path="*"
                  element={
                    <div className="p-8">
                      <h1 className="mb-4 text-xl">Страница не найдена</h1>
                      <Link className="text-primary" to="/">
                        К обзору города
                      </Link>
                    </div>
                  }
                />
              </Route>
            </Route>
          </Routes>
          <Toaster richColors position="bottom-right" closeButton />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
