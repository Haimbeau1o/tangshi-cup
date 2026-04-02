import type { Team, TournamentMatch, TournamentStandingsEntry } from "@/lib/types";

type ComputeStandingsInput = {
  teams: Team[];
  matches: TournamentMatch[];
  advancingCount: number;
};

export function computeStandings({ teams, matches, advancingCount }: ComputeStandingsInput): TournamentStandingsEntry[] {
  const standingsMap = new Map<string, TournamentStandingsEntry>();

  teams.forEach((team, index) => {
    standingsMap.set(team.id, {
      teamId: team.id,
      name: team.name,
      avatarSrc: team.avatarSrc,
      wins: 0,
      losses: 0,
      mapWins: 0,
      mapLosses: 0,
      mapDiff: 0,
      points: 0,
      rank: index + 1,
      advanced: false,
      eliminated: false,
    });
  });

  matches.forEach((match) => {
    if (!match.result) {
      return;
    }

    const [leftSlot, rightSlot] = match.slots;

    if (!leftSlot.teamId || !rightSlot.teamId) {
      return;
    }

    const leftEntry = standingsMap.get(leftSlot.teamId);
    const rightEntry = standingsMap.get(rightSlot.teamId);

    if (!leftEntry || !rightEntry) {
      return;
    }

    leftEntry.mapWins += match.result.score.left;
    leftEntry.mapLosses += match.result.score.right;
    rightEntry.mapWins += match.result.score.right;
    rightEntry.mapLosses += match.result.score.left;

    if (match.result.winnerTeamId === leftSlot.teamId) {
      leftEntry.wins += 1;
      leftEntry.points += 3;
      rightEntry.losses += 1;
    } else {
      rightEntry.wins += 1;
      rightEntry.points += 3;
      leftEntry.losses += 1;
    }
  });

  const sorted = [...standingsMap.values()]
    .map((entry) => ({
      ...entry,
      mapDiff: entry.mapWins - entry.mapLosses,
    }))
    .sort((left, right) => {
      if (right.wins !== left.wins) {
        return right.wins - left.wins;
      }

      if (right.mapDiff !== left.mapDiff) {
        return right.mapDiff - left.mapDiff;
      }

      if (right.mapWins !== left.mapWins) {
        return right.mapWins - left.mapWins;
      }

      const leftSeed = teams.find((team) => team.id === left.teamId)?.seed ?? Number.MAX_SAFE_INTEGER;
      const rightSeed = teams.find((team) => team.id === right.teamId)?.seed ?? Number.MAX_SAFE_INTEGER;

      return leftSeed - rightSeed;
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      advanced: index < advancingCount,
      eliminated: index >= advancingCount,
    }));

  return sorted;
}
