import { mockPlayers } from "@/lib/data/mock-players";
import { ruleModifiers } from "@/lib/data/mock-site";
import type { Player, RuleModifier } from "@/lib/types";

function clonePlayer(player: Player): Player {
  return {
    ...player,
    preferredAgents: [...player.preferredAgents],
  };
}

function cloneRuleModifier(modifier: RuleModifier): RuleModifier {
  return {
    ...modifier,
  };
}

export function getDefaultPlayers() {
  return mockPlayers.map(clonePlayer);
}

export function getDefaultRuleModifiers() {
  return ruleModifiers.map(cloneRuleModifier);
}
