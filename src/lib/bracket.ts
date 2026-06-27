import type { Game, Prediction } from './types'

export function advancingTeam(game: Game, pred: Prediction | undefined): string | null {
  if (!pred || game.homeTeam == null || game.awayTeam == null) return null
  if (pred.homeScore > pred.awayScore) return game.homeTeam
  if (pred.awayScore > pred.homeScore) return game.awayTeam
  return pred.advanceTeam
}

export function fillBracket(games: Game[], preds: Prediction[]): Game[] {
  const byId = new Map(games.map(g => [g.id, { ...g }]))
  const predByGame = new Map(preds.map(p => [p.gameId, p]))

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
