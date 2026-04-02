# Tangshi Cup Rank, Bracket, and Visual Refresh Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current detailed rating model with a rank-based balance system, turn tournament flow into an interactive editable match-control board, add team avatars, and redesign the UI toward a more premium esports command center.

**Architecture:** Keep the existing Next.js App Router structure, but move from static flow descriptions to a match-state driven tournament model. Treat the published event as a mutable event record with editable teams, match results, advancement state, and visual assets. Render the bracket from state, not from a one-time recommendation string.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, local storage for now, SQLite/Prisma-ready data model later.

## Product Direction

The next version should feel less like a “setup preview” and more like a “赛事控制台”.

Priority order:
1. Rank-based player power and balancing
2. Interactive bracket / standings controls after initialization
3. Team avatars and visual identity
4. Visual refresh of the homepage, setup wizard, and event control board

## Key Findings

### 1. Current balance model is over-detailed
- Current power is computed from `mechanics`, `gameSense`, `utility`, `comms`, `stability`, and optional `recentForm`.
- File: `src/lib/player-rating.ts`
- This is more complex than the actual use case and makes later editing harder.

### 2. Current tournament flow is static text, not stateful competition data
- Current flow only stores phases and participant labels.
- Files:
  - `src/lib/setup/build-tournament-flow.ts`
  - `src/components/flow/tri-team-stage-flow.tsx`
  - `src/components/flow/four-team-bracket.tsx`
- There is no match status, score state, winner selection, or downstream progression.

### 3. Current 3-team and 4-team flows are visually readable, but not operational
- 3-team mode currently assumes a fixed round robin plus final summary.
- 4-team mode currently resembles a simplified three-phase bracket, but it does not expose dynamic progression clearly enough for manual operation.

### 4. Team identity is still incomplete
- Teams have name, players, captain, coach, and total power.
- There is no team avatar field yet.
- Files:
  - `src/lib/types.ts`
  - `src/components/setup/season-setup-wizard.tsx`
  - `src/components/event/initialized-event-dashboard.tsx`

## Recommended Product Choices

### Choice A: Rank-only balancing
Recommended.

Use only player rank as the balancing source.

Rank ladder:
- Black Iron
- Bronze
- Silver
- Gold
- Platinum
- Diamond
- Ascendant
- Immortal
- Radiant

Chinese labels should follow your preferred names exactly in UI. Internally we should store:
- `rankTier` enum
- `rankScore` numeric mapping for balancing only

Recommendation:
- map the 9 tiers to a clean 1-9 or 10-90 scale
- keep room for future sub-rank bonuses, but do not expose them now

### Choice B: Match-state bracket engine
Recommended.

Instead of generating only phase text, generate:
- stages
- matches
- match slots
- current results
- advancement rules
- eliminated state
- standings where applicable

This allows:
- click one match
- set winner / score
- auto-update next stage
- keep editable history

### Choice C: Flow visualization style
Recommended hybrid.

3 teams:
- left side: editable round-robin table / cards
- right side: final card that auto-locks participants from standings

4 teams:
- use a real double-elimination-lite or clear knockout tree
- every match card should show state: pending / live / finished
- clicking a completed match should update downstream nodes immediately

## Recommended Tournament Logic

### 2 teams
- Keep simple series control board
- Best for fast operation

### 3 teams
Recommended mode:
- Round Robin
- Standings table with W-L, map diff, round diff
- Top 2 advance to final
- Final remains editable and auto-populated from standings

Why:
- easier to operate than a fake bracket
- users can immediately understand who is first, second, third
- this best matches your use case of “打完一场之后手动推进”

### 4 teams
Recommended mode:
- proper four-team double elimination light
- Opening Semis
- Winners Final
- Elimination Match
- Lower Final
- Grand Final

Why:
- clearer progression than the current simplified version
- every match result changes the visible path immediately
- much stronger “赛事感” than isolated phase cards

## Avatar Strategy

For now, support both:
1. backend-provided avatar list
2. deterministic fallback avatar

Recommendation:
- team avatar field on `Team`
- player avatar field on `Player`
- during initialization, auto-assign a random unused team avatar from a curated pool
- allow manual re-roll button per team

