# Flow Board and Dynamic Season Sequencing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade the tournament experience so multi-team events use a zoomable draggable flow board, 3-team and 4-team presets default to faster BO1 matches, and new seasons auto-pick the first missing season number while the archive and chronicle reflect real created seasons.

**Architecture:** Keep the current tournament state machine and published-setup storage, but add a derived season archive layer on top of published setups. Replace the fixed multi-column bracket rendering with a board layout model that renders positioned match nodes and SVG connectors inside a pan/zoom viewport. Season defaults should be generated dynamically from existing published setups instead of hard-coded `S2` strings.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, localStorage snapshot stores, SVG board rendering with client-side pan/zoom.

### Task 1: Add dynamic season numbering and reusable season defaults

**Files:**
- Create: `src/lib/seasons/get-next-season-sequence.ts`
- Create: `src/lib/seasons/build-season-defaults.ts`
- Modify: `src/lib/setup/create-setup-draft.ts`
- Modify: `src/lib/setup/resolve-initial-setup-draft.ts`
- Modify: `src/lib/setup/storage.ts`
- Test: `src/lib/seasons/__tests__/get-next-season-sequence.test.ts`
- Test: `src/lib/setup/__tests__/create-setup-draft.test.ts`

**Step 1: Write the failing tests**

Add tests that prove:
- with no real saved setups, the next created season defaults to `S2`
- if `S2` exists, the next created season defaults to `S3`
- if `S2` is deleted and only `S3` exists, the next created season falls back to `S2`
- event title/slug/season slug are generated from the dynamic season number instead of hard-coded `s2`

**Step 2: Run focused tests to verify failure**

Run:

```bash
npm test -- src/lib/seasons/__tests__/get-next-season-sequence.test.ts src/lib/setup/__tests__/create-setup-draft.test.ts
```

Expected: FAIL because there is no season-sequence helper and `createSetupDraft` still hard-codes `S2`.

**Step 3: Implement minimal season sequencing**

Build a helper that:
- reads existing `PublishedSetup[]`
- extracts numeric season labels matching `S<number>`
- reserves `S1` as the sample baseline
- returns the first missing integer from `2` upward

Then refactor draft creation so season label, slug, event title, and event slug are all produced from derived season defaults.

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/lib/seasons/__tests__/get-next-season-sequence.test.ts src/lib/setup/__tests__/create-setup-draft.test.ts
```

Expected: PASS.

### Task 2: Make archive and chronicle derive from real published seasons

**Files:**
- Create: `src/lib/seasons/build-season-archive.ts`
- Modify: `src/components/launch/season-launch-pad.tsx`
- Modify: `src/app/seasons/page.tsx`
- Modify: `src/app/seasons/[slug]/page.tsx`
- Modify: `src/app/chronicle/page.tsx`
- Modify: `src/lib/setup/storage.ts`
- Test: `src/lib/seasons/__tests__/build-season-archive.test.ts`
- Test: `src/components/launch/__tests__/season-launch-pad.test.tsx`

**Step 1: Write the failing tests**

Cover:
- grouping published setups by season slug
- generating season cards from actual saved events
- chronicle entries for season creation and published event creation
- deletion removing the season from derived archive if no events remain

**Step 2: Run focused tests to verify failure**

Run:

```bash
npm test -- src/lib/seasons/__tests__/build-season-archive.test.ts src/components/launch/__tests__/season-launch-pad.test.tsx
```

Expected: FAIL because the pages still depend on mock `seasons` and `seasonStories`.

**Step 3: Implement archive derivation and delete support**

Add:
- a helper that groups `published setups` into season summaries
- a helper that emits chronicle timeline items from `publishedAt`, championship state, and event metadata
- a `deletePublishedSetup(slug)` storage API

Update the launch pad to:
- show delete action for saved events
- derive archive cards from real saved setups
- let new season creation use the derived next season label

Update the seasons pages and chronicle page to prefer real archive data, with mocks only as empty-state fallback.

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/lib/seasons/__tests__/build-season-archive.test.ts src/components/launch/__tests__/season-launch-pad.test.tsx
```

Expected: PASS.

### Task 3: Default 3-team and 4-team tournaments to fast BO1 progression

**Files:**
- Modify: `src/lib/setup/create-setup-draft.ts`
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Modify: `src/lib/setup/build-tournament-flow.ts`
- Modify: `src/lib/tournament/create-match-state.ts`
- Test: `src/lib/setup/__tests__/create-setup-draft.test.ts`
- Test: `src/lib/setup/__tests__/build-tournament-flow.test.ts`

