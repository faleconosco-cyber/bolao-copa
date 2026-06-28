import { useEffect, useState } from 'react'
import type { Game, Prediction } from '../lib/types'
import { getGames, getPredictions } from '../supabase/api'
import { fillBracket, advancingTeam } from '../lib/bracket'
import { GameCard } from './GameCard'

interface Props { participantId: string }

const PHASE_LABELS: Record<string, string> = {
  rodada32: 'Rodada de 32',
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

  const semi1 = filled.find(g => g.id === 'G101')
  const semi2 = filled.find(g => g.id === 'G102')
  const pSemi1 = predMap.get('G101')
  const pSemi2 = predMap.get('G102')
  const winnerSemi1 = semi1 ? advancingTeam(semi1, pSemi1) : null
  const winnerSemi2 = semi2 ? advancingTeam(semi2, pSemi2) : null
  const loser1 = semi1 && winnerSemi1 ? (winnerSemi1 === semi1.homeTeam ? semi1.awayTeam : semi1.homeTeam) : null
  const loser2 = semi2 && winnerSemi2 ? (winnerSemi2 === semi2.homeTeam ? semi2.awayTeam : semi2.homeTeam) : null

  const phases: Game['phase'][] = ['rodada32', 'oitavas', 'quartas', 'semis', 'terceiro', 'final']

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
                semiLosers={game.phase === 'terceiro' ? [loser1, loser2] : undefined}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}
