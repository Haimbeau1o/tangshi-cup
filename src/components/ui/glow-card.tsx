import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function GlowCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl",
        "before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top_left,rgba(33,211,193,0.18),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(255,94,58,0.16),transparent_32%)] before:opacity-100",
        "after:pointer-events-none after:absolute after:inset-x-6 after:top-0 after:h-px after:bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)]",
        className,
      )}
      {...props}
    />
  );
}