**Step 1: Write the failing tests**

Add tests that prove:
- 2-team standard still defaults to `bo3`
- 3-team template defaults to `bo1`
- 4-team template defaults to `bo1`
- round-robin and bracket matches are created as `bo1` for multi-team formats

**Step 2: Run focused tests to verify failure**

Run:

```bash
npm test -- src/lib/setup/__tests__/create-setup-draft.test.ts src/lib/setup/__tests__/build-tournament-flow.test.ts
```

Expected: FAIL because multi-team templates still default to `bo3`.

**Step 3: Implement minimal best-of policy**

Change template defaults and scale switching so:
- `2 teams` => default `bo3`
- `3 teams` => default `bo1`
- `4 teams` => default `bo1`

Keep the manual selector in setup if you still want override power, but make the default optimized for speed. If needed, add a small hint in UI explaining why multi-team presets start at `BO1`.

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/lib/setup/__tests__/create-setup-draft.test.ts src/lib/setup/__tests__/build-tournament-flow.test.ts
```

Expected: PASS.

### Task 4: Replace fixed multi-column layouts with a zoomable draggable flow board

**Files:**
- Create: `src/lib/flow-board/build-flow-board-layout.ts`
- Create: `src/components/flow/flow-board-canvas.tsx`
- Create: `src/components/flow/flow-board-edge-layer.tsx`
- Modify: `src/components/flow/tournament-flow-renderer.tsx`
- Modify: `src/components/flow/tri-team-stage-flow.tsx`
- Modify: `src/components/flow/four-team-bracket.tsx`
- Modify: `src/components/flow/match-control-card.tsx`
- Test: `src/lib/flow-board/__tests__/build-flow-board-layout.test.ts`

**Step 1: Write the failing tests**

Add tests for:
- board layout positions for 3-team and 4-team flows
- connector definitions between upstream and downstream matches
- stable node sizing and lane ordering

**Step 2: Run focused tests to verify failure**

Run:

```bash
npm test -- src/lib/flow-board/__tests__/build-flow-board-layout.test.ts
```

Expected: FAIL because there is no board layout layer yet.

**Step 3: Implement the board layer**

Build a layout helper that converts `TournamentFlow` into:
- lane metadata
- positioned match nodes
- edge paths for winner/loser advancement

Render it inside a client-only viewport with:
- mouse drag to pan
- wheel or button zoom
- reset view button
- large enough canvas for 3-team and 4-team boards

Use existing `MatchControlCard` as node content so score editing behavior is preserved.

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/lib/flow-board/__tests__/build-flow-board-layout.test.ts
```

Expected: PASS.

### Task 5: Integrate delete flow, archive refresh, and runtime verification

**Files:**
- Modify: `src/components/event/initialized-event-dashboard.tsx`
- Modify: `src/components/launch/season-launch-pad.tsx`
- Modify: `src/lib/setup/storage.ts`
- Test: `src/lib/setup/__tests__/storage-snapshots.test.ts`

**Step 1: Write the failing tests**

Cover:
- deleting a saved event updates snapshots
- next draft creation reuses the now-missing season number
- archive/chronicle derived data refreshes after deletion

**Step 2: Run focused tests to verify failure**

Run:

```bash
npm test -- src/lib/setup/__tests__/storage-snapshots.test.ts
```

Expected: FAIL because delete support and derived refresh logic do not exist yet.

**Step 3: Implement delete-refresh behavior**

Add delete entry points from launch pad or event dashboard, wire them to storage, and ensure the subscription snapshot updates trigger:
- launch pad archive refresh
- next season default refresh
- derived seasons/chronicle refresh

**Step 4: Verify tests pass**

Run:

```bash
npm test -- src/lib/setup/__tests__/storage-snapshots.test.ts
```

Expected: PASS.

## Verification

Run all of the following before calling the work complete:

```bash
npm run lint
npm test
npx tsc --noEmit
```

Manual checks:
- `/setup/season` with no saved events defaults to `S2`
- after saving one `S2` event, a new draft defaults to `S3`
- after deleting the only `S2` event, a new draft defaults back to `S2`
- 3-team and 4-team drafts default to `BO1`
- event flow on 3-team and 4-team pages can zoom, pan, and still edit scores
- `/seasons` and `/chronicle` show real saved seasons instead of only mock content
