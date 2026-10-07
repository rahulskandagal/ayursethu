import { HTMLAttributes } from "react";

type Tone = "green" | "gold" | "gray" | "red";

const toneClasses: Record<Tone, string> = {
  green: "bg-forest-100 text-forest-700",
  gold: "bg-gold-400/20 text-gold-600",
  gray: "bg-gray-100 text-gray-600",
  red: "bg-red-100 text-red-700",
};

export function Badge({ tone = "gray", className = "", ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    />
  );
}
