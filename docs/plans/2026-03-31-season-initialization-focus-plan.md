# Tangshi Cup Season Initialization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reorient the Tangshi Cup website around a season/event initialization experience so organizers can create a new season, configure the tournament structure, select captains and players, generate balanced teams, and immediately see a clear tournament flow view.

**Architecture:** Replace the current showcase-first homepage with a setup-first control room. Use a multi-step initialization wizard for creating a new season or event, then land the user in a generated event overview page that combines roster summary, rules, and a tournament flow visualization suited to the selected team count. Persist all configuration so the site has memory across refreshes and future visits.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, Framer Motion, Prisma, persistent database storage, Vitest for logic tests.

## 1. What Changed In The Product Direction

The current site is visually on-brand, but it behaves more like a static concept showcase:

- homepage highlights sample results rather than helping the user start a new season
- event pages display a finished recommendation rather than guiding setup
- player and season data are loaded from in-memory mock files
- there is no save/resume flow for drafts or historical configs

Your new requirement changes the priority completely:

- the `最重要页面` is now the start of a new season or new event
- the most valuable action is `初始化赛事`
- the most valuable post-action output is `初始化完成后的可视化总览`

So the website should pivot from:

- `展示已有内容`

to:

- `帮助你快速创建一届新赛事，并把整个流程立刻生成出来`

## 2. Current Codebase Findings

Confidence: `▓▓▓▓░` High

Evidence:

- [page.tsx](/Volumes/passport/project/唐氏杯/src/app/page.tsx) currently centers homepage around featured event, auto-balance, player ladder, and season timeline
- [mock-site.ts](/Volumes/passport/project/唐氏杯/src/lib/data/mock-site.ts) is the single source of event, season, and story data, all in memory
- [events/[slug]/page.tsx](/Volumes/passport/project/唐氏杯/src/app/events/[slug]/page.tsx) renders a finished event state, not a setup workflow
- [schema.prisma](/Volumes/passport/project/唐氏杯/prisma/schema.prisma) exists, but no database reads/writes are connected to runtime pages

Implication:

- the current information architecture is valid as a later browsing layer
- but the entry path is wrong for your actual usage pattern
- persistence is not yet implemented, so refresh-safe memory is missing

## 3. Product Goal For The Next Version

The site should answer this exact real-world scenario:

`今晚我们要开新一届唐氏杯，先把 S2 配出来。`

That means the site must support:

1. create a new season or new event
2. choose the match scale and format
3. choose captains
4. choose participating players from a default pool
5. choose rules and fun modifiers
6. auto-generate balanced teams
7. auto-generate the tournament flow and advancement view
8. save the entire setup so it can be revisited later

The setup should feel:

- fast
- controllable
- low-friction
- visually satisfying

## 4. Product Approach Options

### Option A: Wizard-First Initialization + Event Command Center

Recommended.

Flow:

- homepage becomes a `season launch pad`
- click `创建 S2`
- enter setup wizard
- after completion, land on a generated `赛事控制台`

Strengths:

- best fit for your real use
- lowest cognitive load
- easiest to extend with persistence and edit/resume
- creates a strong “ritual” feeling for starting a season

Weaknesses:

- requires refactoring homepage structure

### Option B: One-Page Mega Form

Flow:

- everything happens on one long page

Strengths:

- fast to build
- fewer routes

Weaknesses:

- becomes cluttered quickly
- poor for mobile
- harder to make feel premium
- weak visual hierarchy for team selection and bracket preview

### Option C: Admin Panel First

Flow:

- build CRUD-heavy back office first, then add frontend display later

Strengths:

- strong data management foundation

Weaknesses:

- wrong emotional center for this product
- does not solve your “start a new season quickly” need well

Recommendation:

- choose `Option A`

## 5. Recommended Information Architecture

### Replace The Entry Flow

Current homepage should evolve into:

- `控制台首页 / 初始化入口`

Recommended primary routes:

- `/` → season launch pad
- `/setup/season` → create new season wizard
- `/setup/event` → create event wizard inside an existing season
- `/seasons/[slug]` → season dashboard
- `/events/[slug]` → generated event overview

Secondary browsing routes can stay:

- `/players`
- `/formats`
- `/chronicle`

## 6. Recommended Homepage Redesign

Homepage should no longer start with a featured sample event.

