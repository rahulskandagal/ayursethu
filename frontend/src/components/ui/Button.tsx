import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const variantClasses: Record<Variant, string> = {
  primary: "bg-forest-600 text-white hover:bg-forest-700",
  secondary: "bg-gold-500 text-forest-900 hover:bg-gold-600",
  outline: "border border-forest-300 text-forest-700 hover:bg-forest-50",
  ghost: "text-forest-700 hover:bg-forest-50",
  danger: "bg-red-600 text-white hover:bg-red-700",
};

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
