# Season Consistency Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make new-season creation derive the correct next season number, remove hard-coded `S2` launch copy, and keep generated season/event metadata consistent when the season label changes.

**Architecture:** Introduce a small season-sequencing helper that derives the first missing `S<number>` from saved published setups, then funnel all season/event draft defaults through one generator. In the setup wizard, when users change generated identity fields like season label or cup name, resync the still-generated event title and slug so stale `S2` text does not linger.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Vitest, localStorage-backed setup storage.

### Task 1: Lock expected season sequencing behavior with tests

**Files:**
- Create: `src/lib/seasons/__tests__/get-next-season-sequence.test.ts`
- Modify: `src/lib/setup/__tests__/create-setup-draft.test.ts`
- Modify: `src/components/launch/__tests__/season-launch-pad.test.tsx`

**Step 1: Write the failing tests**

Cover:
- no saved published setups => next season defaults to `S2`
- existing `S2` => next season defaults to `S3`
- only `S3` exists => next season falls back to `S2`
- homepage primary CTA says `创建新赛季` instead of `创建 S2`
- created draft event title and slug are derived from the actual season label instead of hard-coded `s2`

**Step 2: Run focused tests to verify failure**

Run:

```bash
npm test -- src/lib/seasons/__tests__/get-next-season-sequence.test.ts src/lib/setup/__tests__/create-setup-draft.test.ts src/components/launch/__tests__/season-launch-pad.test.tsx
```

Expected: FAIL because season numbering and homepage CTA are still hard-coded.

### Task 2: Implement reusable season defaults and draft consistency helpers

**Files:**
- Create: `src/lib/seasons/get-next-season-sequence.ts`
- Create: `src/lib/seasons/build-season-defaults.ts`
- Modify: `src/lib/setup/create-setup-draft.ts`
- Modify: `src/lib/setup/resolve-initial-setup-draft.ts`

**Step 1: Implement minimal season generation**

Add helpers that:
- reserve `S1` as baseline content
- derive the first missing season number from saved published setups
- generate season slug/label plus event title/slug from template + season label + cup name

Update draft creation so new drafts use these helpers instead of fixed `S2` strings.

**Step 2: Run focused tests**

Run the same focused test command and confirm the logic turns green.

### Task 3: Resync generated identity fields inside the setup wizard and launch pad

**Files:**
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Modify: `src/components/launch/season-launch-pad.tsx`

**Step 1: Implement minimal UI wiring**

Update the launch pad to:
- show `创建新赛季`
- optionally surface the derived next season label nearby for context

Update the setup wizard so when users edit generated season identity fields like `赛季标签` or `杯赛名称`, the still-generated event title and event slug are rebuilt to stay consistent.

**Step 2: Add or adjust tests if needed**

If the pure helper extraction needs dedicated tests, add them before finalizing implementation.

### Task 4: Verify everything

**Step 1: Run targeted and full verification**

Run:

```bash
npm test -- src/lib/seasons/__tests__/get-next-season-sequence.test.ts src/lib/setup/__tests__/create-setup-draft.test.ts src/components/launch/__tests__/season-launch-pad.test.tsx
npm run lint
npm test
npx tsc --noEmit
```
