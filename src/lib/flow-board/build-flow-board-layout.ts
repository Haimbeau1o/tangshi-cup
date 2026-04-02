import type { TournamentFlow, TournamentMatch, TournamentStandingsEntry } from "@/lib/types";

export type FlowBoardNodeKind = "match" | "standings";
export type FlowBoardEdgeKind = "winner" | "loser" | "ranking";

export type FlowBoardLane = {
  phaseId: string;
  title: string;
  description: string;
  noteLines: string[];
  x: number;
  width: number;
};

export type FlowBoardNode = {
  id: string;
  kind: FlowBoardNodeKind;
  phaseId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  matchId?: string;
  match?: TournamentMatch;
  standings?: TournamentStandingsEntry[];
};

export type FlowBoardEdge = {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  kind: FlowBoardEdgeKind;
};

export type FlowBoardLayout = {
  width: number;
  height: number;
  lanes: FlowBoardLane[];
  nodes: FlowBoardNode[];
  edges: FlowBoardEdge[];
};

const PADDING_X = 64;
const PADDING_Y = 56;
const LANE_WIDTH = 460;
const LANE_GAP = 160;
const HEADER_HEIGHT = 164;
const HEADER_GAP = 48;
const MATCH_NODE_WIDTH = 312;
const MATCH_NODE_HEIGHT = 288;
const STANDINGS_NODE_HEIGHT = 372;
const NODE_GAP = 48;
const BOARD_FOOTER = 72;

function createMatchNode(phaseId: string, match: TournamentMatch, x: number, y: number): FlowBoardNode {
  return {
    id: `match-${match.id}`,
    kind: "match",
    phaseId,
    matchId: match.id,
    match,
    x,
    y,
    width: MATCH_NODE_WIDTH,
    height: MATCH_NODE_HEIGHT,
  };
}

function createStandingsNode(phaseId: string, standings: TournamentStandingsEntry[], x: number, y: number): FlowBoardNode {
  return {
    id: `standings-${phaseId}`,
    kind: "standings",
    phaseId,
    standings,
    x,
    y,
    width: MATCH_NODE_WIDTH,
    height: STANDINGS_NODE_HEIGHT,
  };
}

export function buildFlowBoardLayout(flow: TournamentFlow): FlowBoardLayout {
  const lanes: FlowBoardLane[] = [];
  const nodes: FlowBoardNode[] = [];
  const edgeMap = new Map<string, FlowBoardEdge>();
  let maxNodeBottom = 0;

  flow.phases.forEach((phase, phaseIndex) => {
    const laneX = PADDING_X + phaseIndex * (LANE_WIDTH + LANE_GAP);
    const nodeX = laneX + (LANE_WIDTH - MATCH_NODE_WIDTH) / 2;
    let currentY = PADDING_Y + HEADER_HEIGHT + HEADER_GAP;

    lanes.push({
      phaseId: phase.id,
      title: phase.title,
      description: phase.description,
      noteLines: [...(phase.advancement ?? []), ...(phase.eliminated ?? [])],
      x: laneX,
      width: LANE_WIDTH,
    });

    if (phase.standings?.length) {
      const standingsNode = createStandingsNode(phase.id, phase.standings, nodeX, currentY);
      nodes.push(standingsNode);
      currentY += STANDINGS_NODE_HEIGHT + NODE_GAP;
      maxNodeBottom = Math.max(maxNodeBottom, standingsNode.y + standingsNode.height);
    }

    phase.matches.forEach((match) => {
      const node = createMatchNode(phase.id, match, nodeX, currentY);
      nodes.push(node);
      currentY += MATCH_NODE_HEIGHT + NODE_GAP;
      maxNodeBottom = Math.max(maxNodeBottom, node.y + node.height);
    });
  });

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  nodes.forEach((node) => {
    if (!node.match) {
      return;
    }

    node.match.slots.forEach((slot) => {
      if (slot.sourceMatchId && slot.sourceOutcome) {
        const sourceNodeId = `match-${slot.sourceMatchId}`;
        const edgeId = `${sourceNodeId}:${node.id}:${slot.sourceOutcome}`;

        if (!edgeMap.has(edgeId) && nodeById.has(sourceNodeId)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            fromNodeId: sourceNodeId,
            toNodeId: node.id,
            kind: slot.sourceOutcome,
          });
        }

        return;
      }

      if (slot.standingIndex) {
        const standingsNode = nodes.find((item) => item.kind === "standings");

        if (!standingsNode) {
          return;
        }

        const edgeId = `${standingsNode.id}:${node.id}:ranking`;

        if (!edgeMap.has(edgeId)) {
          edgeMap.set(edgeId, {
            id: edgeId,
            fromNodeId: standingsNode.id,
            toNodeId: node.id,
            kind: "ranking",
          });
        }
      }
    });
  });

  return {
    width: PADDING_X * 2 + flow.phases.length * LANE_WIDTH + Math.max(0, flow.phases.length - 1) * LANE_GAP,
    height: maxNodeBottom + BOARD_FOOTER,
    lanes,
    nodes,
    edges: [...edgeMap.values()],
  };
}
