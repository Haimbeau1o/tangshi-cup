"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import { RankChip } from "@/components/ui/rank-chip";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  deletePlayer,
  getPlayersSnapshot,
  importPlayers,
  subscribeContentStorage,
  upsertPlayer,
} from "@/lib/content/storage";
import { rankOrder } from "@/lib/player-rating";
import type { Player, PlayerRole } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";

const roleOptions: PlayerRole[] = ["duelist", "initiator", "controller", "sentinel", "flex"];

function toSafeSlug(value: string, fallback = "player") {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return slug || fallback;
}

function createBlankPlayer(): Player {
  return {
    id: "",
    slug: "",
    nickname: "",
    riotId: "",
    mainRole: "flex",
    preferredAgents: ["Skye"],
    highestRank: "黄金",
    bio: "",
    canCoach: false,
    isCaptain: false,
    avatarSrc: "",
  };
}

function normalizePlayer(player: Player): Player {
  const base = player.id || `${toSafeSlug(player.nickname || player.riotId || "player")}-${Date.now()}`;

  return {
    ...player,
    id: base,
    slug: player.slug || toSafeSlug(player.nickname || base, base),
    preferredAgents: player.preferredAgents.filter(Boolean),
  };
}

export function PlayerLibraryManager() {
  const isHydrated = useHydrated();
  const players = useSyncExternalStore(subscribeContentStorage, getPlayersSnapshot, getPlayersSnapshot);
  const sortedPlayers = useMemo(
    () => [...players].sort((left, right) => rankOrder.indexOf(right.highestRank) - rankOrder.indexOf(left.highestRank)),
    [players],
  );
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [editor, setEditor] = useState<Player>(createBlankPlayer);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const selectedPlayer = sortedPlayers.find((player) => player.id === selectedPlayerId) ?? null;

  function patchEditor<K extends keyof Player>(key: K, value: Player[K]) {
    setEditor((current) => ({
      ...current,
      [key]: value,
      slug: key === "nickname" ? toSafeSlug(String(value), current.slug || "player") : current.slug,
    }));
  }

  function handleSave() {
    const normalized = normalizePlayer(editor);
    upsertPlayer(normalized);
    setSelectedPlayerId(normalized.id);
  }

  function handleDelete() {
    if (!selectedPlayer) {
      return;
    }

    deletePlayer(selectedPlayer.id);
    setSelectedPlayerId(null);
    setEditor(createBlankPlayer());
  }

  async function handleImportFile(file?: File | null) {
    if (!file) {
      return;
    }

    const text = await file.text();
    setImportText(text);
  }

  function handleImportPlayers() {
    try {
      const parsed = JSON.parse(importText) as Player[];
      importPlayers(parsed.map((player) => normalizePlayer({
        ...createBlankPlayer(),
        ...player,
        preferredAgents: Array.isArray(player.preferredAgents) ? player.preferredAgents : [],
      })));
      setImportError(null);
      setSelectedPlayerId(null);
    } catch {
      setImportError("导入失败：请提供合法的 JSON 数组。");
    }
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
        <GlowCard className="text-sm text-stone-400">正在读取本地选手库...</GlowCard>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-6 py-16 lg:px-10">
      <SectionHeading
        eyebrow="Players"
        title="选手数据库"
        description="这里现在是可编辑的本地选手库。你可以新增、修改、删除，也可以直接导入一份 JSON 作为新赛季的选手基础盘。"
      />

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <GlowCard className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Player Pool</p>
              <h2 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">当前选手库</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedPlayerId("__new__");
                setEditor(createBlankPlayer());
              }}
              className="rounded-full bg-[#ff5e3a] px-4 py-2 text-sm font-semibold text-white"
            >
              新增选手
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {sortedPlayers.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => {
                  setSelectedPlayerId(player.id);
                  setEditor(player);
                }}
                className={`rounded-[24px] border p-4 text-left transition ${
                  selectedPlayerId === player.id ? "border-cyan-300/40 bg-cyan-400/10" : "border-white/10 bg-black/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-stone-50">{player.nickname}</p>
                    <p className="text-sm text-stone-400">{player.riotId}</p>
                  </div>
                  <RankChip rank={player.highestRank} className="text-[10px]" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Pill className="text-[10px]">{player.mainRole}</Pill>
                  {player.canCoach ? <Pill className="text-[10px] text-cyan-200">教练</Pill> : null}
                  {player.isCaptain ? <Pill className="text-[10px] text-amber-100">队长</Pill> : null}
                </div>
              </button>
            ))}
          </div>
        </GlowCard>

        <div className="space-y-5">
          <GlowCard className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Editor</p>
                <h2 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">
                  {selectedPlayerId === "__new__" ? "新增选手" : selectedPlayer ? "编辑选手" : "请选择一位选手"}
                </h2>
              </div>
              {selectedPlayer ? (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-full border border-rose-400/25 bg-rose-400/10 px-4 py-2 text-sm font-semibold text-rose-100"
                >
                  删除
                </button>
              ) : null}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-300">昵称</span>
                <input
                  value={editor.nickname}
                  onChange={(event) => patchEditor("nickname", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-300">Riot ID</span>
                <input
                  value={editor.riotId}
                  onChange={(event) => patchEditor("riotId", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-300">主定位</span>
                <select
                  value={editor.mainRole}
                  onChange={(event) => patchEditor("mainRole", event.target.value as PlayerRole)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                >
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-300">最高段位</span>
                <select
                  value={editor.highestRank}
                  onChange={(event) => patchEditor("highestRank", event.target.value as Player["highestRank"])}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                >
                  {rankOrder.map((rank) => (
                    <option key={rank} value={rank}>
                      {rank}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-medium text-stone-300">头像 URL</span>
                <input
                  value={editor.avatarSrc ?? ""}
                  onChange={(event) => patchEditor("avatarSrc", event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
                />
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-300">英雄池（逗号分隔）</span>
              <input
                value={editor.preferredAgents.join(", ")}
                onChange={(event) =>
                  patchEditor(
                    "preferredAgents",
                    event.target.value
                      .split(",")
                      .map((agent) => agent.trim())
                      .filter(Boolean),
                  )
                }
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-300">简介</span>
              <textarea
                value={editor.bio ?? ""}
                onChange={(event) => patchEditor("bio", event.target.value)}
                className="min-h-28 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-stone-200">
                <input
                  type="checkbox"
                  checked={Boolean(editor.canCoach)}
                  onChange={(event) => patchEditor("canCoach", event.target.checked)}
                />
                可做教练
              </label>
              <label className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-sm text-stone-200">
                <input
                  type="checkbox"
                  checked={Boolean(editor.isCaptain)}
                  onChange={(event) => patchEditor("isCaptain", event.target.checked)}
                />
                可做队长
              </label>
            </div>

            <button
              type="button"
              onClick={handleSave}
              className="rounded-full bg-cyan-400/20 px-5 py-3 text-sm font-semibold text-cyan-200"
            >
              保存选手信息
            </button>
          </GlowCard>

          <GlowCard className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Import</p>
              <h2 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">导入选手库</h2>
            </div>
            <p className="text-sm leading-7 text-stone-400">
              支持粘贴或上传 JSON 数组，导入时会替换当前本地选手库。字段遵循当前页面表单结构。
            </p>
            <textarea
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              className="min-h-36 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
              placeholder='[{"nickname":"安琪","riotId":"AnQi#CN","mainRole":"duelist","highestRank":"超凡","preferredAgents":["Jett"]}]'
            />
            <div className="flex flex-wrap gap-3">
              <label className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm font-semibold text-stone-100">
                读取 JSON 文件
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(event) => void handleImportFile(event.target.files?.[0] ?? null)}
                />
              </label>
              <button
                type="button"
                onClick={handleImportPlayers}
                disabled={!importText.trim()}
                className="rounded-full bg-[#ff5e3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              >
                替换导入
              </button>
            </div>
            {importError ? (
              <div className="rounded-[20px] border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {importError}
              </div>
            ) : null}
          </GlowCard>
        </div>
      </div>
    </div>
  );
}
