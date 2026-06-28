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

export function GameCard({ game, prediction, participantId, semiLosers }: Props) {
  const locked = isGameLocked(game.date, new Date())
  const [homeScore, setHomeScore] = useState(prediction?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(prediction?.awayScore ?? 0)
  const [advanceTeam, setAdvanceTeam] = useState<string>(prediction?.advanceTeam ?? '')

  const isDraw = homeScore === awayScore
  const homeTeam = game.phase === 'terceiro' ? (semiLosers?.[0] ?? '?') : (game.homeTeam ?? '?')
  const awayTeam = game.phase === 'terceiro' ? (semiLosers?.[1] ?? '?') : (game.awayTeam ?? '?')

  async function save(h: number, a: number, adv: string) {
    const pred: Prediction = {
      participantId,
      gameId: game.id,
      homeScore: h,
      awayScore: a,
      advanceTeam: adv || null,
    }
    await savePrediction(pred)
  }

  function handleHomeScore(v: number) {
    setHomeScore(v)
    save(v, awayScore, advanceTeam)
  }

  function handleAwayScore(v: number) {
    setAwayScore(v)
    save(homeScore, v, advanceTeam)
  }

  function handleAdvance(team: string) {
    setAdvanceTeam(team)
    save(homeScore, awayScore, team)
  }

  const cardStyle: React.CSSProperties = {
    border: '1px solid #ddd',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    background: locked ? '#f9f9f9' : '#fff',
    opacity: locked ? 0.8 : 1,
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ flex: 1, textAlign: 'right', fontWeight: 500 }}>{homeTeam}</span>
        <ScoreStepper value={homeScore} onChange={handleHomeScore} disabled={locked} />
        <span style={{ fontSize: 18 }}>×</span>
        <ScoreStepper value={awayScore} onChange={handleAwayScore} disabled={locked} />
        <span style={{ flex: 1, fontWeight: 500 }}>{awayTeam}</span>
        {locked && <span title="Palpite travado">🔒</span>}
      </div>
      {isDraw && !locked && (
        <div style={{ marginTop: 12, textAlign: 'center' }}>
          <label style={{ marginRight: 8, fontSize: 14 }}>Quem avança?</label>
          <select
            value={advanceTeam}
            onChange={e => handleAdvance(e.target.value)}
            style={{ padding: '4px 8px' }}
          >
            <option value="">— escolha —</option>
            <option value={homeTeam}>{homeTeam}</option>
            <option value={awayTeam}>{awayTeam}</option>
          </select>
        </div>
      )}
      <div style={{ fontSize: 12, color: '#999', marginTop: 8, textAlign: 'right' }}>
        {game.date} {locked ? '🔒 Travado' : '✏️ Editável até véspera'}
      </div>
    </div>
  )
}
