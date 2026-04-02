import type { FlowBoardEdge, FlowBoardNode } from "@/lib/flow-board/build-flow-board-layout";

type FlowBoardEdgeLayerProps = {
  width: number;
  height: number;
  edges: FlowBoardEdge[];
  nodes: FlowBoardNode[];
};

function getNodeAnchor(node: FlowBoardNode, side: "left" | "right") {
  return {
    x: side === "left" ? node.x : node.x + node.width,
    y: node.y + node.height / 2,
  };
}

function getStrokeClass(kind: FlowBoardEdge["kind"]) {
  if (kind === "winner") {
    return "stroke-emerald-300/70";
  }

  if (kind === "loser") {
    return "stroke-[#ff8c66]/70";
  }

  return "stroke-cyan-300/65";
}

export function FlowBoardEdgeLayer({ width, height, edges, nodes }: FlowBoardEdgeLayerProps) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <svg width={width} height={height} className="absolute left-0 top-0 pointer-events-none overflow-visible">
      <defs>
        <filter id="flow-edge-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {edges.map((edge) => {
        const fromNode = nodeById.get(edge.fromNodeId);
        const toNode = nodeById.get(edge.toNodeId);

        if (!fromNode || !toNode) {
          return null;
        }

        const start = getNodeAnchor(fromNode, "right");
        const end = getNodeAnchor(toNode, "left");
        const controlOffset = Math.max(72, (end.x - start.x) / 2);
        const path = `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;

        return (
          <path
            key={edge.id}
            d={path}
            fill="none"
            strokeWidth={edge.kind === "ranking" ? 2.5 : 3}
            strokeDasharray={edge.kind === "ranking" ? "8 10" : undefined}
            className={getStrokeClass(edge.kind)}
            filter="url(#flow-edge-glow)"
          />
        );
      })}
    </svg>
  );
}
