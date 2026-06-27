import { describe, it, expect } from 'vitest'
import { advancingTeam, fillBracket } from '../src/lib/bracket'
import type { Game, Prediction } from '../src/lib/types'

describe('advancingTeam', () => {
  const game: Game = {
    id: 'G1', phase: 'oitavas', order: 1, date: '2026-07-04',
    homeTeam: 'Brasil', awayTeam: 'Japão',
    homeSourceGameId: null, awaySourceGameId: null,
  }
  it('higher home score advances home team', () => {
    expect(advancingTeam(game, { participantId: 'x', gameId: 'G1', homeScore: 2, awayScore: 1, advanceTeam: null })).toBe('Brasil')
  })
  it('higher away score advances away team', () => {
    expect(advancingTeam(game, { participantId: 'x', gameId: 'G1', homeScore: 0, awayScore: 2, advanceTeam: null })).toBe('Japão')
  })
  it('draw uses advanceTeam', () => {
    expect(advancingTeam(game, { participantId: 'x', gameId: 'G1', homeScore: 1, awayScore: 1, advanceTeam: 'Japão' })).toBe('Japão')
  })
  it('no prediction yet returns null', () => {
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

  it('unfilled source produces null team in downstream game', () => {
    const games: Game[] = [
      { id: 'G1', phase: 'oitavas', order: 1, date: '2026-07-04', homeTeam: 'Brasil', awayTeam: 'Japão', homeSourceGameId: null, awaySourceGameId: null },
      { id: 'G2', phase: 'oitavas', order: 2, date: '2026-07-04', homeTeam: 'França', awayTeam: 'Senegal', homeSourceGameId: null, awaySourceGameId: null },
      { id: 'G9', phase: 'quartas', order: 1, date: '2026-07-09', homeTeam: null, awayTeam: null, homeSourceGameId: 'G1', awaySourceGameId: 'G2' },
    ]
    const filled = fillBracket(games, []) // no predictions
    const q = filled.find(g => g.id === 'G9')!
    expect(q.homeTeam).toBeNull()
    expect(q.awayTeam).toBeNull()
  })
})
