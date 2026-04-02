import type { ChronicleEntry, Player, PublishedSetup } from "@/lib/types";

type BuildChronicleEntryInput = {
  setup: PublishedSetup;
  players: Player[];
};

export function buildChronicleEntry({ setup, players }: BuildChronicleEntryInput): ChronicleEntry {
  const champion = setup.generatedTeams?.find((team) => team.id === setup.flow?.championTeamId) ?? null;
  const mvp = players.find((player) => player.id === setup.awards?.mvpPlayerId) ?? null;
  const svp = players.find((player) => player.id === setup.awards?.svpPlayerId) ?? null;
  const awardSummary = [
    mvp ? `MVP：${mvp.nickname}` : null,
    svp ? `SVP：${svp.nickname}` : null,
  ]
    .filter(Boolean)
    .join("，");

  return {
    id: `chronicle:${setup.event.slug}`,
    eventSlug: setup.event.slug,
    eventTitle: setup.event.title,
    seasonSlug: setup.season.slug,
    title: `${setup.event.title} 冠军归档`,
    dateLabel: `${setup.season.label} / 冠军归档`,
    summary: awardSummary.length
      ? `${champion?.name ?? "冠军待定"} 完成夺冠归档，${awardSummary}。`
      : `${champion?.name ?? "冠军待定"} 完成夺冠归档。`,
    tag: "Champion",
    championTeamId: champion?.id,
    championName: champion?.name,
    mvpPlayerId: mvp?.id,
    mvpName: mvp?.nickname,
    svpPlayerId: svp?.id,
    svpName: svp?.nickname,
    votingNote: setup.awards?.votingNote,
    updatedAt: new Date().toISOString(),
  };
}