Instead it should have 4 blocks:

### Block 1: Active Season Status

If an active season exists:

- show `当前赛季`
- show next event summary
- show quick actions:
  - `继续编辑`
  - `新建赛事`
  - `查看编年史`

If no active season exists:

- show `创建你的第一届唐氏杯`

### Block 2: New Season Launch Cards

Three quick templates:

- `2 队标准赛`
- `3 队循环赛`
- `4 队嘉年华`

Each card should preview:

- team count
- estimated duration
- best default format
- whether it is serious or fun-oriented

### Block 3: Last Saved Draft

If there is an unfinished setup draft:

- show resume card
- show last edited time
- show saved progress step

### Block 4: Season Memory Preview

Smaller section showing:

- latest champion
- timeline highlight
- player spotlight

This keeps the historical feel, but does not overpower setup.

## 7. Recommended Setup Flow

Use a multi-step wizard with a persistent preview panel on desktop.

### Step 1: Season Identity

Fields:

- season name, for example `S2 王朝试炼`
- visual theme
- description / slogan

### Step 2: Event Structure

Fields:

- event title
- team count: `2 / 3 / 4`
- match tone: `认真 / 平衡 / 整活`
- time budget
- format preset, default recommended automatically

### Step 3: Player Pool

Fields:

- choose from 20 default player cards
- show role and power score on each card
- support select all / clear / recommended count warning

### Step 4: Captains And Coaches

Fields:

- choose captain(s)
- optional choose coach per team or no coach
- lock captain assignment before balancing

### Step 5: Rules And Fun Modifiers

Fields:

- standard rules preset
- optional fun modifiers
- whether modifiers affect standings or only side awards

### Step 6: Team Generation

Actions:

- auto-balance teams
- shuffle again
- manual drag/swap later

Outputs:

- roster cards
- balance delta
- captain distribution

### Step 7: Tournament Flow Preview

Outputs depend on team count:

- 2 teams: BO path / map sequence / match track
- 3 teams: stage flow + standings progression
- 4 teams: bracket tree or double-elim flow

### Step 8: Confirm And Save

Actions:

- create season
- create event
- save as draft

## 8. Persistence Strategy

This is now required, not optional.

The site needs memory in two layers:

### Layer 1: Draft Memory

Used during setup before publish.

Store:

- current wizard step
- selected players
- captain choices
- selected rules
- generated but unconfirmed teams

### Layer 2: Published Memory

Used after confirmation.

Store:

- season metadata
- event config
- selected participants
- generated teams
- bracket / stage graph
- saved ruleset

### Recommended Implementation Strategy

Recommended:

- persist to database for canonical data
- optionally mirror draft state to local storage for crash recovery

Why:

- database gives real memory
- local storage gives better in-progress resilience

## 9. Recommended Data Model Additions

The current schema is a starting point, but initialization flow needs extra objects.

### Add `season_drafts`

- id
- status
- current_step
- season_payload_json
- event_payload_json
- created_at
- updated_at

### Add `event_participants`

- id
- event_id
- player_id
- selected_as_captain
- selected_as_coach
- locked

### Add `event_brackets` or `event_flow_nodes`

- id
- event_id
- phase_name
- node_type
- team_source
- team_target
- result_status
- display_order

### Add `saved_rulesets`

- event_id
- base_mode
- modifier_ids
- affects_standings

## 10. Tournament Flow Visualization Strategy

This is one of the most important design decisions.

Do not force one bracket style onto all team counts.

### For 2 Teams

Recommended visualization:

- `series track`

Display:

- BO1 / BO3 / BO5 path
- maps
- score slots
- winner progression

Why:

- cleaner than a huge bracket
- fits Valorant series logic

### For 3 Teams

Recommended visualization:

- `双阶段流程图`

Use default format:

- phase 1: mini round robin
- phase 2: top 2 advance to final
- phase 3: 3rd place marked eliminated

Display:

- team cards in phase 1
- arrows showing progression
- standings column
- final matchup card

Why:

- gives you “谁晋级谁淘汰”的感觉
- avoids awkward fake 3-team bracket trees

### For 4 Teams

Recommended visualization:

- `double elimination-lite`

Display:

- upper bracket
- lower survival match
- final
- eliminated team markers

Why:

- most visually satisfying
- easy to understand at a glance

