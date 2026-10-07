import { Loader2 } from "lucide-react";

export function Spinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-forest-500">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{message}</div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-xl2 border border-dashed border-forest-200 bg-white p-10 text-center">
      <p className="font-medium text-forest-800">{title}</p>
      {description && <p className="mt-1 text-sm text-forest-500">{description}</p>}
    </div>
  );
}
