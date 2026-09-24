import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
export function useSave<T>(
  mutationFn: (data: T) => Promise<unknown>,
  message: string,
  onSuccess?: () => void,
) {
  const client = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await client.invalidateQueries();
      toast.success(message);
      onSuccess?.();
    },
    onError: (error: Error) => toast.error(error.message),
  });
}
