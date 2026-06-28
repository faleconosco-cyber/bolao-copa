import type { Game, Prediction } from './types'
import { scoreGame } from './scoring'
import { fillBracket, advancingTeam } from './bracket'

// Pontos por acertar QUEM SE CLASSIFICA, por fase.
export const PONTOS_AVANCO: Record<string, number> = {
  rodada32: 4,
  oitavas: 8,
  quartas: 12,
  semis: 16,
}
// Final e disputa de 3º: 20 por cada posição acertada (campeão, vice, 3º, 4º).
export const PONTOS_POSICAO_FINAL = 20

const SEMI_IDS = ['G101', 'G102'] as const
const TERCEIRO_ID = 'G103'
const FINAL_ID = 'G104'
const PHASE_ORDER = ['rodada32', 'oitavas', 'quartas', 'semis', 'terceiro', 'final'] as const

interface RealInfo { home: string | null; away: string | null; adv: string | null; loser: string | null }

function advLoser(home: string | null, away: string | null, rh: number | null | undefined, ra: number | null | undefined, radv: string | null | undefined): { adv: string | null; loser: string | null } {
  if (home == null || away == null || rh == null || ra == null) return { adv: null, loser: null }
  let adv: string | null
  if (rh > ra) adv = home
  else if (ra > rh) adv = away
  else adv = radv ?? null
  if (adv == null) return { adv: null, loser: null }
  return { adv, loser: adv === home ? away : home }
}

// Chaveamento REAL: quem de fato avançou (e quem perdeu) em cada jogo,
// cascateando os resultados oficiais lançados pela admin.
export function computeRealBracket(games: Game[]): Map<string, RealInfo> {
  const real = new Map<string, RealInfo>()
  for (const phase of PHASE_ORDER) {
    for (const g of games) {
      if (g.phase !== phase) continue
      let home: string | null
      let away: string | null
      if (phase === 'rodada32') {
        home = g.homeTeam; away = g.awayTeam
      } else if (g.id === TERCEIRO_ID) {
        home = real.get(SEMI_IDS[0])?.loser ?? null
        away = real.get(SEMI_IDS[1])?.loser ?? null
      } else {
        home = g.homeSourceGameId ? (real.get(g.homeSourceGameId)?.adv ?? null) : null
        away = g.awaySourceGameId ? (real.get(g.awaySourceGameId)?.adv ?? null) : null
      }
      const { adv, loser } = advLoser(home, away, g.resultHome, g.resultAway, g.resultAdvanceTeam)
      real.set(g.id, { home, away, adv, loser })
    }
  }
  return real
}

// Pontuação total de um apostador conforme as regras do bolão.
export function scoreParticipant(games: Game[], preds: Prediction[]): number {
  const real = computeRealBracket(games)
  const filled = fillBracket(games, preds)
  const filledById = new Map(filled.map(g => [g.id, g]))
  const predByGame = new Map(preds.map(p => [p.gameId, p]))

  function predAdvOf(gameId: string, phase: string): string | null {
    const fg = filledById.get(gameId)
    if (!fg) return null
    const pr = predByGame.get(gameId)
    if (phase === 'rodada32') return advancingTeam(fg, pr)
    return pr?.advanceTeam ?? null
  }
  function loserOfSemi(semiId: string): string | null {
    const fg = filledById.get(semiId)
    if (!fg || fg.homeTeam == null || fg.awayTeam == null) return null
    const adv = advancingTeam(fg, predByGame.get(semiId))
    if (!adv) return null
    return adv === fg.homeTeam ? fg.awayTeam : fg.homeTeam
  }

  let pts = 0
  for (const g of games) {
    const r = real.get(g.id)!

    if (g.phase === 'rodada32') {
      const pr = predByGame.get(g.id)
      if (pr && g.resultHome != null && g.resultAway != null) {
        pts += scoreGame({ homeScore: pr.homeScore, awayScore: pr.awayScore }, { homeScore: g.resultHome, awayScore: g.resultAway })
      }
      const pa = predAdvOf(g.id, 'rodada32')
      if (pa && r.adv && pa === r.adv) pts += PONTOS_AVANCO.rodada32

    } else if (g.id === FINAL_ID) {
      const fg = filledById.get(g.id)
      const pa = predByGame.get(g.id)?.advanceTeam ?? null
      const pOther = pa && fg ? (pa === fg.homeTeam ? fg.awayTeam : fg.homeTeam) : null
      if (pa && r.adv && pa === r.adv) pts += PONTOS_POSICAO_FINAL          // campeão
      if (pOther && r.loser && pOther === r.loser) pts += PONTOS_POSICAO_FINAL // vice

    } else if (g.id === TERCEIRO_ID) {
      const ls1 = loserOfSemi(SEMI_IDS[0])
      const ls2 = loserOfSemi(SEMI_IDS[1])
      const pa = predByGame.get(g.id)?.advanceTeam ?? null
      const pOther = pa ? (pa === ls1 ? ls2 : ls1) : null
      if (pa && r.adv && pa === r.adv) pts += PONTOS_POSICAO_FINAL          // 3º lugar
      if (pOther && r.loser && pOther === r.loser) pts += PONTOS_POSICAO_FINAL // 4º lugar

    } else {
      const pa = predAdvOf(g.id, g.phase)
      if (pa && r.adv && pa === r.adv) pts += (PONTOS_AVANCO[g.phase] ?? 0)
    }
  }
  return pts
}
