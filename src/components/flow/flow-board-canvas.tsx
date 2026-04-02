"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { MatchControlCard } from "@/components/flow/match-control-card";
import { FlowBoardEdgeLayer } from "@/components/flow/flow-board-edge-layer";
import { StandingsPanel } from "@/components/flow/standings-panel";
import { buildFlowBoardLayout } from "@/lib/flow-board/build-flow-board-layout";
import type { TournamentFlow, TournamentMatchScore } from "@/lib/types";

type FlowBoardCanvasProps = {
  flow: TournamentFlow;
  editable?: boolean;
  onScoreSelect?: (matchId: string, score: TournamentMatchScore) => void;
  onClearMatch?: (matchId: string) => void;
};

type ViewState = {
  x: number;
  y: number;
  scale: number;
};

function clampScale(value: number) {
  return Math.min(1.4, Math.max(0.52, value));
}

export function FlowBoardCanvas({
  flow,
  editable = false,
  onScoreSelect,
  onClearMatch,
}: FlowBoardCanvasProps) {
  const layout = useMemo(() => buildFlowBoardLayout(flow), [flow]);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [view, setView] = useState<ViewState>({
    x: 28,
    y: 28,
    scale: 0.82,
  });

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const nextScale = clampScale((viewport.clientWidth - 80) / layout.width);

    setView({
      x: Math.max(24, (viewport.clientWidth - layout.width * nextScale) / 2),
      y: 28,
      scale: nextScale,
    });
  }, [layout.width, layout.height]);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;

    if (target.closest("[data-flow-node='true']") || target.closest("[data-flow-control='true']")) {
      return;
    }

    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: view.x,
      originY: view.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    setView((current) => ({
      ...current,
      x: dragState.originX + event.clientX - dragState.startX,
      y: dragState.originY + event.clientY - dragState.startY,
    }));
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const dragState = dragStateRef.current;

    if (!dragState || dragState.pointerId !== event.pointerId) {
      return;
    }

    dragStateRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();

    const viewport = viewportRef.current;

    if (!viewport) {
      return;
    }

    const rect = viewport.getBoundingClientRect();
    const pointerX = event.clientX - rect.left;
    const pointerY = event.clientY - rect.top;

    setView((current) => {
      const nextScale = clampScale(current.scale + (event.deltaY < 0 ? 0.08 : -0.08));

      if (nextScale === current.scale) {
        return current;
      }

      const boardX = (pointerX - current.x) / current.scale;
      const boardY = (pointerY - current.y) / current.scale;

      return {
        scale: nextScale,
        x: pointerX - boardX * nextScale,
        y: pointerY - boardY * nextScale,
      };
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="rounded-full border border-white/10 bg-black/25 px-4 py-2 text-xs uppercase tracking-[0.24em] text-stone-300">
          滚轮缩放，拖动画布
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            data-flow-control="true"
            onClick={() => setView((current) => ({ ...current, scale: clampScale(current.scale - 0.1) }))}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-stone-100 transition hover:bg-white/10"
          >
            缩小
          </button>
          <button
            type="button"
            data-flow-control="true"
            onClick={() => setView((current) => ({ ...current, scale: clampScale(current.scale + 0.1) }))}
            className="rounded-full border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-stone-100 transition hover:bg-white/10"
          >
            放大
          </button>
          <button
            type="button"
            data-flow-control="true"
            onClick={() => {
              const viewport = viewportRef.current;

              if (!viewport) {
                return;
              }

              const nextScale = clampScale((viewport.clientWidth - 80) / layout.width);
              setView({
                x: Math.max(24, (viewport.clientWidth - layout.width * nextScale) / 2),
                y: 28,
                scale: nextScale,
              });
            }}
            className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-400/16"
          >
            重置视角
          </button>
        </div>
      </div>

      <div
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        className="relative h-[72vh] min-h-[760px] overflow-hidden rounded-[34px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(77,227,255,0.12),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] touch-none"
      >
        <div className="absolute inset-0 bg-[linear-gradient(transparent_31px,rgba(255,255,255,0.03)_32px),linear-gradient(90deg,transparent_31px,rgba(255,255,255,0.03)_32px)] bg-[size:32px_32px] opacity-45" />

        <div
          className="absolute left-0 top-0 will-change-transform"
          style={{
            width: layout.width,
            height: layout.height,
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
            transformOrigin: "0 0",
          }}
        >
          {layout.lanes.map((lane) => (
            <div
              key={lane.phaseId}
              className="absolute top-0 rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] px-5 py-5 shadow-[0_24px_80px_rgba(0,0,0,0.2)]"
              style={{
                left: lane.x,
                width: lane.width,
                minHeight: layout.height - 32,
              }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-300/80">Stage</p>
              <h3 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">{lane.title}</h3>
              <p className="mt-3 text-sm leading-7 text-stone-400">{lane.description}</p>
              {lane.noteLines.length ? (
                <div className="mt-4 space-y-2">
                  {lane.noteLines.map((item) => (
                    <div
                      key={`${lane.phaseId}-${item}`}
                      className="rounded-2xl border border-white/8 bg-black/18 px-3 py-3 text-sm text-stone-300"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          <FlowBoardEdgeLayer width={layout.width} height={layout.height} edges={layout.edges} nodes={layout.nodes} />

          {layout.nodes.map((node) => (
            <div
              key={node.id}
              data-flow-node="true"
              className="absolute"
              style={{
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
              }}
            >
              {node.kind === "standings" ? (
                <StandingsPanel standings={node.standings ?? []} title="循环赛积分" className="h-full" />
              ) : node.match ? (
                <MatchControlCard
                  match={node.match}
                  editable={editable}
                  onScoreSelect={onScoreSelect}
                  onClearMatch={onClearMatch}
                  className="h-full w-full"
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
