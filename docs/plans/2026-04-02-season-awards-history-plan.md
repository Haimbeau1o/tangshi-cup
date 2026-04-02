# Season Continuity, Awards, and History Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Start seasons from `S1`, support deleting local saved events, fix the current setup-page update loop error, add MVP/SVP voting before chronicle sync, and let chronicle entries link back to full match history and awards.

**Architecture:** Move season sequencing to a max-existing-plus-one model based on real published setups. Extend published setup and tournament match data to store awards selections and per-match score history, then surface those records in the event dashboard and chronicle. Fix the setup autosave loop at the storage write boundary so same-value writes do not re-trigger endless subscription updates.

**Tech Stack:** Next.js App Router, React 19, TypeScript, localStorage-backed stores, Vitest.

### Task 1: Lock season numbering, delete flow, and storage loop behavior with tests

**Files:**
- Modify: `src/lib/seasons/__tests__/get-next-season-sequence.test.ts`
- Modify: `src/lib/setup/__tests__/create-setup-draft.test.ts`
- Modify: `src/lib/setup/__tests__/storage-snapshots.test.ts`

**Step 1: Write failing tests**

Cover:
- no saved events => next season is `S1`
- existing `S2` and `S3` => next season is `S4`
- deleting a saved event removes it from storage snapshots
- identical writes do not dispatch unnecessary storage updates / loops

**Step 2: Run focused tests to verify failure**

Run:

```bash
npm test -- src/lib/seasons/__tests__/get-next-season-sequence.test.ts src/lib/setup/__tests__/create-setup-draft.test.ts src/lib/setup/__tests__/storage-snapshots.test.ts
```

### Task 2: Implement season sequencing and delete support

**Files:**
- Modify: `src/lib/seasons/get-next-season-sequence.ts`
- Modify: `src/lib/setup/create-setup-draft.ts`
- Modify: `src/lib/setup/resolve-initial-setup-draft.ts`
- Modify: `src/lib/setup/storage.ts`
- Modify: `src/components/launch/season-launch-pad.tsx`
- Modify: `src/components/event/initialized-event-dashboard.tsx`

**Step 1: Implement minimal storage behavior**

Add:
- `S1` start when there are no saved seasons
- `max + 1` season sequencing for existing saved seasons
- `deletePublishedSetup(slug)` API
- no-op writes when serialized storage value is unchanged

**Step 2: Add delete UI**

Expose delete buttons in the launch pad archive and event dashboard with local confirmation.

### Task 3: Add match history and MVP/SVP awards

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/tournament/update-match-result.ts`
- Modify: `src/lib/tournament/recompute-flow.ts`
- Modify: `src/lib/tournament/__tests__/update-match-result.test.ts`
- Modify: `src/components/event/initialized-event-dashboard.tsx`

**Step 1: Write failing tests**

Cover:
- score updates append history snapshots in chronological order
- clearing or invalidating dependent matches clears stale history
- awards can be saved into published setup and remain distinct

**Step 2: Implement minimal behavior**

Add:
- per-match `history`
- event awards metadata (`mvpPlayerId`, `svpPlayerId`, `votingNote`)
- event dashboard panel that appears after champion exists, prompts the audience-vote workflow, and lets the organizer choose MVP/SVP before chronicle sync

### Task 4: Enrich chronicle entries and make them clickable for replay

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/chronicle/storage.ts`
- Modify: `src/components/chronicle/chronicle-timeline.tsx`
- Modify: `src/components/event/initialized-event-dashboard.tsx`

**Step 1: Implement chronicle enrichment**

When syncing to chronicle, include:
- champion
- MVP/SVP names
- event slug for replay link

Make chronicle cards clickable so users can jump back to the event page and review:
- final flow state
- per-match score history
- awards

### Task 5: Verify end to end

Run:

```bash
npm test -- src/lib/seasons/__tests__/get-next-season-sequence.test.ts src/lib/setup/__tests__/create-setup-draft.test.ts src/lib/setup/__tests__/storage-snapshots.test.ts src/lib/tournament/__tests__/update-match-result.test.ts
npm run lint
npm test
npx tsc --noEmit
curl -sSf http://127.0.0.1:3000/
curl -sSf http://127.0.0.1:3000/chronicle
```
