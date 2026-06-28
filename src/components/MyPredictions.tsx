import { useEffect, useState } from 'react'
import type { Game, Prediction } from '../lib/types'
import { getGames, getPredictions } from '../supabase/api'
import { fillBracket, advancingTeam } from '../lib/bracket'
import { GameCard } from './GameCard'

interface Props { participantId: string }

const PHASE_LABELS: Record<string, string> = {
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semis: 'Semifinais',
  terceiro: 'Disputa de 3º Lugar',
  final: 'Final',
}

export function MyPredictions({ participantId }: Props) {
  const [games, setGames] = useState<Game[]>([])
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGames(), getPredictions(participantId)]).then(([g, p]) => {
      setGames(g)
      setPredictions(p)
      setLoading(false)
    })
  }, [participantId])

  if (loading) return <p>Carregando...</p>

  const filled = fillBracket(games, predictions)
  const predMap = new Map(predictions.map(p => [p.gameId, p]))

  const g13 = filled.find(g => g.id === 'G13')
  const g14 = filled.find(g => g.id === 'G14')
  const p13 = predMap.get('G13')
  const p14 = predMap.get('G14')
  const winner13 = g13 ? advancingTeam(g13, p13) : null
  const winner14 = g14 ? advancingTeam(g14, p14) : null
  const loser13 = g13 && winner13 ? (winner13 === g13.homeTeam ? g13.awayTeam : g13.homeTeam) : null
  const loser14 = g14 && winner14 ? (winner14 === g14.homeTeam ? g14.awayTeam : g14.homeTeam) : null

  const phases: Game['phase'][] = ['oitavas', 'quartas', 'semis', 'terceiro', 'final']

  return (
    <div>
      {phases.map(phase => {
        const phaseGames = filled.filter(g => g.phase === phase).sort((a, b) => a.order - b.order)
        if (!phaseGames.length) return null
        return (
          <div key={phase} style={{ marginBottom: 24 }}>
            <h3 style={{ borderBottom: '2px solid #eee', paddingBottom: 8 }}>{PHASE_LABELS[phase]}</h3>
            {phaseGames.map(game => (
              <GameCard
                key={game.id}
                game={game}
                prediction={predMap.get(game.id)}
                participantId={participantId}
                semiLosers={game.phase === 'terceiro' ? [loser13, loser14] : undefined}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
