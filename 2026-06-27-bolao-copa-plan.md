# Bolão Copa 2026 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web app for a closed-group World Cup 2026 knockout-stage betting pool, where each participant logs in with a personal PIN, submits/edits score predictions (editable until 23h59 the day before each game), and sees an auto-calculated standings table with prize splits.

**Architecture:** Single-page React (Vite + TypeScript) front-end talking to Supabase (Postgres + JS client) for data; deployed on Vercel. All scoring, locking, bracket-cascade and prize math live in **pure, unit-tested TypeScript functions** in `src/lib/` so they can be tested without a browser or database. The UI and the admin panel are thin layers over those functions plus Supabase reads/writes.

**Tech Stack:** React 18, TypeScript, Vite, Vitest (tests), Supabase (`@supabase/supabase-js`), Vercel.

**Reference spec:** `Documents/Ferramentas Claude/bolao-copa/2026-06-27-bolao-copa-design.md`

---

## File Structure

```
bolao-copa/                         (Vite project root)
  src/
    lib/
      scoring.ts        # pure: points for one game prediction vs result
      lock.ts           # pure: is a game/artilheiro locked given "now"
      bracket.ts        # pure: cascade advancing team into next-round games
      prizes.ts         # pure: bolo total + split across top 5 with ties
      types.ts          # shared TS types (Game, Prediction, Participant...)
    data/
      seed-oitavas.ts   # the 8 round-of-16 fixtures + dates + later-round shells
    supabase/
      client.ts         # configured Supabase client
      api.ts            # typed read/write helpers (participants, games, predictions)
    auth/
      session.ts        # PIN login + current participant in localStorage
    components/
      Login.tsx
      MyPredictions.tsx
      GameCard.tsx      # one game: teams + score steppers + advance dropdown
      ScoreStepper.tsx
      Artilheiro.tsx
      Standings.tsx
      admin/
        AdminLogin.tsx
        ManageParticipants.tsx
        EnterResults.tsx
    App.tsx
    main.tsx
  tests/                # mirrors src/lib
  index.html
  package.json
  vite.config.ts
  .env.local            # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (not committed)
```

Pure logic in `src/lib/` has no React/Supabase imports — that is what makes it unit-testable.

---

## Task 1: Scaffold the project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [ ] **Step 1: Create the Vite React+TS project**

Run in the parent folder `Documents/Ferramentas Claude/`:
```bash
npm create vite@latest bolao-copa -- --template react-ts
cd bolao-copa
npm install
npm install @supabase/supabase-js
npm install -D vitest
```

- [ ] **Step 2: Add the test script and vitest config**

In `package.json` `"scripts"` add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

In `vite.config.ts` add the `test` block:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: { environment: 'node' },
})
```

- [ ] **Step 3: Verify the toolchain runs**

Run: `npm run test`
Expected: vitest runs and reports "No test files found" (exit 0) — toolchain works.

- [ ] **Step 4: Commit**

```bash
git init
git add -A
git commit -m "chore: scaffold Vite React+TS project with vitest"
```

---

## Task 2: Shared types

**Files:**
- Create: `src/lib/types.ts`

- [ ] **Step 1: Write the types**

```ts
export type Phase = 'oitavas' | 'quartas' | 'semis' | 'terceiro' | 'final'

export interface Game {
  id: string            // e.g. "G1".."G16"
  phase: Phase
  order: number         // display order within phase
  date: string          // ISO date "2026-07-04" (kickoff day)
  // For oitavas, home/away are real teams. For later phases they are null
  // until filled by the bracket cascade from the participant's own picks.
  homeTeam: string | null
  awayTeam: string | null
  // Which earlier games feed this game's slots (null for oitavas).
  homeSourceGameId: string | null
  awaySourceGameId: string | null
}

export interface Prediction {
  participantId: string
  gameId: string
  homeScore: number
  awayScore: number
  // Required only when homeScore === awayScore (draw): who the participant
  // thinks advances. Does NOT score points; only feeds the bracket.
  advanceTeam: string | null
}

export interface GameResult {
  gameId: string
  homeScore: number
  awayScore: number
  advanceTeam: string   // real team that advanced (decided incl. penalties)
}

