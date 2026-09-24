import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as AlertPrimitive from "@radix-ui/react-alert-dialog";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./button";
export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1000] bg-slate-950/40 backdrop-blur-sm" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-[1001] max-h-[90vh] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          <DialogPrimitive.Title className="pr-8 text-xl font-semibold">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mb-6 mt-2 text-sm text-muted-foreground">
            {description}
          </DialogPrimitive.Description>
          {children}
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-3 top-3"
              aria-label="Закрыть"
            >
              <X />
            </Button>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
export function DeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  pending: boolean;
}) {
  return (
    <AlertPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <AlertPrimitive.Portal>
        <AlertPrimitive.Overlay className="fixed inset-0 z-[1000] bg-slate-950/40" />
        <AlertPrimitive.Content className="fixed left-1/2 top-1/2 z-[1001] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-xl">
          <AlertPrimitive.Title className="text-lg font-semibold">
            Удалить инцидент?
          </AlertPrimitive.Title>
          <AlertPrimitive.Description className="my-4 text-sm text-muted-foreground">
            Инцидент исчезнет из списка и с карты. Это действие нельзя отменить.
          </AlertPrimitive.Description>
          <div className="flex justify-end gap-3">
            <AlertPrimitive.Cancel asChild>
              <Button variant="outline" disabled={pending}>
                Отмена
              </Button>
            </AlertPrimitive.Cancel>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={onConfirm}
            >
              {pending ? "Удаление…" : "Удалить"}
            </Button>
          </div>
        </AlertPrimitive.Content>
      </AlertPrimitive.Portal>
    </AlertPrimitive.Root>
  );
}
