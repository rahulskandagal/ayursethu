import { HTMLAttributes } from "react";

export function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-xl2 border border-forest-100 bg-white p-5 shadow-card ${className}`} {...props} />;
}
