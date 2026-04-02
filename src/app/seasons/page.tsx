import Link from "next/link";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { seasons } from "@/lib/data/mock-site";

export const metadata = {
  title: "赛季",
};

export default function SeasonsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
      <SectionHeading
        eyebrow="Seasons"
        title="让唐氏杯从一场比赛变成连续历史"
        description="赛季页不是装饰品。它会把冠军、MVP、宿敌和战术风格沉淀下来，让每次比赛都能接到下一次。"
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {seasons.map((season) => (
          <GlowCard key={season.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <Pill>{season.label}</Pill>
              <Link href={`/seasons/${season.slug}`} className="text-sm font-semibold text-cyan-300">
                打开赛季
              </Link>
            </div>
            <div>
              <h2 className="font-display text-5xl uppercase tracking-[0.08em] text-stone-50">{season.name}</h2>
              <p className="mt-3 text-base leading-8 text-stone-300/82">{season.theme}</p>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Champion</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">{season.champion}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">MVP</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">{season.mvp}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Record</p>
                <p className="mt-2 text-sm font-semibold text-stone-100">{season.record}</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-stone-400">{season.story}</p>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
