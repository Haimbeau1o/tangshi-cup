import type { Team, TournamentFlow, TournamentMatch, TournamentMatchSlot } from "@/lib/types";
import { resolveFixedBestOf } from "@/lib/tournament/resolve-fixed-best-of";
import { recomputeFlow } from "@/lib/tournament/recompute-flow";

type CreateMatchStateInput = {
  teamCount: 2 | 3 | 4;
  bestOf: TournamentMatch["bestOf"];
  teams: Team[];
};

function createTeamSlot(team: Team): TournamentMatchSlot {
  return {
    teamId: team.id,
    label: team.name,
    avatarSrc: team.avatarSrc,
  };
}

function createMatch(id: string, label: string, bestOf: TournamentMatch["bestOf"], kind: TournamentMatch["kind"], slots: [TournamentMatchSlot, TournamentMatchSlot], note?: string): TournamentMatch {
  return {
    id,
    label,
    bestOf,
    kind,
    status: "pending",
    slots,
    score: {
      left: 0,
      right: 0,
    },
    note,
  };
}

export function createMatchState({ teamCount, bestOf: _bestOf, teams }: CreateMatchStateInput): TournamentFlow {
  const resolvedBestOf = resolveFixedBestOf(teamCount);
  void _bestOf;

  if (teamCount === 2) {
    return recomputeFlow({
      layout: "series",
      teams,
      phases: [
        {
          id: "series",
          title: `${resolvedBestOf.toUpperCase()} 系列赛`,
          description: "直接录入系列赛比分，实时确认今晚冠军。",
          kind: "series",
          matches: [createMatch("series-final", `${resolvedBestOf.toUpperCase()} 对决`, resolvedBestOf, "series", [createTeamSlot(teams[0]), createTeamSlot(teams[1])])],
          advancement: ["胜者成为当晚冠军"],
        },
      ],
    });
  }

  if (teamCount === 3) {
    return recomputeFlow({
      layout: "tri-stage",
      teams,
      phases: [
        {
          id: "round-robin",
          title: "循环积分阶段",
          description: "三队先打循环赛，按胜场和图差决定总决赛席位。",
          kind: "round-robin",
          matches: [
            createMatch("rr-1", "循环赛 1", resolvedBestOf, "round-robin", [createTeamSlot(teams[0]), createTeamSlot(teams[1])]),
            createMatch("rr-2", "循环赛 2", resolvedBestOf, "round-robin", [createTeamSlot(teams[1]), createTeamSlot(teams[2])]),
            createMatch("rr-3", "循环赛 3", resolvedBestOf, "round-robin", [createTeamSlot(teams[0]), createTeamSlot(teams[2])]),
          ],
          advancement: ["积分前 2 名晋级总决赛"],
        },
        {
          id: "grand-final",
          title: "总决赛",
          description: "循环赛结束后，前二自动落位到总决赛。",
          kind: "final",
          matches: [
            createMatch(
              "final",
              `${resolvedBestOf.toUpperCase()} 总决赛`,
              resolvedBestOf,
              "final",
              [
                { label: "积分第 1 名", standingIndex: 1 },
                { label: "积分第 2 名", standingIndex: 2 },
              ],
            ),
          ],
          eliminated: ["积分第 3 名淘汰"],
        },
      ],
    });
  }

  return recomputeFlow({
    layout: "quad-bracket",
    teams,
    phases: [
      {
        id: "opening",
        title: "开幕半决赛",
        description: "四队先从开幕半决赛打起。",
        kind: "bracket",
        matches: [
          createMatch("upper-1", "上半区 A", resolvedBestOf, "bracket", [createTeamSlot(teams[0]), createTeamSlot(teams[3])]),
          createMatch("upper-2", "上半区 B", resolvedBestOf, "bracket", [createTeamSlot(teams[1]), createTeamSlot(teams[2])]),
        ],
      },
      {
        id: "crossroads",
        title: "交叉晋级阶段",
        description: "胜者争总决赛门票，败者抢生存资格。",
        kind: "bracket",
        matches: [
          createMatch(
            "winners-final",
            "胜者组决赛",
            resolvedBestOf,
            "bracket",
            [
              { label: "上半区 A 胜者", sourceMatchId: "upper-1", sourceOutcome: "winner" },
              { label: "上半区 B 胜者", sourceMatchId: "upper-2", sourceOutcome: "winner" },
            ],
          ),
          createMatch(
            "elimination-match",
            "败者组淘汰赛",
            resolvedBestOf,
            "bracket",
            [
              { label: "上半区 A 败者", sourceMatchId: "upper-1", sourceOutcome: "loser" },
              { label: "上半区 B 败者", sourceMatchId: "upper-2", sourceOutcome: "loser" },
            ],
          ),
        ],
      },
      {
        id: "lower-final",
        title: "败者组决赛",
        description: "决定谁还能去总决赛挑战胜者组冠军。",
        kind: "bracket",
        matches: [
          createMatch(
            "lower-final",
            "败者组决赛",
            resolvedBestOf,
            "bracket",
            [
              { label: "胜者组决赛败者", sourceMatchId: "winners-final", sourceOutcome: "loser" },
              { label: "淘汰赛胜者", sourceMatchId: "elimination-match", sourceOutcome: "winner" },
            ],
          ),
        ],
      },
      {
        id: "grand-final",
        title: "总决赛",
        description: "最终冠军在这里决出。",
        kind: "final",
        matches: [
          createMatch(
            "grand-final",
            "总决赛",
            resolvedBestOf,
            "final",
            [
              { label: "胜者组决赛胜者", sourceMatchId: "winners-final", sourceOutcome: "winner" },
              { label: "败者组决赛胜者", sourceMatchId: "lower-final", sourceOutcome: "winner" },
            ],
          ),
        ],
      },
    ],
  });
}
