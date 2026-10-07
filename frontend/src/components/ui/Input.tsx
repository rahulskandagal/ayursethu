import { InputHTMLAttributes, forwardRef, LabelHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      className={`w-full rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm text-forest-900 outline-none placeholder:text-forest-400 focus:border-forest-500 focus:ring-2 focus:ring-forest-200 ${className}`}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className = "", ...props }, ref) => (
    <textarea
      ref={ref}
      className={`w-full rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm text-forest-900 outline-none placeholder:text-forest-400 focus:border-forest-500 focus:ring-2 focus:ring-forest-200 ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className = "", ...props }, ref) => (
    <select
      ref={ref}
      className={`w-full rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm text-forest-900 outline-none focus:border-forest-500 focus:ring-2 focus:ring-forest-200 ${className}`}
      {...props}
    />
  )
);
Select.displayName = "Select";

export function Label(props: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className="mb-1 block text-sm font-medium text-forest-800" {...props} />;
}
