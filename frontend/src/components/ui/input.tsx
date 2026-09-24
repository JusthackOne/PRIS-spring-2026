import * as React from "react";
import { cn } from "../../utils/cn";
export const inputClass =
  "flex h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50";
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(inputClass, className)} {...props} />
));
Input.displayName = "Input";
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(inputClass, "min-h-28", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(inputClass, className)} {...props} />
));
Select.displayName = "Select";
