import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../api/auth";
import { session } from "../../api/client";
import type { User } from "../../types";
type AuthContextValue = {
  user?: User;
  loading: boolean;
  error: Error | null;
  authenticate: (token: string) => Promise<void>;
  logout: () => void;
  retry: () => void;
};
const AuthContext = createContext<AuthContextValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const client = useQueryClient();
  const [token, setToken] = useState(session.get);
  const query = useQuery({
    queryKey: ["me", token],
    queryFn: authApi.me,
    enabled: !!token,
    retry: false,
    staleTime: 60000,
  });
  function logout() {
    session.clear();
    setToken(null);
    client.clear();
  }
  useEffect(() => {
    const expire = () => {
      setToken(null);
      client.clear();
    };
    window.addEventListener("session-expired", expire);
    return () => window.removeEventListener("session-expired", expire);
  }, [client]);
  async function authenticate(accessToken: string) {
    client.clear();
    session.set(accessToken);
    try {
      const user = await authApi.me();
      client.setQueryData(["me", accessToken], user);
      setToken(accessToken);
    } catch (error) {
      session.clear();
      throw error;
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user: token ? query.data : undefined,
        loading: !!token && query.isPending,
        error: token ? query.error : null,
        authenticate,
        logout,
        retry: () => void query.refetch(),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("AuthProvider required");
  return value;
}
