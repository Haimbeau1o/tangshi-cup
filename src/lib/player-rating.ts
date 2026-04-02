import type { Player, RankTier } from "@/lib/types";

export const rankScoreMap: Record<RankTier, number> = {
  黑铁: 1,
  青铜: 2,
  白银: 3,
  黄金: 4,
  铂金: 5,
  钻石: 6,
  超凡: 7,
  深化: 8,
  赋能: 9,
};

export const rankOrder = Object.keys(rankScoreMap) as RankTier[];

export function calculatePlayerPower(player: Pick<Player, "highestRank">) {
  return rankScoreMap[player.highestRank];
}
