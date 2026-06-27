import type { Game } from '../lib/types'

// Teams for oitavas (G1-G8) will be filled by the admin once round of 32 is complete.
// Dates follow the official Copa 2026 knockout calendar.
export const SEED_GAMES: Game[] = [
  // Oitavas de final (Round of 16) — July 4-7, 2026
  { id: 'G1', phase: 'oitavas', order: 1, date: '2026-07-04', homeTeam: 'Time A', awayTeam: 'Time B', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G2', phase: 'oitavas', order: 2, date: '2026-07-04', homeTeam: 'Time C', awayTeam: 'Time D', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G3', phase: 'oitavas', order: 3, date: '2026-07-05', homeTeam: 'Time E', awayTeam: 'Time F', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G4', phase: 'oitavas', order: 4, date: '2026-07-05', homeTeam: 'Time G', awayTeam: 'Time H', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G5', phase: 'oitavas', order: 5, date: '2026-07-06', homeTeam: 'Time I', awayTeam: 'Time J', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G6', phase: 'oitavas', order: 6, date: '2026-07-06', homeTeam: 'Time K', awayTeam: 'Time L', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G7', phase: 'oitavas', order: 7, date: '2026-07-07', homeTeam: 'Time M', awayTeam: 'Time N', homeSourceGameId: null, awaySourceGameId: null },
  { id: 'G8', phase: 'oitavas', order: 8, date: '2026-07-07', homeTeam: 'Time O', awayTeam: 'Time P', homeSourceGameId: null, awaySourceGameId: null },

  // Quartas de final — July 9-12, 2026
  { id: 'G9',  phase: 'quartas', order: 1, date: '2026-07-09', homeTeam: null, awayTeam: null, homeSourceGameId: 'G1', awaySourceGameId: 'G2' },
  { id: 'G10', phase: 'quartas', order: 2, date: '2026-07-10', homeTeam: null, awayTeam: null, homeSourceGameId: 'G3', awaySourceGameId: 'G4' },
  { id: 'G11', phase: 'quartas', order: 3, date: '2026-07-11', homeTeam: null, awayTeam: null, homeSourceGameId: 'G5', awaySourceGameId: 'G6' },
  { id: 'G12', phase: 'quartas', order: 4, date: '2026-07-12', homeTeam: null, awayTeam: null, homeSourceGameId: 'G7', awaySourceGameId: 'G8' },

  // Semifinais — July 14-15, 2026
  { id: 'G13', phase: 'semis', order: 1, date: '2026-07-14', homeTeam: null, awayTeam: null, homeSourceGameId: 'G9',  awaySourceGameId: 'G10' },
  { id: 'G14', phase: 'semis', order: 2, date: '2026-07-15', homeTeam: null, awayTeam: null, homeSourceGameId: 'G11', awaySourceGameId: 'G12' },

  // Disputa de 3º lugar — July 18, 2026
  // Teams = losers of G13 and G14; handled in UI (participant picks from semis losers)
  { id: 'G15', phase: 'terceiro', order: 1, date: '2026-07-18', homeTeam: null, awayTeam: null, homeSourceGameId: null, awaySourceGameId: null },

  // Final — July 19, 2026
  { id: 'G16', phase: 'final', order: 1, date: '2026-07-19', homeTeam: null, awayTeam: null, homeSourceGameId: 'G13', awaySourceGameId: 'G14' },
]
