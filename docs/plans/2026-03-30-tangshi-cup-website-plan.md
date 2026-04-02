# Tangshi Cup Website Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a Tangshi Cup website for private VALORANT in-house tournaments that can handle team creation, player drafting, match format recommendations, power balancing, fun rule overlays, and season history.

**Architecture:** Start with a content-rich tournament operations site rather than a heavy platform. Phase 1 should focus on a rules engine, roster management, auto-balancing, and a strong presentation layer. Phase 2 can add persistence, admin workflows, season archives, and richer match analytics.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui for primitives, Framer Motion, Zustand or TanStack Query for client state, Prisma + PostgreSQL for persistent data, optional Supabase/Auth.js for admin login.

## 1. Product Positioning

Tangshi Cup is not just a scoreboard page. It should feel like a private league control room for friends:

- Before a match: gather players, assign captains/coaches, import ratings, recommend the best format.
- During setup: draft teams, verify balance, lock maps/rules, publish match card.
- After the match: enter results, update season history, record MVPs and storylines.
- Across seasons: show S1, S2, S3 progression, meta changes, player legacy, and classic rivalries.

The website should therefore combine four identities:

- `赛事控制台` for organizers
- `观赛首页` for hype and atmosphere
- `规则工具` for automatic format selection
- `编年史档案馆` for long-term memory

## 2. Real-World Constraints

These are important so the site matches how VALORANT custom games actually work:

- Standard VALORANT is still built around two opposing sides in a match.
- Riot’s `Skirmish` custom mode supports `1v1` through `5v5`, including asymmetric sizes, but it is still a small-map duel-style format rather than true 3-team or 4-team simultaneous combat.
- Riot’s `Team Deathmatch` is official `5v5`, first to 100 kills, with four timed stages and no econ.
- `Swiftplay` is an official shortened spike format: first to 5 rounds, 4-round half, about 15 minutes.
- `Tournament Mode` exists in custom games for organized play and moderator controls.

Implication:

- `5v5v5` and `5v5v5v5` should be implemented as `多队赛程编排`, not as a single in-game three-team/four-team match.
- The website should recommend a sequence of matches, map pool rotation, and scoring rules for 3-team or 4-team events.

## 3. Core User Scenarios

### Scenario A: Two-Team Standard Night

Inputs:

- 10 players
- optional 1-2 coaches/observers
- player power ratings

Outputs:

- balanced 5v5 teams
- captain pick or auto-balance mode
- recommended format such as BO1, BO3, or BO5
- map veto helper
- result entry and MVP

### Scenario B: Three-Team Party Night

Inputs:

- 15 players or 10-15 mixed attendance
- optional substitutes

Outputs:

- 3 rosters
- recommended schedule such as single round robin, king-of-the-hill gauntlet, or points ladder
- rest rotation logic
- total standings and tiebreakers

### Scenario C: Four-Team Carnival Night

Inputs:

- 20 players or fewer with substitutes/coaches

Outputs:

- 4 rosters
- recommended mini-league format such as 2-group seeding + finals, round robin lite, or double-elimination-lite
- timeline estimate
- fun rule overlays to keep the event social, not overly serious

### Scenario D: Season Archive

Outputs:

- season pages like `S1`, `S2`, `S3`
- champions, runner-ups, map pools, MVPs, iconic moments
- player legacy charts
- rivalry pages

## 4. Functional Modules

### Module 1: Tournament Setup

- Create tournament
- Select season, date, organizer
- Choose number of teams: 2, 3, 4
- Choose match tone: `认真`, `半娱乐`, `纯整活`
- Choose available players and optional coaches
- Set available total time, for example `1 hour`, `2.5 hours`, `whole evening`

### Module 2: Player Database

Each player should support:

- game ID / nickname
- main role
- preferred agents
- aim score / utility score / comms score / clutch score
- overall power index
- captain tag
- coach eligibility
- attendance history
- season stats

### Module 3: Balance Engine

Support three balancing modes:

- `自动平衡`: system splits teams by total power, role distribution, and captain spread
- `队长选人`: captains draft, site shows live balance delta
- `半自动`: generate balanced starting pools, then allow swaps with warning indicators

### Module 4: Format Recommender

This is a key feature. Inputs:

- number of teams
- player count
- estimated time
- desired seriousness

Outputs:

