import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";
import { cn } from "@getsalons/shared/utils";

const baseField =
  "w-full rounded-xl border border-line bg-card px-3.5 py-2.5 text-sm text-fg " +
  "placeholder:text-fg-faint transition-colors " +
  "focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold-500/20 " +
  "disabled:cursor-not-allowed disabled:opacity-60 " +
  "[color-scheme:light_dark]";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return <input ref={ref} className={cn(baseField, className)} {...props} />;
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(baseField, "min-h-24 resize-y", className)}
      {...props}
    />
  );
});

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(baseField, "appearance-none", className)} {...props}>
      {children}
    </select>
  );
});

export function Label({
  htmlFor,
  children,
  required,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-fg"
    >
      {children}
      {required && <span className="ml-0.5 text-gold">*</span>}
    </label>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-red-500">{message}</p>;
}
