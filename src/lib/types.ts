export type Phase = 'rodada32' | 'oitavas' | 'quartas' | 'semis' | 'terceiro' | 'final'

export interface Game {
  id: string
  phase: Phase
  order: number
  date: string          // ISO "2026-07-04"
  homeTeam: string | null
  awayTeam: string | null
  homeSourceGameId: string | null
  awaySourceGameId: string | null
}

export interface Prediction {
  participantId: string
  gameId: string
  homeScore: number
  awayScore: number
  advanceTeam: string | null
}

export interface GameResult {
  gameId: string
  homeScore: number
  awayScore: number
  advanceTeam: string
}

export interface Participant {
  id: string
  name: string
  pin: string
}
