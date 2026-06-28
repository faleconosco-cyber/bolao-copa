import { useState } from 'react'
import type { Game, Prediction } from '../lib/types'
import { isGameLocked } from '../lib/lock'
import { savePrediction } from '../supabase/api'
import { ScoreStepper } from './ScoreStepper'

interface Props {
  game: Game
  prediction: Prediction | undefined
  participantId: string
  semiLosers?: [string | null, string | null]
}

// Travas personalizadas por jogo (instante exato em UTC).
// G73 (África do Sul x Canadá): trava 28/06 às 15:55 de Brasília (= 18:55 UTC).
const TRAVAS_ESPECIAIS: Record<string, string> = {
  G73: '2026-06-28T18:55:00Z',
}

export function GameCard({ game, prediction, participantId, semiLosers }: Props) {
  const travaEspecial = TRAVAS_ESPECIAIS[game.id]
  const locked = travaEspecial
    ? Date.now() >= new Date(travaEspecial).getTime()
    : isGameLocked(game.date, new Date())

  // Na rodada de 32 o apostador dá o placar. A partir das oitavas, só escolhe quem avança.
  const soAvanca = game.phase !== 'rodada32'

  const [homeScore, setHomeScore] = useState(prediction?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(prediction?.awayScore ?? 0)
  const [advanceTeam, setAdvanceTeam] = useState<string>(prediction?.advanceTeam ?? '')

  const isDraw = homeScore === awayScore
  const homeTeam = game.phase === 'terceiro' ? (semiLosers?.[0] ?? '?') : (game.homeTeam ?? '?')
  const awayTeam = game.phase === 'terceiro' ? (semiLosers?.[1] ?? '?') : (game.awayTeam ?? '?')

  async function save(h: number, a: number, adv: string) {
    await savePrediction({ participantId, gameId: game.id, homeScore: h, awayScore: a, advanceTeam: adv || null })
  }

  function handleHomeScore(v: number) { setHomeScore(v); save(v, awayScore, advanceTeam) }
  function handleAwayScore(v: number) { setAwayScore(v); save(homeScore, v, advanceTeam) }
  function handleAdvance(team: string) { setAdvanceTeam(team); save(homeScore, awayScore, team) }

  return (
    <div className={`jogo-card${locked ? ' travado' : ''}`}>
      {soAvanca ? (
        /* ── Oitavas em diante: escolhe só quem avança ── */
        <>
          <div className="jogo-confronto">
            <div className="jogo-lado"><div className="jogo-time-nome">{homeTeam}</div></div>
            <span className="vs">VS</span>
            <div className="jogo-lado"><div className="jogo-time-nome">{awayTeam}</div></div>
          </div>
          <div className="avanca-linha">
            <span>Quem avança?</span>
            <select className="avanca-select" value={advanceTeam} onChange={e => handleAdvance(e.target.value)} disabled={locked}>
              <option value="">— escolha —</option>
              <option value={homeTeam}>{homeTeam}</option>
              <option value={awayTeam}>{awayTeam}</option>
            </select>
          </div>
        </>
      ) : (
        /* ── Rodada de 32: dá o placar ── */
        <>
          <div className="jogo-confronto">
            <div className="jogo-lado">
              <div className="jogo-time-nome">{homeTeam}</div>
              <ScoreStepper value={homeScore} onChange={handleHomeScore} disabled={locked} />
            </div>
            <span className="vs">VS</span>
            <div className="jogo-lado">
              <div className="jogo-time-nome">{awayTeam}</div>
              <ScoreStepper value={awayScore} onChange={handleAwayScore} disabled={locked} />
            </div>
          </div>
          {isDraw && !locked && (
            <div className="avanca-linha">
              <span>Quem avança?</span>
              <select className="avanca-select" value={advanceTeam} onChange={e => handleAdvance(e.target.value)}>
                <option value="">— escolha —</option>
                <option value={homeTeam}>{homeTeam}</option>
                <option value={awayTeam}>{awayTeam}</option>
              </select>
            </div>
          )}
        </>
      )}

      <div className="jogo-data" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {locked
          ? <span className="lock-badge">🔒 Travado</span>
          : <span style={{ color: 'var(--neon)', fontSize: 10, fontWeight: 700 }}>✏ Editável até véspera</span>
        }
        <span>{game.date.split('-').reverse().join('/')}</span>
      </div>
    </div>
  )
}
