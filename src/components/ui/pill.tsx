import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Pill({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-200/88",
        className,
      )}
      {...props}
    />
  );
}
