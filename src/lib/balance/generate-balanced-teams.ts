import { calculatePlayerPower } from "@/lib/player-rating";
import type { Player, Team, TeamBalanceResult } from "@/lib/types";
import { round } from "@/lib/utils";

type GenerateBalancedTeamsInput = {
  players: Player[];
  teamCount: 2 | 3 | 4;
  teamSize: number;
  captainIds?: string[];
};

const TEAM_NAMES = ["Crimson Echo", "Cyan Protocol", "Amber Reboot", "Ghost Stack"];

function sumTeamPower(players: Player[]) {
  return players.reduce((sum, player) => sum + calculatePlayerPower(player), 0);
}

function getSnakeOrder(teamCount: number, pickCount: number) {
  const order: number[] = [];
  let forward = true;

  while (order.length < pickCount) {
    const frame = Array.from({ length: teamCount }, (_, index) => index);
    order.push(...(forward ? frame : frame.reverse()));
    forward = !forward;
  }

  return order;
}

function optimizeTeamAssignments(rawTeams: Player[][], lockedCaptainIds: Set<string>) {
  const nextTeams = rawTeams.map((team) => [...team]);

  function getObjective(teams: Player[][]) {
    const totals = teams.map((team) => sumTeamPower(team));
    const averageTotal = totals.reduce((sum, total) => sum + total, 0) / totals.length;
    const powerSpread = Math.max(...totals) - Math.min(...totals);
    const variance = totals.reduce((sum, total) => sum + (total - averageTotal) ** 2, 0);

    return {
      totals,
      powerSpread,
      variance,
    };
  }

  let bestObjective = getObjective(nextTeams);
  let improved = true;

  while (improved) {
    improved = false;

    for (let leftTeamIndex = 0; leftTeamIndex < nextTeams.length; leftTeamIndex += 1) {
      for (let rightTeamIndex = leftTeamIndex + 1; rightTeamIndex < nextTeams.length; rightTeamIndex += 1) {
        const leftTeam = nextTeams[leftTeamIndex];
        const rightTeam = nextTeams[rightTeamIndex];

        for (let leftPlayerIndex = 0; leftPlayerIndex < leftTeam.length; leftPlayerIndex += 1) {
          const leftPlayer = leftTeam[leftPlayerIndex];

          if (lockedCaptainIds.has(leftPlayer.id)) {
            continue;
          }

          for (let rightPlayerIndex = 0; rightPlayerIndex < rightTeam.length; rightPlayerIndex += 1) {
            const rightPlayer = rightTeam[rightPlayerIndex];

            if (lockedCaptainIds.has(rightPlayer.id)) {
              continue;
            }

            const candidateTeams = nextTeams.map((team) => [...team]);
            candidateTeams[leftTeamIndex][leftPlayerIndex] = rightPlayer;
            candidateTeams[rightTeamIndex][rightPlayerIndex] = leftPlayer;

            const candidateObjective = getObjective(candidateTeams);
            const improvesSpread = candidateObjective.powerSpread < bestObjective.powerSpread;
            const improvesVariance =
              candidateObjective.powerSpread === bestObjective.powerSpread &&
              candidateObjective.variance < bestObjective.variance;

            if (!improvesSpread && !improvesVariance) {
              continue;
            }

            nextTeams[leftTeamIndex] = candidateTeams[leftTeamIndex];
            nextTeams[rightTeamIndex] = candidateTeams[rightTeamIndex];
            bestObjective = candidateObjective;
            improved = true;
          }
        }
      }
    }
  }

  return nextTeams;
}

function summarizeTeam(id: string, name: string, players: Player[], captainId?: string): Team {
  const totalPower = round(sumTeamPower(players), 1);
  const coveredRoles = Array.from(new Set(players.map((player) => player.mainRole)));

  return {
    id,
    name,
    players,
    totalPower,
    averagePower: round(totalPower / players.length, 1),
    coveredRoles,
    captainId,
  };
}

export function generateBalancedTeams({
  players,
  teamCount,
  teamSize,
  captainIds = [],
}: GenerateBalancedTeamsInput): TeamBalanceResult {
  const requiredPlayers = teamCount * teamSize;

  if (players.length < requiredPlayers) {
    throw new Error(`Need at least ${requiredPlayers} players to build ${teamCount} teams of ${teamSize}.`);
  }

  if (captainIds.length > teamCount) {
    throw new Error(`Cannot lock more than ${teamCount} captains for ${teamCount} teams.`);
  }

  const selectedPlayers = [...players].slice(0, requiredPlayers);
  const lockedCaptains = selectedPlayers.filter((player) => captainIds.includes(player.id));
  const lockedCaptainIds = new Set(lockedCaptains.map((player) => player.id));

  const sortedPlayers = selectedPlayers
    .filter((player) => !captainIds.includes(player.id))
    .slice(0, requiredPlayers)
    .sort((left, right) => calculatePlayerPower(right) - calculatePlayerPower(left));

  const rawTeams = Array.from({ length: teamCount }, () => [] as Player[]);
  const teamCaptainIds = Array.from({ length: teamCount }, () => undefined as string | undefined);

  lockedCaptains.slice(0, teamCount).forEach((captain, index) => {
    rawTeams[index].push(captain);
    teamCaptainIds[index] = captain.id;
  });

  const order = getSnakeOrder(teamCount, sortedPlayers.length);

  sortedPlayers.forEach((player, index) => {
    let preferredSlot = order[index];

    if (rawTeams[preferredSlot].length >= teamSize) {
      preferredSlot = rawTeams.findIndex((team) => team.length < teamSize);
    }

    rawTeams[preferredSlot].push(player);
  });

  const optimizedTeams = optimizeTeamAssignments(rawTeams, lockedCaptainIds);
  const teams = optimizedTeams.map((teamPlayers, index) =>
    summarizeTeam(`team-${index + 1}`, TEAM_NAMES[index], teamPlayers, teamCaptainIds[index]),
  );
  const teamsBySeed = [...teams]
    .sort((left, right) => right.totalPower - left.totalPower || left.name.localeCompare(right.name))
    .map((team, index) => ({
      ...team,
      seed: index + 1,
    }));
  const seededTeamMap = new Map(teamsBySeed.map((team) => [team.id, team.seed]));
  const finalizedTeams = teams.map((team) => ({
    ...team,
    seed: seededTeamMap.get(team.id),
  }));

  const totals = finalizedTeams.map((team) => team.totalPower);
  const maxPower = Math.max(...totals);
  const minPower = Math.min(...totals);
  const averagePower = totals.reduce((sum, total) => sum + total, 0) / totals.length;
  const balanceGapPercent = round(((maxPower - minPower) / averagePower) * 100, 1);
  const powerSpread = round(maxPower - minPower, 1);

  const qualityBand =
    teamCount === 2
      ? balanceGapPercent <= 4
        ? "green"
        : balanceGapPercent <= 8
          ? "yellow"
          : "red"
      : powerSpread <= 2
        ? "green"
        : powerSpread <= 5
          ? "yellow"
          : "red";

  return {
    teams: finalizedTeams,
    balanceGapPercent,
    powerSpread,
    qualityBand,
  };
}
