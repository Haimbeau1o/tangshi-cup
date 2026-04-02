import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatLibrary } from "@/lib/data/mock-site";

export const metadata = {
  title: "赛制库",
};

export default function FormatsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
      <SectionHeading
        eyebrow="Formats"
        title="2 队、3 队、4 队都该有自己的打法"
        description="网站不会把所有情况都强行塞成 BO3。它会根据队伍数、时间预算和你们当晚的认真程度，推荐更合理的编排。"
      />

      <div className="space-y-6">
        {formatLibrary.map((group) => (
          <GlowCard key={group.teamCount} className="space-y-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">{group.teamCount} Teams</p>
                <h2 className="font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{group.teamCount} 队模式库</h2>
              </div>
              <Pill>{group.presets.length} Presets</Pill>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {group.presets.map((preset) => (
                <div key={preset.id} className="rounded-[24px] border border-white/10 bg-black/25 p-5">
                  <h3 className="font-display text-3xl uppercase tracking-[0.08em] text-stone-50">{preset.name}</h3>
                  <p className="mt-3 text-sm leading-7 text-stone-400">{preset.summary}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Pill>{preset.matchCount} 场</Pill>
                    <Pill>公平 {preset.fairness}</Pill>
                    <Pill>乐子 {preset.fun}</Pill>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
