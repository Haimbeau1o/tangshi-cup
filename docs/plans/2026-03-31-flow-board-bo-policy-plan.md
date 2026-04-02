# Flow Board and Fixed BO Policy Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make tournament flow render as a draggable zoomable board and enforce fixed BO rules: `2 teams => BO3`, `3 or 4 teams => BO1`.

**Architecture:** Keep the current tournament state model and score-editing behavior, but enforce BO policy at draft creation, setup interactions, and flow generation so stale or custom values cannot violate the rule. Replace the fixed tri-team/four-team grid renderers with a shared board canvas that positions match nodes absolutely and draws SVG connectors, while reusing the existing match control cards as node content.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, SVG-based board rendering.

### Task 1: Lock the BO policy with tests first

**Files:**
- Modify: `src/lib/setup/__tests__/create-setup-draft.test.ts`
- Modify: `src/lib/setup/__tests__/build-tournament-flow.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- two-team drafts default to `bo3`
- three-team drafts default to `bo1`
- four-team drafts default to `bo1`
- generated three-team and four-team flows use `bo1` matches even if a different best-of value is passed in

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/setup/__tests__/create-setup-draft.test.ts src/lib/setup/__tests__/build-tournament-flow.test.ts
```

Expected: FAIL because multi-team defaults are still `bo3` and flow generation still trusts input `bestOf`.

### Task 2: Implement fixed BO policy

**Files:**
- Modify: `src/lib/setup/create-setup-draft.ts`
- Modify: `src/lib/setup/build-tournament-flow.ts`
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Modify: `src/lib/tournament/create-match-state.ts`

**Step 1: Write minimal implementation**

Add a helper that resolves best-of from team count:
- `2 -> bo3`
- `3 -> bo1`
- `4 -> bo1`

Use it in:
- draft creation
- team-count switching in setup
- flow generation

Update setup UI so BO is displayed as fixed policy rather than editable choice.

**Step 2: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/setup/__tests__/create-setup-draft.test.ts src/lib/setup/__tests__/build-tournament-flow.test.ts
```

Expected: PASS.

### Task 3: Test board layout generation

**Files:**
- Create: `src/lib/flow-board/__tests__/build-flow-board-layout.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- three-team flows generate positioned nodes for standings stage and final stage
- four-team flows generate positioned nodes for each phase
- board edges are created for winner/loser dependencies
- layout dimensions are larger than the viewport baseline

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/flow-board/__tests__/build-flow-board-layout.test.ts
```

Expected: FAIL because there is no board layout builder yet.

### Task 4: Implement draggable zoomable flow board

**Files:**
- Create: `src/lib/flow-board/build-flow-board-layout.ts`
- Create: `src/components/flow/flow-board-canvas.tsx`
- Create: `src/components/flow/flow-board-edge-layer.tsx`
- Modify: `src/components/flow/tournament-flow-renderer.tsx`
- Modify: `src/components/flow/tri-team-stage-flow.tsx`
- Modify: `src/components/flow/four-team-bracket.tsx`
- Modify: `src/components/flow/match-control-card.tsx`

**Step 1: Write minimal implementation**

Build a shared board renderer with:
- absolute node placement
- SVG path connectors
- wheel zoom
- pointer drag to pan
- reset button

Reuse `MatchControlCard` as node content. Keep two-team flow unchanged unless needed; convert tri-team and four-team layouts to board mode.

**Step 2: Run test to verify it passes**

Run:

```bash
npm test -- src/lib/flow-board/__tests__/build-flow-board-layout.test.ts
```

Expected: PASS.

### Task 5: Verify end to end

**Files:**
- No additional code if previous tasks are complete

**Step 1: Run full verification**

Run:

```bash
npm run lint
npm test
npx tsc --noEmit
```

**Step 2: Run app verification**

Run:

```bash
curl -sSf http://localhost:3000/
curl -sSf "http://localhost:3000/setup/season?template=tri-finals"
curl -sSf http://localhost:3000/events/test-missing
```

If needed, also run a stable production build in `/Users/liuche/.codex-local/tangshicupweb`.
