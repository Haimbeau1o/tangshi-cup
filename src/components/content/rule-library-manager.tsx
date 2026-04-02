"use client";

import { useState, useSyncExternalStore } from "react";

import { GlowCard } from "@/components/ui/glow-card";
import { Pill } from "@/components/ui/pill";
import {
  deleteRuleModifier,
  getRuleModifiersSnapshot,
  subscribeContentStorage,
  upsertRuleModifier,
} from "@/lib/content/storage";
import type { RuleModifier } from "@/lib/types";
import { useHydrated } from "@/lib/use-hydrated";

const categoryOptions: RuleModifier["category"][] = ["weapon", "ability", "economy", "story", "warmup"];
const impactOptions: RuleModifier["impact"][] = ["standings", "side-awards", "atmosphere"];

function toSafeId(value: string, fallback = "rule") {
  const safe = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return safe || fallback;
}

function createBlankRule(): RuleModifier {
  return {
    id: "",
    title: "",
    category: "story",
    impact: "atmosphere",
    description: "",
  };
}

export function RuleLibraryManager() {
  const isHydrated = useHydrated();
  const ruleModifiers = useSyncExternalStore(
    subscribeContentStorage,
    getRuleModifiersSnapshot,
    getRuleModifiersSnapshot,
  );
  const [draftRule, setDraftRule] = useState<RuleModifier>(createBlankRule);

  function patchRule(rule: RuleModifier, patch: Partial<RuleModifier>) {
    upsertRuleModifier({
      ...rule,
      ...patch,
    });
  }

  function handleCreateRule() {
    const nextRule = {
      ...draftRule,
      id: draftRule.id || `${toSafeId(draftRule.title || "rule")}-${Date.now()}`,
    };

    upsertRuleModifier(nextRule);
    setDraftRule(createBlankRule());
  }

  if (!isHydrated) {
    return (
      <GlowCard className="text-sm text-stone-400">正在读取本地规则卡库...</GlowCard>
    );
  }

  return (
    <div className="space-y-4">
      <GlowCard className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300/80">Rule Manager</p>
          <h3 className="mt-2 font-display text-4xl uppercase tracking-[0.08em] text-stone-50">补充规则卡</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-300">规则标题</span>
            <input
              value={draftRule.title}
              onChange={(event) => setDraftRule((current) => ({ ...current, title: event.target.value }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-300">影响维度</span>
            <select
              value={draftRule.impact}
              onChange={(event) => setDraftRule((current) => ({ ...current, impact: event.target.value as RuleModifier["impact"] }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
            >
              {impactOptions.map((impact) => (
                <option key={impact} value={impact}>
                  {impact}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-[0.35fr_0.65fr]">
          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-300">规则类别</span>
            <select
              value={draftRule.category}
              onChange={(event) => setDraftRule((current) => ({ ...current, category: event.target.value as RuleModifier["category"] }))}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
            >
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-stone-300">描述</span>
            <textarea
              value={draftRule.description}
              onChange={(event) => setDraftRule((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={handleCreateRule}
          disabled={!draftRule.title.trim()}
          className="rounded-full bg-[#ff5e3a] px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
        >
          添加规则卡
        </button>
      </GlowCard>

      <div className="grid gap-4 md:grid-cols-2">
        {ruleModifiers.map((modifier) => (
          <GlowCard key={modifier.id} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Pill>{modifier.impact}</Pill>
              <button
                type="button"
                onClick={() => deleteRuleModifier(modifier.id)}
                className="rounded-full border border-rose-400/25 bg-rose-400/10 px-3 py-1 text-xs font-semibold text-rose-100"
              >
                删除
              </button>
            </div>
            <input
              value={modifier.title}
              onChange={(event) => patchRule(modifier, { title: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-semibold text-stone-100 outline-none"
            />
            <div className="grid gap-3 md:grid-cols-2">
              <select
                value={modifier.category}
                onChange={(event) => patchRule(modifier, { category: event.target.value as RuleModifier["category"] })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
              >
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={modifier.impact}
                onChange={(event) => patchRule(modifier, { impact: event.target.value as RuleModifier["impact"] })}
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
              >
                {impactOptions.map((impact) => (
                  <option key={impact} value={impact}>
                    {impact}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={modifier.description}
              onChange={(event) => patchRule(modifier, { description: event.target.value })}
              className="min-h-24 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-stone-100 outline-none"
            />
          </GlowCard>
        ))}
      </div>
    </div>
  );
}