## 11. External Practice References

These systems suggest concrete product patterns worth borrowing:

### start.gg

Useful pattern:

- split tournament setup into `Dashboard`, `Settings`, `Registration`, `Events`
- bracket setup supports `phase`, `pool`, and `progression`

Lesson for Tangshi Cup:

- season initialization should be staged, not one giant form
- progression should be explicit in the UI, especially for 3-team and 4-team modes

### Toornament

Useful pattern:

- one placement interface can add participants, set seeds, preview structure, lock seeds, and only commit on save

Lesson for Tangshi Cup:

- team generation step should support preview-first, save-second
- captain or seeded slots should be lockable

### Challonge

Useful pattern:

- quick single add, bulk add, substitute, and reusable templates for recurring tournaments

Lesson for Tangshi Cup:

- recurring season/event templates will matter a lot
- “2 队 BO3 模板” and “3 队循环赛模板” should be first-class shortcuts

### General Small-Tournament Practice

Useful pattern:

- 4-team double elimination communicates flow clearly with a small number of matches
- 3-team round robin is fair, but if you want advancement drama, adding a final after standings is clearer

## 12. Visual Direction For The New Setup Experience

The existing aesthetic can stay, but the setup UI should feel more structured.

Recommended styling:

- left or top stepper
- center main form
- right sticky live preview on desktop

Important visuals:

- player selection cards with power and role
- captain badge
- selected state that feels broadcast-grade, not checkbox-like
- flow diagram that updates as team count changes

Recommended motion:

- wizard step transitions
- roster cards snapping into lanes
- flow diagram animating progression lines

## 13. Recommended Scope Split

### Phase A: Initialization Core

Must include:

- new homepage launch pad
- new season/event wizard
- 20 default player cards
- captain selection
- team auto-balance
- save draft
- save event
- generated flow preview

### Phase B: Post-Initialization Command Center

Must include:

- event overview
- team roster recap
- rules recap
- progression board
- edit event config

### Phase C: Historical Integration

Must include:

- once event is saved, it appears in season page
- once result is entered, it appears in chronicle

## 14. Recommended Build Order

### Task 1: Add Persistence Foundation

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `src/lib/drafts/*`

Focus:

- wire runtime persistence
- support season draft and event draft storage

### Task 2: Build Initialization Wizard Routes

**Files:**
- Create: `src/app/setup/season/page.tsx`
- Create: `src/app/setup/event/page.tsx`
- Create: `src/components/setup/*`

Focus:

- multi-step flow
- state transitions
- validation

### Task 3: Add Player Selection + Captain Selection

**Files:**
- Modify: `src/lib/data/mock-players.ts`
- Create: `src/components/setup/player-pool.tsx`
- Create: `src/components/setup/captain-picker.tsx`

Focus:

- 20 default cards
- select/deselect
- captain lock

### Task 4: Add Team Generation Preview

**Files:**
- Modify: `src/lib/balance/generate-balanced-teams.ts`
- Create: `src/components/setup/team-preview.tsx`

Focus:

- preview-first workflow
- shuffle and confirm affordances

### Task 5: Add Tournament Flow Views

**Files:**
- Create: `src/components/flow/series-track.tsx`
- Create: `src/components/flow/tri-team-stage-flow.tsx`
- Create: `src/components/flow/four-team-bracket.tsx`

Focus:

- different visualization by team count

### Task 6: Refactor Homepage

**Files:**
- Modify: `src/app/page.tsx`

Focus:

- make setup the primary action
- keep history as secondary

### Task 7: Connect Saved Event Overview

**Files:**
- Modify: `src/app/events/[slug]/page.tsx`
- Modify: `src/app/seasons/[slug]/page.tsx`

Focus:

- render saved setup output
- show progression and next actions

## 15. Risks To Avoid

- keeping homepage showcase-first even though organizer workflow is setup-first
- forcing 3 teams into an unnatural knockout bracket
- implementing persistence too late
- overbuilding stats pages before the setup flow works

## 16. Best Recommendation

The best next iteration is:

- homepage becomes `赛季启动台`
- new multi-step setup wizard becomes primary feature
- initialization output generates a tailored progression board for 2/3/4 teams
- persistence becomes real so season/event state survives refresh and future visits

That is the fastest path from “概念站” to “真能用的唐氏杯组织工具”.
