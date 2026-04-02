import type { Player, Team } from "@/lib/types";

type AssignCoachesToTeamsInput = {
  teams: Team[];
  coachIds: string[];
  players: Player[];
};

export function assignCoachesToTeams({ teams, coachIds, players }: AssignCoachesToTeamsInput) {
  const availableCoachIds = coachIds.filter(
    (coachId, index, currentCoachIds) =>
      currentCoachIds.indexOf(coachId) === index && players.some((player) => player.id === coachId),
  );

  return teams.map((team, index) => ({
    ...team,
    coachId: availableCoachIds[index],
  }));
}
