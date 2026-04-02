import { mockTeamAvatars } from "@/lib/data/mock-avatars";
import type { AvatarAssetRecord, PublishedSetup, Team, TournamentFlow } from "@/lib/types";

export type AvatarAssetsSnapshot = Record<string, AvatarAssetRecord>;

function getBuiltinAvatarSrc(avatarId?: string) {
  if (!avatarId) {
    return undefined;
  }

  return mockTeamAvatars.find((avatar) => avatar.id === avatarId)?.src;
}

export function resolveAvatarSrc(
  avatar: Pick<Team, "avatarId" | "avatarAssetId" | "avatarSrc">,
  avatarAssets: AvatarAssetsSnapshot,
) {
  if (avatar.avatarAssetId) {
    return avatarAssets[avatar.avatarAssetId]?.dataUrl ?? avatar.avatarSrc ?? getBuiltinAvatarSrc(avatar.avatarId);
  }

  return avatar.avatarSrc ?? getBuiltinAvatarSrc(avatar.avatarId);
}

export function resolveTeamAvatarAssets(teams: Team[], avatarAssets: AvatarAssetsSnapshot) {
  return teams.map((team) => ({
    ...team,
    avatarSrc: resolveAvatarSrc(team, avatarAssets),
  }));
}

export function resolveFlowAvatarAssets(flow: TournamentFlow, avatarAssets: AvatarAssetsSnapshot) {
  const resolvedTeams = resolveTeamAvatarAssets(flow.teams, avatarAssets);
  const teamsById = new Map(resolvedTeams.map((team) => [team.id, team]));

  return {
    ...flow,
    teams: resolvedTeams,
    phases: flow.phases.map((phase) => ({
      ...phase,
      standings: phase.standings?.map((entry) => ({
        ...entry,
        avatarSrc: teamsById.get(entry.teamId)?.avatarSrc ?? entry.avatarSrc,
      })),
      matches: phase.matches.map((match) => ({
        ...match,
        slots: match.slots.map((slot) => ({
          ...slot,
          avatarSrc: slot.teamId ? teamsById.get(slot.teamId)?.avatarSrc ?? slot.avatarSrc : slot.avatarSrc,
        })) as typeof match.slots,
      })),
    })),
  };
}

export function resolvePublishedSetupAvatarAssets(setup: PublishedSetup, avatarAssets: AvatarAssetsSnapshot) {
  const generatedTeams = setup.generatedTeams ? resolveTeamAvatarAssets(setup.generatedTeams, avatarAssets) : setup.generatedTeams;
  const flow = setup.flow
    ? resolveFlowAvatarAssets(
        {
          ...setup.flow,
          teams: setup.flow.teams.length ? setup.flow.teams : generatedTeams ?? setup.flow.teams,
        },
        avatarAssets,
      )
    : setup.flow;

  return {
    ...setup,
    generatedTeams,
    flow,
  };
}
