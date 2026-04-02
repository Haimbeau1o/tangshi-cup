# Editable Library and Live Series Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix the remaining homepage hydration warning and add editable player/rule libraries, richer season setup customization, and live in-progress series scoring.

**Architecture:** Introduce a local content-library layer that wraps the existing mock data with localStorage-backed snapshots for players and rule cards. Extend the setup draft to carry team customization state before publish, and evolve tournament matches from terminal-only results into a score-state model that can be edited incrementally until completion.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, localStorage snapshot stores.

## Task 1: Fix Hydration Mismatch On The Launch Pad

**Files:**
- Modify: `src/components/launch/season-launch-pad.tsx`
- Test: `src/lib/setup/__tests__/storage-snapshots.test.ts`

**Steps:**
1. Write a failing test that proves the published setups snapshot differs between server fallback and hydrated client rendering.
2. Run the focused test and verify the mismatch scenario fails for the expected reason.
3. Gate the archive rendering behind the hydration state so the server and client initial markup match.
4. Re-run the focused test and verify it passes.

## Task 2: Add Editable Content Library Storage

**Files:**
- Create: `src/lib/content/storage.ts`
- Create: `src/lib/content/defaults.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/data/mock-players.ts`
- Modify: `src/lib/data/mock-site.ts`
- Test: `src/lib/content/__tests__/storage.test.ts`

**Steps:**
1. Write failing tests for reading defaults, saving player overrides, deleting players, importing player collections, and editing rule cards.
2. Run the focused tests and confirm they fail because the storage layer does not exist yet.
3. Create a content storage module with snapshot helpers for players and rule modifiers, following the existing setup-storage caching pattern.
4. Re-run the focused tests and verify they pass.

## Task 3: Extend Setup Draft For Season And Team Customization

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/setup/create-setup-draft.ts`
- Modify: `src/lib/setup/build-draft-preview.ts`
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Test: `src/lib/setup/__tests__/build-draft-preview.test.ts`
- Test: `src/lib/setup/__tests__/create-setup-draft.test.ts`

**Steps:**
1. Write failing tests for carrying custom team names, slogans, and avatar overrides into the preview flow.
2. Run the focused tests and verify they fail because the draft model has no customization state yet.
3. Extend the draft model with season cup metadata and team customization records, then merge those records into the generated preview teams.
4. Re-run the focused tests and verify they pass.

## Task 4: Support In-Progress Match Scores

**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/tournament/create-match-state.ts`
- Modify: `src/lib/tournament/recompute-flow.ts`
- Modify: `src/lib/tournament/update-match-result.ts`
- Test: `src/lib/tournament/__tests__/update-match-result.test.ts`

**Steps:**
1. Write failing tests for recording intermediate states like `1:0`, `1:1`, clearing a live score, and only promoting winners after the match is actually complete.
2. Run the focused tests and verify they fail against the current terminal-only result model.
3. Change the tournament state to keep a current score, a derived completion check, and downstream progression only when the win threshold is reached.
4. Re-run the focused tests and verify they pass.

## Task 5: Build Editing UI For Players, Rules, And Team Customization

**Files:**
- Modify: `src/app/players/page.tsx`
- Modify: `src/app/players/[slug]/page.tsx`
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Modify: `src/components/event/initialized-event-dashboard.tsx`
- Modify: `src/components/flow/match-control-card.tsx`
- Create: `src/components/content/player-library-manager.tsx`
- Create: `src/components/content/rule-library-manager.tsx`

**Steps:**
1. Add UI-level tests where helpful for import/delete/edit flows; otherwise add focused model tests before UI work.
2. Implement player editing with add, delete, and JSON import, backed by the new content storage.
3. Implement rule-card editing with add, delete, and inline editing.
4. Add preview-step controls for team name, team slogan, and avatar upload.
5. Replace final-score shortcut buttons with incremental scoring controls that expose live series state.

## Verification

Run all of the following before calling the work complete:
- `npm test`
- `npm run lint`
- `npx tsc --noEmit`
- `npm run dev`
- Manual checks:
  - homepage loads without hydration warning
  - players page can add, edit, delete, and import players
  - rules can add and delete cards in setup flow
  - preview step can customize team name, slogan, and avatar
  - event page supports `1:0`, `1:1`, and final completion progression