Fallback option:
- DiceBear supports deterministic SVG avatars, client generation, and self-hosting if needed later.

## Visual Research Summary

Recommended direction:
- more like a tournament command center than a landing page
- stronger use of panels, glow rails, status lights, stage headers, team emblems, and live-result cards
- less “pretty card grid”, more “broadcast system UI”

Useful references:
- VALORANT Esports schedule uses dense match cards, league markers, and strong stage metadata
- Challonge emphasizes format breadth and competition logic
- start.gg emphasizes `Bracket`, `Standings`, and `Stats` as parallel operational views
- Viture Dashboard shows a controlled dark palette with accent orange and restrained 3D polish
- Gaming on Avalanche shows how to make gaming UI feel immersive through shapes, motion, and atmospheric depth
- Ragebite's esports dashboard work shows a denser, gamer-oriented dashboard layout instead of generic SaaS cards

## Recommended Visual Direction For Tangshi Cup

### Palette
- base: charcoal / obsidian
- accent 1: ember orange
- accent 2: electric cyan
- accent 3: trophy gold for confirmed advancement

### Typography
- keep bold display type for event names
- add a more technical condensed font for match metadata and standings

### Layout
Homepage:
- hero command strip
- quick-start templates
- current event memory
- season archive rail

Setup:
- dual-pane wizard
- left: form
- right: live event simulation preview

Event page:
- top: season banner + event status
- center: interactive bracket / standings board
- side rail: teams, avatars, rank totals, coaches
- lower section: rules, timeline, edit history

## Implementation Tasks

### Task 1: Replace power model with rank model
**Files:**
- Modify: `src/lib/types.ts`
- Modify: `src/lib/data/mock-players.ts`
- Modify: `src/lib/player-rating.ts`
- Modify: `src/lib/balance/generate-balanced-teams.ts`
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Modify: `src/components/event/initialized-event-dashboard.tsx`
- Test: `src/lib/__tests__/player-rating.test.ts`
- Test: `src/lib/balance/__tests__/generate-balanced-teams.test.ts`

### Task 2: Introduce editable match-state tournament model
**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/tournament/create-match-state.ts`
- Create: `src/lib/tournament/update-match-result.ts`
- Create: `src/lib/tournament/compute-standings.ts`
- Replace/Refactor: `src/lib/setup/build-tournament-flow.ts`
- Test: `src/lib/tournament/__tests__/update-match-result.test.ts`
- Test: `src/lib/tournament/__tests__/compute-standings.test.ts`

### Task 3: Rebuild 3-team and 4-team event control views
**Files:**
- Modify: `src/components/flow/tournament-flow-renderer.tsx`
- Replace: `src/components/flow/tri-team-stage-flow.tsx`
- Replace: `src/components/flow/four-team-bracket.tsx`
- Create: `src/components/flow/match-control-card.tsx`
- Create: `src/components/flow/standings-panel.tsx`
- Modify: `src/components/event/initialized-event-dashboard.tsx`

### Task 4: Add avatar system
**Files:**
- Modify: `src/lib/types.ts`
- Create: `src/lib/data/mock-avatars.ts`
- Create: `src/lib/avatars/assign-team-avatars.ts`
- Modify: `src/lib/setup/build-draft-preview.ts`
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Modify: `src/components/event/initialized-event-dashboard.tsx`

### Task 5: Visual redesign pass
**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/launch/season-launch-pad.tsx`
- Modify: `src/components/setup/season-setup-wizard.tsx`
- Modify: `src/components/event/initialized-event-dashboard.tsx`
- Modify: `src/components/ui/*.tsx` as needed

## Verification

Before calling this phase complete:
- `npm test`
- `npm run lint`
- `npm run dev`
- manual check:
  - initialize 3-team event
  - report round-robin results one by one
  - confirm final participants update automatically
  - initialize 4-team event
  - report opening matches and verify downstream bracket changes
  - confirm each team has avatar and editable identity

## Notes For Later Server Deployment

This design is compatible with later SQLite migration.

Recommended persistence split later:
- `players`
- `seasons`
- `events`
- `teams`
- `matches`
- `match_results`
- `avatars`
- `event_history`

That will allow:
- editable published events
- full season archive
- replaying event progression
- server deployment without changing the UI model again
