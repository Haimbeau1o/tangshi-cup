import { assignTeamAvatars } from "@/lib/avatars/assign-team-avatars";
import type { AvatarAssetsSnapshot } from "@/lib/assets/resolve-avatar-assets";
import { resolveAvatarSrc } from "@/lib/assets/resolve-avatar-assets";
import { assignCoachesToTeams } from "@/lib/setup/assign-coaches-to-teams";
import { generateBalancedTeams } from "@/lib/balance/generate-balanced-teams";
import { ruleModifiers } from "@/lib/data/mock-site";
import type { Player, RuleModifier, SeasonSetupDraft, Team } from "@/lib/types";
import { recommendFormat } from "@/lib/formats/recommend-format";
import { buildTournamentFlow } from "@/lib/setup/build-tournament-flow";

export function getSelectedPlayers(draft: SeasonSetupDraft, players: Player[]) {
  return players.filter((player) => draft.selectedPlayerIds.includes(player.id));
}

export function getSelectedModifiers(draft: SeasonSetupDraft, modifiers: RuleModifier[] = ruleModifiers) {
  return modifiers.filter((modifier) => draft.ruleModifierIds.includes(modifier.id));
}

export function getRequiredPlayerCount(draft: SeasonSetupDraft) {
  return draft.event.teamCount * draft.event.teamSize;
}

export function canGeneratePreview(draft: SeasonSetupDraft) {
  return (
    draft.selectedPlayerIds.length === getRequiredPlayerCount(draft) &&
    draft.captainIds.length === draft.event.teamCount
  );
}

function applyTeamCustomizations(
  draft: SeasonSetupDraft,
  teams: Team[],
  avatarAssets: AvatarAssetsSnapshot = {},
) {
  return teams.map((team) => {
    const customization = draft.teamCustomizations[team.id];

    if (!customization) {
      return team;
    }

    const avatarAssetId = customization.avatarAssetId ?? team.avatarAssetId;
    const avatarSrc = avatarAssetId
      ? resolveAvatarSrc(
          {
            avatarId: customization.avatarId ?? team.avatarId,
            avatarAssetId,
            avatarSrc: customization.avatarSrc ?? team.avatarSrc,
          },
          avatarAssets,
        )
      : customization.avatarSrc ?? team.avatarSrc;

    return {
      ...team,
      name: customization.name?.trim() || team.name,
      slogan: customization.slogan?.trim() || team.slogan,
      avatarId: customization.avatarId ?? team.avatarId,
      avatarAssetId,
      avatarSrc,
      accentColor: customization.accentColor ?? team.accentColor,
    };
  });
}

export function buildDraftPreview(
  draft: SeasonSetupDraft,
  players: Player[],
  modifiers: RuleModifier[] = ruleModifiers,
  avatarAssets: AvatarAssetsSnapshot = {},
) {
  const selectedPlayers = getSelectedPlayers(draft, players);
  const selectedModifiers = getSelectedModifiers(draft, modifiers);
  const recommendation = recommendFormat({
    teamCount: draft.event.teamCount,
    timeBudgetMinutes: draft.event.timeBudgetMinutes,
    tone: draft.event.tone,
  });

  if (!canGeneratePreview(draft)) {
    return {
      recommendation,
      selectedPlayers,
      selectedModifiers,
      teams: null,
      flow: null,
    };
  }

  const balance = generateBalancedTeams({
    players: selectedPlayers,
    teamCount: draft.event.teamCount,
    teamSize: draft.event.teamSize,
    captainIds: draft.captainIds,
  });
  const teams = assignCoachesToTeams({
    teams: balance.teams,
    coachIds: draft.coachIds,
    players,
  });
  const decoratedTeams = assignTeamAvatars({
    teams,
    seed: `${draft.season.slug}:${draft.event.slug}`,
  });
  const customizedTeams = applyTeamCustomizations(draft, decoratedTeams, avatarAssets);
  const flow = buildTournamentFlow({
    teamCount: draft.event.teamCount,
    bestOf: draft.event.bestOf,
    formatId: draft.event.formatId,
    teams: customizedTeams,
  });

  return {
    recommendation,
    selectedPlayers,
    selectedModifiers,
    teams: {
      ...balance,
      teams: customizedTeams,
    },
    flow,
  };
}