- recommended competition format
- estimated number of matches
- estimated total duration
- fairness score
- fun score

### Module 5: Match Rules + Fun Modifiers

Not every match should be “normal ranked rules but private”.

The site should contain:

- standard modes
- short modes
- custom house rules
- random event / challenge cards

### Module 6: Season Chronicle

- season landing page
- timeline of tournaments
- title defenses
- player awards
- “famous moments”
- map meta over time
- best roster combinations

### Module 7: Admin Panel

- manage players
- edit ratings
- create events
- submit results
- publish season story entries

## 5. Recommended Tournament Formats by Team Count

### For 2 Teams

Recommended presets:

- `速战速决`: BO1 Swiftplay or Skirmish/TDM side event
- `标准夜赛`: BO3 on standard maps
- `决赛夜`: BO5 with map veto, halftime content, MVP vote

Rules engine suggestion:

- if total time < 40 min: recommend `Swiftplay BO3` or `TDM BO3`
- if total time is 60-120 min: recommend `Standard BO3`
- if total time > 2.5 hours and players want ceremony: recommend `BO5`

### For 3 Teams

Recommended presets:

- `三强循环`: each team plays each team once, points table decides ranking
- `擂台守关`: seed one “champion” team, challengers rotate in
- `积分冲刺`: short-format points race using Swiftplay or Skirmish

Suggested ranking points:

- win = 3
- close loss = 1 bonus point in long format optional
- round differential as tiebreaker

Best use cases:

- casual groups
- limited time
- nights where everyone wants to play everyone

### For 4 Teams

Recommended presets:

- `双半区 + 总决赛`: two opening matches, winners final, losers ranking, grand final
- `四队积分赛`: short round robin when you want pure fairness
- `娱乐嘉年华`: mixed format using standard + fun challenges + all-star match

Best use cases:

- full lobby nights
- anniversary or season opener/finale events

## 6. Battle Power Model

Start simple. Do not overfit the first version.

### Baseline Rating

Each player gets:

- `mechanics`: 1-10
- `game sense`: 1-10
- `utility`: 1-10
- `comms`: 1-10
- `stability`: 1-10

Overall power score:

`power = mechanics*0.35 + game_sense*0.2 + utility*0.15 + comms*0.15 + stability*0.15`

Optional modifiers:

- role scarcity bonus
- captain bonus
- recent form modifier
- map comfort modifier

### Team Balance Formula

For each team calculate:

- total power
- average power
- role coverage score
- star concentration score
- communication score

Recommended match quality score:

- `balance_gap = abs(teamA_power - teamB_power)`
- green if gap <= 4%
- yellow if 4%-8%
- red if > 8%

For 3 or 4 teams:

- evaluate standard deviation across all team totals
- penalize teams with no sentinel/controller-type role coverage if your group cares about role realism

### Version 2 Improvements

- ingest results and adjust Elo-like seasonal rating
- store map-specific win rate
- track captain draft success

## 7. Draft and Teaming System

Recommended flow:

1. Organizer selects event type.
2. Players check in.
3. System proposes balanced rosters.
4. User chooses one of:
   - accept
   - captain draft
   - shuffle again
   - manual swap
5. Site shows fairness meter in real time.
6. Lock teams and publish match card.

Suggested extra features:

- snake draft option
- protected duo option
- avoid same-team repeat option
- coach assignment per roster

## 8. Fun Rule Library

The site should treat these as structured “event modifiers”, not random text notes.

Categories:

- `武器限制`
- `技能限制`
- `地图任务`
- `经济挑战`
- `剧情事件`

Good first-wave modifiers:

- Sheriff Only half
- Shotgun round every third round
- Knife duel for side select
- Captain must lock a controller
- Loser gets map pick plus one buff card
- Random agent pool challenge
- Protect the VIP: one marked player cannot entry first
- Coach Call Round: one tactical timeout grants a forced strat card
- Clutch Bounty: extra points for 1vX wins
- Revenge Match: rematch grants double story points, not double standings points

Good social side-events:

- TDM warmup race
- 1v1 Skirmish ladder
- All-star mixed team showmatch
- Quiz or prediction mini-panel before final

Important product rule:

- separate `正式积分规则` from `娱乐附加规则`
- allow organizers to toggle whether a modifier affects standings, only side awards, or pure atmosphere

## 9. Frontend Experience Direction

