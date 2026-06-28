import type { Game } from './types'

// Lista de seleções (países) do mata-mata, em ordem alfabética.
// Usada no palpite do artilheiro (escolhe-se o país, não o jogador).
export function selecoesDoTorneio(games: Game[]): string[] {
  const set = new Set<string>()
  for (const g of games) {
    if (g.phase !== 'rodada32') continue
    if (g.homeTeam) set.add(g.homeTeam)
    if (g.awayTeam) set.add(g.awayTeam)
  }
  return [...set].sort((a, b) => a.localeCompare(b, 'pt'))
}
