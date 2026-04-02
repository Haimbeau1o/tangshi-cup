import { notFound } from "next/navigation";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { events, getSeasonBySlug, getStoriesForSeason, seasons } from "@/lib/data/mock-site";

type SeasonPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return seasons.map((season) => ({
    slug: season.slug,
  }));
}

export async function generateMetadata({ params }: SeasonPageProps) {
  const { slug } = await params;
  const season = getSeasonBySlug(slug);

  return {
    title: season ? `${season.label} ${season.name}` : "赛季",
  };
}

export default async function SeasonDetailPage({ params }: SeasonPageProps) {
  const { slug } = await params;
  const season = getSeasonBySlug(slug);

  if (!season) {
    notFound();
  }

  const seasonEvents = events.filter((event) => event.seasonSlug === slug);
  const stories = getStoriesForSeason(slug);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
      <GlowCard className="space-y-5">
        <Pill>{season.label}</Pill>
        <h1 className="font-display text-6xl uppercase tracking-[0.08em] text-stone-50">{season.name}</h1>
        <p className="max-w-3xl text-base leading-8 text-stone-300/82">{season.theme}</p>
      </GlowCard>

      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <GlowCard className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Season Events</p>
          {seasonEvents.map((event) => (
            <div key={event.slug} className="rounded-[24px] border border-white/10 bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-stone-50">{event.title}</h2>
                  <p className="mt-2 text-sm text-stone-400">{event.headline}</p>
                </div>
                <Pill>{event.teamCount} 队</Pill>
              </div>
            </div>
          ))}
        </GlowCard>

        <GlowCard className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Timeline</p>
          {stories.map((story) => (
            <div key={story.id} className="relative border-l border-white/12 pl-5">
              <span className="absolute -left-[7px] top-1 size-3 rounded-full bg-[#ff5e3a] shadow-[0_0_0_6px_rgba(255,94,58,0.14)]" />
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{story.dateLabel}</p>
              <h3 className="mt-2 text-lg font-semibold text-stone-50">{story.title}</h3>
              <p className="mt-2 text-sm leading-7 text-stone-400">{story.summary}</p>
            </div>
          ))}
        </GlowCard>
      </div>
    </div>
  );
}