The site should feel like a homegrown invitational, not a generic admin dashboard.

### Recommended Visual Direction

Direction name:

- `地下赛事指挥中心 / Neon Arena Archive`

Design cues:

- scoreboard-style hero
- sharp typographic hierarchy
- metallic overlays, scanlines, tactical grid, animated light sweeps
- season badges and patch-card style player panels
- map veto presented like a broadcast segment

Suggested palette:

- base: graphite / obsidian / gunmetal
- accent 1: red-orange for danger and heat
- accent 2: teal-cyan for systems and data
- accent 3: off-white for contrast

Typography direction:

- display font with esports poster personality
- body font with strong Chinese readability

Motion direction:

- bracket reveal animation
- stat counters loading like broadcast graphics
- timeline cards snapping into place
- player introduction cards with staggered cinematic entry

### Page-Level Experience

Home page:

- season banner
- next event countdown
- latest champion
- featured rivalries
- quick create tournament CTA

Tournament page:

- rosters
- balance meter
- format recommendation
- veto flow
- live result cards

Chronicle page:

- horizontal or vertical interactive timeline
- each season as a chapter
- iconic match cards
- awards wall

Player page:

- power radar
- season stats
- signature agents
- legacy timeline

## 10. Frontend Skill Research

I searched for reusable frontend skills and the most relevant options were:

- `anthropics/skills@frontend-design`
- `mblode/agent-skills@ui-animation`
- `supercent-io/skills-template@frontend-design-system`
- `leonxlnx/taste-skill@design-taste-frontend`

Recommendation:

- when implementation starts, prioritize `frontend-design` for layout and visual system
- optionally combine it with `ui-animation` for motion polish on hero, brackets, and season timeline

## 11. Suggested Information Architecture

### Public Pages

- `/`
- `/seasons`
- `/seasons/s1`
- `/events/[slug]`
- `/players`
- `/players/[slug]`
- `/formats`
- `/chronicle`

### Admin Pages

- `/admin`
- `/admin/players`
- `/admin/events`
- `/admin/seasons`
- `/admin/results`

### Reusable UI Blocks

- tournament hero
- roster card
- player power card
- balance meter
- format recommender card
- map veto board
- timeline rail
- awards shelf
- standings table

## 12. Suggested Data Model

### `players`

- id
- nickname
- riot_id
- avatar
- preferred_roles
- preferred_agents
- mechanics
- game_sense
- utility
- comms
- stability
- overall_power
- active

### `teams`

- id
- name
- season_id
- event_id
- coach_player_id nullable
- seed

### `team_members`

- id
- team_id
- player_id
- role_tag

### `events`

- id
- season_id
- title
- slug
- event_type
- team_count
- format_type
- seriousness_level
- time_budget_minutes
- status
- happened_at

### `matches`

- id
- event_id
- round_name
- match_index
- team_a_id
- team_b_id
- mode_type
- map_name
- ruleset_id
- result

### `rulesets`

- id
- name
- category
- mode_base
- modifiers_json
- ranked_effect

### `season_stories`

- id
- season_id
- title
- chapter_type
- cover_image
- body_md
- happened_at

## 13. Recommended Technical Scope by Phase

### Phase 1: MVP

Goal:

- usable private tournament website for your group

Include:

- home page
- player database
- tournament creation
- team auto-balance
- format recommendation
- result entry
- season page

Do not include yet:

- login complexity
- real-time sockets
- public registration
- complex stats ingestion

### Phase 2: Operations Upgrade

- admin auth
- edit history
- map veto UX
- richer standings and tiebreakers
- season awards automation
- export images for sharing

### Phase 3: Hype Layer

- animated intro
- richer chronicle storytelling
- player cards and banners
- MVP voting
- live overlay mode for LAN display or TV

## 14. Recommended Build Order

### Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`

**Step 1: Scaffold Next.js app**

Run: `pnpm create next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*"`

**Step 2: Install UI and data dependencies**

Run: `pnpm add framer-motion lucide-react zustand @tanstack/react-query prisma @prisma/client zod`

**Step 3: Verify dev server boots**

Run: `pnpm dev`
Expected: homepage renders without errors

### Task 2: Design System + Atmosphere

**Files:**
- Create: `src/styles/theme.css`
- Create: `src/components/ui/section-shell.tsx`
- Create: `src/components/ui/glow-divider.tsx`
- Create: `src/components/ui/stat-chip.tsx`
- Modify: `src/app/globals.css`