export interface Participant {
  id: string
  name: string
  pin: string
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: shared domain types"
```

---

## Task 3: Scoring engine (pure, TDD)

**Files:**
- Create: `src/lib/scoring.ts`
- Test: `tests/scoring.test.ts`

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { scoreGame } from '../src/lib/scoring'

// helper: prediction(home,away) vs result(home,away)
const p = (h: number, a: number) => ({ homeScore: h, awayScore: a })

describe('scoreGame', () => {
  it('12 for exact score', () => {
    expect(scoreGame(p(3, 2), p(3, 2))).toBe(12)
  })
  it('8 for correct winner + one exact team score', () => {
    expect(scoreGame(p(3, 2), p(3, 1))).toBe(8) // got home "3"
    expect(scoreGame(p(3, 2), p(4, 2))).toBe(8) // got away "2"
  })
  it('6 for correct winner only', () => {
    expect(scoreGame(p(3, 2), p(4, 1))).toBe(6)
  })
  it('2 for wrong winner but one exact team score', () => {
    expect(scoreGame(p(3, 2), p(1, 2))).toBe(2) // got away "2", wrong winner
  })
  it('0 for everything wrong', () => {
    expect(scoreGame(p(3, 2), p(1, 3))).toBe(0)
  })
  it('draws: exact draw is 12', () => {
    expect(scoreGame(p(3, 3), p(3, 3))).toBe(12)
  })
  it('draws: predicted draw, drawn result, no exact number is 6', () => {
    expect(scoreGame(p(3, 3), p(2, 2))).toBe(6)
  })
  it('draws: predicted draw but a side won, one exact number is 2', () => {
    expect(scoreGame(p(3, 3), p(3, 2))).toBe(2)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `scoreGame` not defined.

- [ ] **Step 3: Implement scoreGame**

```ts
interface ScorePair { homeScore: number; awayScore: number }

const outcome = (s: ScorePair): 'home' | 'away' | 'draw' =>
  s.homeScore === s.awayScore ? 'draw' : s.homeScore > s.awayScore ? 'home' : 'away'

export function scoreGame(pred: ScorePair, result: ScorePair): number {
  const exact = pred.homeScore === result.homeScore && pred.awayScore === result.awayScore
  if (exact) return 12

  const winnerRight = outcome(pred) === outcome(result)
  const oneNumberRight =
    pred.homeScore === result.homeScore || pred.awayScore === result.awayScore

  if (winnerRight && oneNumberRight) return 8
  if (winnerRight) return 6
  if (oneNumberRight) return 2
  return 0
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS (all scoring cases).

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.ts tests/scoring.test.ts
git commit -m "feat: scoring engine with tiered points (12/8/6/2/0)"
```

---

## Task 4: Lock logic (pure, TDD)

**Files:**
- Create: `src/lib/lock.ts`
- Test: `tests/lock.test.ts`

Rule: a game's prediction is editable until 23h59 of the day before; it locks at 00:00 of the game day (local time). Artilheiro locks at the lock time of the first oitavas game.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { isGameLocked } from '../src/lib/lock'

describe('isGameLocked', () => {
  const gameDate = '2026-07-04' // game day

  it('open the day before', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-03T23:59:00'))).toBe(false)
  })
  it('locked at midnight of game day', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-04T00:00:00'))).toBe(true)
  })
  it('locked during the game day', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-04T15:00:00'))).toBe(true)
  })
  it('open two days before', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-02T10:00:00'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `isGameLocked` not defined.

- [ ] **Step 3: Implement lock**

```ts
// Locks at local midnight of the game day. gameDate is "YYYY-MM-DD".
export function isGameLocked(gameDate: string, now: Date): boolean {
  const [y, m, d] = gameDate.split('-').map(Number)
  const lockMoment = new Date(y, m - 1, d, 0, 0, 0, 0) // 00:00 of game day, local
  return now.getTime() >= lockMoment.getTime()
}

// Artilheiro locks together with the first oitavas game.
export function isArtilheiroLocked(firstOitavasDate: string, now: Date): boolean {
  return isGameLocked(firstOitavasDate, now)
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/lock.ts tests/lock.test.ts
git commit -m "feat: per-game lock at midnight of game day + artilheiro lock"
```

---

## Task 5: Bracket cascade (pure, TDD)

**Files:**
- Create: `src/lib/bracket.ts`
- Test: `tests/bracket.test.ts`

Given a participant's predictions, fill each later-round game's `homeTeam`/`awayTeam` from the advancing team of its source games. Advancing team = the side with the higher predicted score, or `advanceTeam` when the prediction is a draw.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { advancingTeam, fillBracket } from '../src/lib/bracket'
import type { Game, Prediction } from '../src/lib/types'

describe('advancingTeam', () => {
  const game: Game = {
    id: 'G1', phase: 'oitavas', order: 1, date: '2026-07-04',
    homeTeam: 'Brasil', awayTeam: 'Japão',
    homeSourceGameId: null, awaySourceGameId: null,
  }
  it('higher score advances', () => {
    expect(advancingTeam(game, { participantId: 'x', gameId: 'G1', homeScore: 2, awayScore: 1, advanceTeam: null })).toBe('Brasil')
  })
  it('draw uses advanceTeam', () => {
    expect(advancingTeam(game, { participantId: 'x', gameId: 'G1', homeScore: 1, awayScore: 1, advanceTeam: 'Japão' })).toBe('Japão')
  })
  it('no prediction yet -> null', () => {
    expect(advancingTeam(game, undefined)).toBeNull()
  })
})

describe('fillBracket', () => {
  it('feeds oitavas winners into a quartas game', () => {
    const games: Game[] = [
      { id: 'G1', phase: 'oitavas', order: 1, date: '2026-07-04', homeTeam: 'Brasil', awayTeam: 'Japão', homeSourceGameId: null, awaySourceGameId: null },
      { id: 'G2', phase: 'oitavas', order: 2, date: '2026-07-04', homeTeam: 'França', awayTeam: 'Senegal', homeSourceGameId: null, awaySourceGameId: null },
      { id: 'G9', phase: 'quartas', order: 1, date: '2026-07-09', homeTeam: null, awayTeam: null, homeSourceGameId: 'G1', awaySourceGameId: 'G2' },
    ]
    const preds: Prediction[] = [
      { participantId: 'x', gameId: 'G1', homeScore: 2, awayScore: 0, advanceTeam: null },
      { participantId: 'x', gameId: 'G2', homeScore: 0, awayScore: 1, advanceTeam: null },
    ]
    const filled = fillBracket(games, preds)
    const q = filled.find(g => g.id === 'G9')!
    expect(q.homeTeam).toBe('Brasil')
    expect(q.awayTeam).toBe('Senegal')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `advancingTeam`/`fillBracket` not defined.

- [ ] **Step 3: Implement bracket**

```ts
import type { Game, Prediction } from './types'

export function advancingTeam(game: Game, pred: Prediction | undefined): string | null {
  if (!pred || game.homeTeam == null || game.awayTeam == null) return null
  if (pred.homeScore > pred.awayScore) return game.homeTeam
  if (pred.awayScore > pred.homeScore) return game.awayTeam
  return pred.advanceTeam // draw
}

export function fillBracket(games: Game[], preds: Prediction[]): Game[] {
  const byId = new Map(games.map(g => [g.id, { ...g }]))
  const predByGame = new Map(preds.map(p => [p.gameId, p]))

  // Process in dependency order: oitavas -> quartas -> semis -> terceiro/final
  const order: Game['phase'][] = ['oitavas', 'quartas', 'semis', 'terceiro', 'final']
  for (const phase of order) {
    for (const g of byId.values()) {
      if (g.phase !== phase) continue
      if (g.homeSourceGameId) {
        const src = byId.get(g.homeSourceGameId)!
        g.homeTeam = advancingTeam(src, predByGame.get(src.id))
      }
      if (g.awaySourceGameId) {
        const src = byId.get(g.awaySourceGameId)!
        g.awayTeam = advancingTeam(src, predByGame.get(src.id))
      }
    }
  }
  return Array.from(byId.values())
}
```

Note: the 3rd-place game's sources are the **losers** of the semis. Model that by setting its source game ids to the semis and adding a `loserOf` flag if needed; for the MVP, seed the 3rd-place game with `homeSourceGameId`/`awaySourceGameId` null and let the participant pick both teams from the two semis losers in the UI. (Tracked in Task 9.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/bracket.ts tests/bracket.test.ts
git commit -m "feat: bracket cascade fills later-round teams from picks"
```

---

## Task 6: Prize distribution (pure, TDD)

**Files:**
- Create: `src/lib/prizes.ts`
- Test: `tests/prizes.test.ts`

Bolo = participantes × R$50. Split 50/20/15/10/5% across the top 5 positions. Ties share the sum of the positions they occupy.

- [ ] **Step 1: Write the failing tests**

```ts
import { describe, it, expect } from 'vitest'
import { distributePrizes } from '../src/lib/prizes'

describe('distributePrizes', () => {
  it('no ties: 50/20/15/10/5 of the pot', () => {
    const standings = [
      { id: 'a', points: 90 }, { id: 'b', points: 80 }, { id: 'c', points: 70 },
      { id: 'd', points: 60 }, { id: 'e', points: 50 }, { id: 'f', points: 40 },
    ]
    const pot = 6 * 50 // 300
    const r = distributePrizes(standings, pot)
    expect(r.get('a')).toBeCloseTo(150) // 50%
    expect(r.get('b')).toBeCloseTo(60)  // 20%
    expect(r.get('c')).toBeCloseTo(45)  // 15%
    expect(r.get('d')).toBeCloseTo(30)  // 10%
    expect(r.get('e')).toBeCloseTo(15)  // 5%
    expect(r.get('f') ?? 0).toBe(0)
  })

  it('tie for 1st shares prizes of 1st and 2nd', () => {
    const standings = [
      { id: 'a', points: 76 }, { id: 'b', points: 76 }, { id: 'c', points: 70 },
      { id: 'd', points: 60 }, { id: 'e', points: 50 },
    ]
    const pot = 1000
    const r = distributePrizes(standings, pot)
    // (500 + 200) / 2 = 350 each
    expect(r.get('a')).toBeCloseTo(350)
    expect(r.get('b')).toBeCloseTo(350)
    expect(r.get('c')).toBeCloseTo(150) // 3rd = 15%
    expect(r.get('d')).toBeCloseTo(100) // 4th = 10%
    expect(r.get('e')).toBeCloseTo(50)  // 5th = 5%
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test`
Expected: FAIL — `distributePrizes` not defined.

- [ ] **Step 3: Implement prizes**

```ts
const PCT = [0.5, 0.2, 0.15, 0.1, 0.05] // positions 1..5

export function distributePrizes(
  standings: { id: string; points: number }[],
  pot: number,
): Map<string, number> {
  const sorted = [...standings].sort((a, b) => b.points - a.points)
  const result = new Map<string, number>()

  let i = 0
  while (i < sorted.length && i < 5) {
    // find the tie group [i, j)
    let j = i
    while (j < sorted.length && sorted[j].points === sorted[i].points) j++
    // positions i..min(j,5)-1 contribute their percentages
    let shareSum = 0
    for (let pos = i; pos < Math.min(j, 5); pos++) shareSum += PCT[pos] * pot
    const each = shareSum / (j - i)
    for (let k = i; k < j; k++) result.set(sorted[k].id, each)
    i = j
  }
  return result
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/prizes.ts tests/prizes.test.ts
git commit -m "feat: prize split top-5 with tie sharing"
```

---

## Task 7: Supabase schema + seed data

**Files:**
- Create: `supabase-schema.sql` (run in Supabase SQL editor)
- Create: `src/data/seed-oitavas.ts`
- Create: `src/supabase/client.ts`

- [ ] **Step 1: Write the SQL schema**

In `supabase-schema.sql`:
```sql
create table participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pin text not null unique
);

create table games (
  id text primary key,
  phase text not null,
  ordering int not null,
  game_date date not null,
  home_team text,
  away_team text,
  home_source_game_id text references games(id),
  away_source_game_id text references games(id),
  result_home int,
  result_away int,
  result_advance_team text
);

create table predictions (
  participant_id uuid references participants(id),
  game_id text references games(id),
  home_score int not null,
  away_score int not null,
  advance_team text,
  primary key (participant_id, game_id)
);

create table artilheiro_predictions (
  participant_id uuid primary key references participants(id),
  player text not null
);

create table config (
  id int primary key default 1,
  inscricao numeric not null default 50,
  artilheiro_real text
);
insert into config (id) values (1) on conflict do nothing;
```

- [ ] **Step 2: Run the schema in Supabase**

Create a Supabase project, open SQL editor, paste and run `supabase-schema.sql`.
Expected: tables created, no errors. Copy the project URL + anon key into `.env.local`:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

- [ ] **Step 3: Write the Supabase client**

`src/supabase/client.ts`:
```ts
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
```

- [ ] **Step 4: Write the seed data (the 16 knockout games)**

`src/data/seed-oitavas.ts` — fill `homeTeam`/`awayTeam` and dates for the 8 oitavas from the real round-of-32 results (the user/admin confirms teams and dates at launch). Quartas/semis/3º/final reference earlier games:
```ts
import type { Game } from '../lib/types'

// NOTE: oitavas teams + dates are confirmed by the admin at launch.
// Dates below are placeholders from the official calendar — verify before seeding.
export const SEED_GAMES: Game[] = [
  // Oitavas (G1..G8) — real teams filled in at launch
  { id: 'G1', phase: 'oitavas', order: 1, date: '2026-07-04', homeTeam: 'TIME?', awayTeam: 'TIME?', homeSourceGameId: null, awaySourceGameId: null },
  // ... G2..G8 (same shape)
  // Quartas (G9..G12)
  { id: 'G9',  phase: 'quartas', order: 1, date: '2026-07-09', homeTeam: null, awayTeam: null, homeSourceGameId: 'G1', awaySourceGameId: 'G2' },
  { id: 'G10', phase: 'quartas', order: 2, date: '2026-07-10', homeTeam: null, awayTeam: null, homeSourceGameId: 'G3', awaySourceGameId: 'G4' },
  { id: 'G11', phase: 'quartas', order: 3, date: '2026-07-11', homeTeam: null, awayTeam: null, homeSourceGameId: 'G5', awaySourceGameId: 'G6' },
  { id: 'G12', phase: 'quartas', order: 4, date: '2026-07-11', homeTeam: null, awayTeam: null, homeSourceGameId: 'G7', awaySourceGameId: 'G8' },
  // Semis (G13, G14)
  { id: 'G13', phase: 'semis', order: 1, date: '2026-07-14', homeTeam: null, awayTeam: null, homeSourceGameId: 'G9',  awaySourceGameId: 'G10' },
  { id: 'G14', phase: 'semis', order: 2, date: '2026-07-15', homeTeam: null, awayTeam: null, homeSourceGameId: 'G11', awaySourceGameId: 'G12' },
  // 3º lugar (G15) — teams are the losers of G13/G14, picked in UI (see Task 9)
  { id: 'G15', phase: 'terceiro', order: 1, date: '2026-07-18', homeTeam: null, awayTeam: null, homeSourceGameId: null, awaySourceGameId: null },
  // Final (G16)
  { id: 'G16', phase: 'final', order: 1, date: '2026-07-19', homeTeam: null, awayTeam: null, homeSourceGameId: 'G13', awaySourceGameId: 'G14' },
]
```

- [ ] **Step 5: Commit**

```bash
git add supabase-schema.sql src/data/seed-oitavas.ts src/supabase/client.ts
git commit -m "feat: supabase schema, client, and knockout seed data"
```

---

## Task 8: Data API + PIN auth

**Files:**
- Create: `src/supabase/api.ts`
- Create: `src/auth/session.ts`

- [ ] **Step 1: Write the API helpers**

`src/supabase/api.ts`:
```ts
import { supabase } from './client'
import type { Game, Prediction, Participant } from '../lib/types'

export async function getParticipantByPin(pin: string): Promise<Participant | null> {
  const { data } = await supabase.from('participants').select('*').eq('pin', pin).single()
  return data ?? null
}

export async function getGames(): Promise<Game[]> {
  const { data } = await supabase.from('games').select('*').order('ordering')
  return (data ?? []).map(rowToGame)
}

export async function getPredictions(participantId: string): Promise<Prediction[]> {
  const { data } = await supabase.from('predictions').select('*').eq('participant_id', participantId)
  return (data ?? []).map(rowToPrediction)
}

export async function savePrediction(pred: Prediction): Promise<void> {
  await supabase.from('predictions').upsert({
    participant_id: pred.participantId, game_id: pred.gameId,
    home_score: pred.homeScore, away_score: pred.awayScore, advance_team: pred.advanceTeam,
  })
}
// rowToGame / rowToPrediction: map snake_case DB rows to camelCase types.
```

- [ ] **Step 2: Write the session helper**

`src/auth/session.ts`:
```ts
import type { Participant } from '../lib/types'
import { getParticipantByPin } from '../supabase/api'

const KEY = 'bolao_participant'

export async function login(pin: string): Promise<Participant | null> {
  const p = await getParticipantByPin(pin.trim())
  if (p) localStorage.setItem(KEY, JSON.stringify(p))
  return p
}
export function currentParticipant(): Participant | null {
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : null
}
export function logout(): void { localStorage.removeItem(KEY) }
```

- [ ] **Step 3: Commit**

```bash
git add src/supabase/api.ts src/auth/session.ts
git commit -m "feat: data API helpers and PIN-based session"
```

---

## Task 9: Participant UI (login, predictions, artilheiro)

**Files:**
- Create: `src/components/Login.tsx`, `ScoreStepper.tsx`, `GameCard.tsx`, `MyPredictions.tsx`, `Artilheiro.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: ScoreStepper** — a `−  n  +` control (0..n) for one team's score. Props: `value`, `onChange`, `disabled`.

- [ ] **Step 2: GameCard** — shows `homeTeam` / `awayTeam` (from `fillBracket`), two `ScoreStepper`s, and—only when scores are equal and the game is not locked—an "avança" dropdown listing the two teams. Disabled (cadeado) when `isGameLocked(game.date, new Date())`. Calls `savePrediction` on change. For the 3rd-place game (G15), the two dropdowns list the losers of G13/G14 derived from the participant's semis picks.

- [ ] **Step 3: MyPredictions** — loads games + predictions, runs `fillBracket`, renders a `GameCard` per game grouped by phase.

- [ ] **Step 4: Artilheiro** — text input (or dropdown) saved to `artilheiro_predictions`; disabled when `isArtilheiroLocked(firstOitavasDate, new Date())`.

- [ ] **Step 5: Wire App.tsx** — if no `currentParticipant()`, show `Login`; else show tabs: Meus Palpites, Artilheiro, Classificação.

- [ ] **Step 6: Verify in the browser**

Use the preview workflow: `preview_start`, log in with a seeded test PIN, set a score, reload, confirm it persisted; set a date in the past for one game and confirm the cadeado appears.

- [ ] **Step 7: Commit**

```bash
git add src/components src/App.tsx
git commit -m "feat: participant UI — login, predictions, artilheiro"
```

---

## Task 10: Standings + prize display

**Files:**
- Create: `src/components/Standings.tsx`

- [ ] **Step 1: Compute standings** — for each participant: sum `scoreGame(pred, result)` over games that have a result, plus 20 if their artilheiro matches `config.artilheiro_real`. Sort desc.

- [ ] **Step 2: Compute prizes** — pot = `participants.length * config.inscricao`; call `distributePrizes`. Show position (with shared positions for ties), name, points, and prize in R$ **for everyone**.

- [ ] **Step 3: Verify in the browser** — seed a couple of results, confirm points and the tie-sharing prize math match the spec example (two tied at 1st → R$350 each at pot 1000).

- [ ] **Step 4: Commit**

```bash
git add src/components/Standings.tsx
git commit -m "feat: standings table with auto points and prize split"
```

---

## Task 11: Admin panel

**Files:**
- Create: `src/components/admin/AdminLogin.tsx`, `ManageParticipants.tsx`, `EnterResults.tsx`

- [ ] **Step 1: AdminLogin** — single admin password compared against `VITE_ADMIN_PASSWORD`; on success store an `admin` flag in localStorage.

- [ ] **Step 2: ManageParticipants** — list participants; add a participant (name → auto-generate a short unique PIN, insert row, show the PIN to hand out); delete.

- [ ] **Step 3: EnterResults** — per game: enter real `home`/`away` score and the real advancing team; save to `games.result_*`. Also a field to set `config.artilheiro_real`. Saving triggers a standings refresh (re-read on the Standings tab).

- [ ] **Step 4: Verify in the browser** — log in as admin, add a participant, enter a result, switch to Standings, confirm recalculation.

- [ ] **Step 5: Commit**

```bash
git add src/components/admin
git commit -m "feat: admin panel — participants and results entry"
```

---

## Task 12: Deploy to Vercel

- [ ] **Step 1:** Push the repo to GitHub.
- [ ] **Step 2:** Import the project in Vercel; set env vars `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_ADMIN_PASSWORD`.
- [ ] **Step 3:** Deploy; open the URL; smoke-test login + one prediction + standings.
- [ ] **Step 4: Commit** any config (`vercel.json` if needed):
```bash
git add vercel.json
git commit -m "chore: vercel deploy config"
```

---

## Notes / decisions deferred to launch time

- **Real oitavas teams + dates:** filled into `SEED_GAMES` once the round of 32 finishes (admin confirms). Dates drive the lock, so they must be correct.
- **Row Level Security:** MVP uses the anon key with permissive policies (closed group, low stakes). If desired later, add RLS so a participant can only write their own predictions and only the admin can write results.
- **3rd-place teams:** modeled in the UI from the semis losers (Task 9, Step 2) rather than as bracket sources.
