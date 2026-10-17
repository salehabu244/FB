import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

export default function StepShell({
  step,
  title,
  hint,
  error,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="eyebrow">Step {step} of 7</span>
          <h3 className="mt-2 font-display text-2xl sm:text-3xl">{title}</h3>
          {hint && <p className="mt-1.5 max-w-xl text-sm text-brown-700/85">{hint}</p>}
        </div>
      </div>
      <div className="mt-6">{children}</div>
      {error && (
        <p
          data-field={error.includes("flower") ? "flowers" : undefined}
          className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