**Step 1: Define color tokens and motion tokens**

**Step 2: Build reusable shells and stat components**

**Step 3: Apply them to homepage hero**

**Step 4: Test desktop and mobile breakpoints**

Run: `pnpm lint`
Expected: pass

### Task 3: Player Data Model

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/player-rating.ts`
- Create: `src/lib/types.ts`
- Create: `src/lib/data/mock-players.ts`

**Step 1: Define player schema**

**Step 2: Implement power calculation helper**

**Step 3: Seed mock data**

**Step 4: Add tests for power formula**

### Task 4: Balance Engine

**Files:**
- Create: `src/lib/balance/score.ts`
- Create: `src/lib/balance/generate-balanced-teams.ts`
- Create: `src/lib/balance/__tests__/generate-balanced-teams.test.ts`

**Step 1: Write failing tests for 10, 15, and 20 player cases**

**Step 2: Implement team split algorithm**

**Step 3: Return fairness metrics**

**Step 4: Verify tests pass**

### Task 5: Format Recommendation Engine

**Files:**
- Create: `src/lib/formats/recommend-format.ts`
- Create: `src/lib/formats/format-presets.ts`
- Create: `src/lib/formats/__tests__/recommend-format.test.ts`

**Step 1: Encode presets for 2, 3, and 4 team events**

**Step 2: Weight by time budget and seriousness**

**Step 3: Return recommendation plus alternates**

### Task 6: Core Pages

**Files:**
- Create: `src/app/players/page.tsx`
- Create: `src/app/events/[slug]/page.tsx`
- Create: `src/app/seasons/page.tsx`
- Create: `src/app/seasons/[slug]/page.tsx`
- Create: `src/app/chronicle/page.tsx`

**Step 1: Build homepage**

**Step 2: Build player database page**

**Step 3: Build event detail page**

**Step 4: Build season and chronicle pages**

### Task 7: Admin Workflow

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/players/page.tsx`
- Create: `src/app/admin/events/page.tsx`
- Create: `src/components/forms/player-form.tsx`
- Create: `src/components/forms/event-form.tsx`

**Step 1: Create CRUD forms**

**Step 2: Support creating tournaments and editing players**

**Step 3: Add result submission**

### Task 8: Chronicle Content Layer

**Files:**
- Create: `content/seasons/s1.md`
- Create: `content/seasons/s2.md`
- Create: `content/stories/*.md`

**Step 1: Define story schema**

**Step 2: Add season milestone entries**

**Step 3: Render them in interactive timeline UI**

### Task 9: Verification

**Files:**
- Test: `src/lib/balance/__tests__/generate-balanced-teams.test.ts`
- Test: `src/lib/formats/__tests__/recommend-format.test.ts`

**Step 1: Run unit tests**

Run: `pnpm test`
Expected: rating, balance, and format tests pass

**Step 2: Run lint**

Run: `pnpm lint`
Expected: pass

**Step 3: Run build**

Run: `pnpm build`
Expected: production build succeeds

## 15. Key Product Risks

- Overbuilding around “true multi-team simultaneous combat” when VALORANT mainly supports two-side matches
- Making balance too complex too early
- Turning the site into a plain CRUD dashboard with no event atmosphere
- Spending too much time on lore pages before tournament operations work

## 16. Best First Version Recommendation

If we want the highest chance of shipping something great quickly, the best V1 is:

- `2-4 team in-house tournament website`
- `player database + power index`
- `auto-balance and draft assistant`
- `format recommendation engine`
- `season archive + chronicle`
- `broadcast-style frontend`

That combination hits your real needs immediately while still leaving room for later expansion.

## 17. Open Decisions To Confirm Before Implementation

- do you want V1 to be local-only for your friend group, or online/public?
- do you want manual player rating input first, or automated post-match updates immediately?
- do you want the first visual direction to be more `硬核电竞转播` or more `朋友局地下联赛`?
- do you want chronology to be mostly photo/story driven, or stats/trophy driven?

## 18. External References

- Riot official `Skirmish` custom mode update
- Riot official `Team Deathmatch` rules
- Riot official `Swiftplay Beta` rules
- Riot official `Tournament Mode` patch note
- Behance esports website reference
- Behance interactive timeline reference
- Awwwards timeline interaction reference
