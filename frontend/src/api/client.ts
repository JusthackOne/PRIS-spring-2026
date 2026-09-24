export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}
export const session = {
  get: () => sessionStorage.getItem("citypulse-token"),
  set: (token: string) => sessionStorage.setItem("citypulse-token", token),
  clear: () => sessionStorage.removeItem("citypulse-token"),
};
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = session.get();
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = (await response.json().catch(() => null)) as {
    message?: string | string[];
  } | null;
  if (!response.ok) {
    if (response.status === 401 && token) {
      session.clear();
      window.dispatchEvent(new Event("session-expired"));
    }
    throw new ApiError(
      Array.isArray(data?.message)
        ? data.message.join(". ")
        : (data?.message ?? "Сервис недоступен. Попробуйте ещё раз"),
      response.status,
    );
  }
  return data as T;
}
export function queryString(values: Record<string, string | undefined>) {
  const entries = Object.entries(values).filter(
    (entry): entry is [string, string] => Boolean(entry[1]),
  );
  const result = new URLSearchParams(entries).toString();
  return result ? `?${result}` : "";
}
