import Link from "next/link";

import { GlowCard } from "@/components/ui/glow-card";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-5xl items-center px-6 py-16 lg:px-10">
      <GlowCard className="w-full space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">404</p>
        <h1 className="font-display text-6xl uppercase tracking-[0.08em] text-stone-50">Page Not Found</h1>
        <p className="mx-auto max-w-xl text-sm leading-7 text-stone-400">
          这页暂时还没编入唐氏杯的档案馆。我们先回首页，或者继续去看选手库和赛制页。
        </p>
        <div className="pt-3">
          <Link
            href="/"
            className="inline-flex rounded-full border border-white/10 bg-white/6 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-white/10"
          >
            返回首页
          </Link>
        </div>
      </GlowCard>
    </div>
  );
}
