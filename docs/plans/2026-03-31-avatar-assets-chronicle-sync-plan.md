# Avatar Assets and Chronicle Sync Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Stop team-avatar uploads from overflowing localStorage and add a manual "sync to chronicle" flow once a season champion is decided.

**Architecture:** Move uploaded team avatar binaries out of draft JSON and into a browser asset store so setup storage only persists small references. Add a dedicated chronicle storage layer with upsert semantics keyed by event slug, and expose a manual sync action from the initialized event dashboard once a champion exists. Chronicle pages should subscribe to real chronicle entries instead of rendering only static mock data.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS, Vitest, localStorage snapshot stores, browser IndexedDB (with graceful in-memory/local fallback in tests).

### Task 1: Test avatar asset persistence and chronicle sync behavior

**Files:**
- Create: `src/lib/assets/__tests__/storage.test.ts`
- Create: `src/lib/chronicle/__tests__/storage.test.ts`
- Modify: `src/components/launch/__tests__/season-launch-pad.test.tsx`

**Step 1: Write the failing test**

Add tests that prove:
- avatar uploads can be stored and retrieved by asset id without embedding the binary into the setup draft
- chronicle entries upsert by `eventSlug`
- chronicle snapshots keep stable references until storage changes

**Step 2: Run test to verify it fails**

Run:

```bash
npm test -- src/lib/assets/__tests__/storage.test.ts src/lib/chronicle/__tests__/storage.test.ts
```

Expected: FAIL because neither storage module exists yet.

### Task 2: Implement browser-side avatar asset storage

**Files:**
- Create: `src/lib/assets/storage.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/setup/build-draft-preview.ts`
- Modify: `src/lib/setup/storage.ts`
- Modify: `src/components/setup/season-setup-wizard.tsx`

**Step 1: Write minimal implementation**

Create an asset storage module that:
- stores avatar payloads by asset id
- can resolve an asset id into a renderable `src`
- supports tests without relying on full browser IndexedDB

Update team customizations so they persist `avatarAssetId` instead of stuffing large base64 payloads into the draft JSON. Setup preview should resolve the asset id before rendering team avatars. If avatar save fails, surface a readable error message instead of crashing.

**Step 2: Run focused tests**

Run:

```bash
npm test -- src/lib/assets/__tests__/storage.test.ts
```

Expected: PASS.

### Task 3: Implement chronicle storage and manual sync action

**Files:**
- Create: `src/lib/chronicle/storage.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/components/event/initialized-event-dashboard.tsx`
- Modify: `src/app/chronicle/page.tsx`

**Step 1: Write minimal implementation**

Add a chronicle storage layer with:
- `getChronicleEntriesSnapshot`
- `subscribeChronicleStorage`
- `upsertChronicleEntry`

Add a button in the event dashboard that appears only when a champion exists:
- first sync: `同步到编年史`
- later sync: `重新同步编年史`

The sync should upsert a single event-level chronicle item keyed by event slug. Chronicle page should read and render real entries first, with static mock content only as fallback if no entries exist.

**Step 2: Run focused tests**

Run:

```bash
npm test -- src/lib/chronicle/__tests__/storage.test.ts
```

Expected: PASS.

### Task 4: Verify everything

**Files:**
- No extra implementation if previous steps are complete

**Step 1: Run full verification**

Run:

```bash
npm run lint
npm test
npx tsc --noEmit
```

**Step 2: Verify runtime/build**

Run:

```bash
curl -sSf http://localhost:3000/
curl -sSf "http://localhost:3000/setup/season?template=tri-finals"
curl -sSf http://localhost:3000/chronicle
```

Then build in the stable path:

```bash
mkdir -p /Users/liuche/.codex-local/tangshicupweb
rsync -a --delete --exclude '.next' --exclude 'node_modules' --exclude '.git' /Volumes/passport/project/唐氏杯/ /Users/liuche/.codex-local/tangshicupweb/
cd /Users/liuche/.codex-local/tangshicupweb && npm run build
```
