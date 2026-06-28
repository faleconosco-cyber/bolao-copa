import { describe, it, expect } from 'vitest'
import { scoreParticipant } from '../src/lib/score-standings'
import type { Game, Prediction } from '../src/lib/types'

function g(partial: Partial<Game> & { id: string; phase: Game['phase'] }): Game {
  return {
    order: 1, date: '2026-07-01', homeTeam: null, awayTeam: null,
    homeSourceGameId: null, awaySourceGameId: null,
    resultHome: null, resultAway: null, resultAdvanceTeam: null,
    ...partial,
  }
}

describe('scoreParticipant — rodada de 32', () => {
  const games: Game[] = [
    g({ id: 'G73', phase: 'rodada32', homeTeam: 'Brasil', awayTeam: 'Japão', resultHome: 2, resultAway: 1, resultAdvanceTeam: null }),
  ]

  it('placar exato (12) + classificado (4) = 16', () => {
    const preds: Prediction[] = [{ participantId: 'p', gameId: 'G73', homeScore: 2, awayScore: 1, advanceTeam: null }]
    expect(scoreParticipant(games, preds)).toBe(16)
  })

  it('só o vencedor (6) + classificado (4) = 10', () => {
    const preds: Prediction[] = [{ participantId: 'p', gameId: 'G73', homeScore: 3, awayScore: 0, advanceTeam: null }]
    expect(scoreParticipant(games, preds)).toBe(10)
  })

  it('errou tudo = 0', () => {
    const preds: Prediction[] = [{ participantId: 'p', gameId: 'G73', homeScore: 0, awayScore: 3, advanceTeam: 'Japão' }]
    expect(scoreParticipant(games, preds)).toBe(0)
  })
})

describe('scoreParticipant — oitavas (só quem avança)', () => {
  // G89 = vencedor(G73) x vencedor(G74); resultado real: Brasil avança
  const games: Game[] = [
    g({ id: 'G73', phase: 'rodada32', homeTeam: 'Brasil', awayTeam: 'Japão', resultHome: 2, resultAway: 0 }),
    g({ id: 'G74', phase: 'rodada32', homeTeam: 'Alemanha', awayTeam: 'Paraguai', resultHome: 1, resultAway: 0 }),
    g({ id: 'G89', phase: 'oitavas', homeSourceGameId: 'G73', awaySourceGameId: 'G74', resultHome: 3, resultAway: 1 }),
  ]

  it('acertou quem avança nas oitavas = 8 (mais classificados da rodada 32)', () => {
    const preds: Prediction[] = [
      { participantId: 'p', gameId: 'G73', homeScore: 2, awayScore: 0, advanceTeam: null }, // Brasil (placar exato 12 + 4)
      { participantId: 'p', gameId: 'G74', homeScore: 1, awayScore: 0, advanceTeam: null }, // Alemanha (12 + 4)
      { participantId: 'p', gameId: 'G89', homeScore: 0, awayScore: 0, advanceTeam: 'Brasil' }, // acertou (+8)
    ]
    // 16 (G73) + 16 (G74) + 8 (G89) = 40
    expect(scoreParticipant(games, preds)).toBe(40)
  })

  it('errou quem avança nas oitavas = 0 naquele jogo', () => {
    const preds: Prediction[] = [
      { participantId: 'p', gameId: 'G73', homeScore: 2, awayScore: 0, advanceTeam: null },
      { participantId: 'p', gameId: 'G74', homeScore: 1, awayScore: 0, advanceTeam: null },
      { participantId: 'p', gameId: 'G89', homeScore: 0, awayScore: 0, advanceTeam: 'Alemanha' }, // errou
    ]
    expect(scoreParticipant(games, preds)).toBe(32)
  })
})
