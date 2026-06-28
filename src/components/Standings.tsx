import { useEffect, useState } from 'react'
import { getAllParticipants, getAllPredictions, getGames, getAllArtilheiroPredictions, getConfig } from '../supabase/api'
import { scoreGame } from '../lib/scoring'
import { distributePrizes } from '../lib/prizes'
import type { Game, Prediction, Participant } from '../lib/types'

interface GameRow extends Game {
  resultHome: number | null
  resultAway: number | null
  resultAdvanceTeam: string | null
}

interface Standing {
  participant: Participant
  points: number
  prize: number
  position: string
}

export function Standings() {
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [pot, setPot] = useState(0)

  useEffect(() => { load() }, [])

  async function load() {
    const [participants, allPreds, games, artPreds, config] = await Promise.all([
      getAllParticipants(),
      getAllPredictions(),
      getGames(),
      getAllArtilheiroPredictions(),
      getConfig(),
    ])

    const gamesWithResults = games as unknown as GameRow[]

    const totalPot = participants.length * config.inscricao
    setPot(totalPot)

    const scored = participants.map(p => {
      const myPreds = allPreds.filter((pred: Prediction) => pred.participantId === p.id)
      const predMap = new Map(myPreds.map((pred: Prediction) => [pred.gameId, pred]))

      let points = 0
      for (const g of gamesWithResults) {
        if (g.resultHome == null || g.resultAway == null) continue
        const pred = predMap.get(g.id)
        if (!pred) continue
        points += scoreGame(
          { homeScore: pred.homeScore, awayScore: pred.awayScore },
          { homeScore: g.resultHome, awayScore: g.resultAway },
        )
      }
      const myArt = artPreds[p.id]
      if (myArt && config.artilheiroReal && myArt.toLowerCase() === config.artilheiroReal.toLowerCase()) {
        points += 20
      }
      return { participant: p, points }
    })

    const sorted = [...scored].sort((a, b) => b.points - a.points)
    const prizeMap = distributePrizes(sorted.map(s => ({ id: s.participant.id, points: s.points })), totalPot)

    const result: Standing[] = []
    let i = 0
    while (i < sorted.length) {
      let j = i
      while (j < sorted.length && sorted[j].points === sorted[i].points) j++
      const pos = j - i > 1 ? `${i + 1}º*` : `${i + 1}º`
      for (let k = i; k < j; k++) {
        result.push({
          participant: sorted[k].participant,
          points: sorted[k].points,
          prize: prizeMap.get(sorted[k].participant.id) ?? 0,
          position: pos,
        })
      }
      i = j
    }
    setStandings(result)
    setLoading(false)
  }

  if (loading) return <p>Carregando classificação...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>🏆 Classificação</h3>
        <span style={{ fontSize: 14, color: '#666' }}>Bolo: <strong>R$ {pot.toFixed(2)}</strong></span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={th}>Pos.</th>
            <th style={th}>Nome</th>
            <th style={th}>Pontos</th>
            <th style={th}>Prêmio</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => (
            <tr key={s.participant.id} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
              <td style={td}>{s.position}</td>
              <td style={td}>{s.participant.name}</td>
              <td style={{ ...td, textAlign: 'center', fontWeight: 'bold' }}>{s.points}</td>
              <td style={{ ...td, textAlign: 'right', color: s.prize > 0 ? '#16a34a' : '#999' }}>
                {s.prize > 0 ? `R$ ${s.prize.toFixed(2)}` : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ fontSize: 12, color: '#999', marginTop: 8 }}>* posição compartilhada — prêmio dividido</p>
    </div>
  )
}

const th: React.CSSProperties = { padding: '10px 12px', textAlign: 'left', fontWeight: 600 }
const td: React.CSSProperties = { padding: '10px 12px', borderBottom: '1px solid #eee' }
