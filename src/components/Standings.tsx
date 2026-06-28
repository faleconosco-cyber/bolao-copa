import { useEffect, useState } from 'react'
import { getAllParticipants, getAllPredictions, getGames, getAllArtilheiroPredictions, getConfig } from '../supabase/api'
import { scoreGame } from '../lib/scoring'
import { distributePrizes } from '../lib/prizes'
import type { Game, Prediction, Participant } from '../lib/types'

interface GameRow extends Game { resultHome: number | null; resultAway: number | null; resultAdvanceTeam: string | null }
interface Standing { participant: Participant; points: number; prize: number; position: string }

export function Standings() {
  const [standings, setStandings] = useState<Standing[]>([])
  const [loading, setLoading] = useState(true)
  const [pot, setPot] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => { load() }, [])

  async function load() {
    const [participants, allPreds, games, artPreds, config] = await Promise.all([
      getAllParticipants(), getAllPredictions(), getGames(), getAllArtilheiroPredictions(), getConfig(),
    ])
    const gamesWithResults = games as unknown as GameRow[]
    const totalPot = participants.length * config.inscricao
    setPot(totalPot)
    setCount(participants.length)

    const scored = participants.map(p => {
      const predMap = new Map(allPreds.filter((pr: Prediction) => pr.participantId === p.id).map((pr: Prediction) => [pr.gameId, pr]))
      let points = 0
      for (const g of gamesWithResults) {
        if (g.resultHome == null || g.resultAway == null) continue
        const pred = predMap.get(g.id)
        if (!pred) continue
        points += scoreGame({ homeScore: pred.homeScore, awayScore: pred.awayScore }, { homeScore: g.resultHome, awayScore: g.resultAway })
      }
      const myArt = artPreds[p.id]
      if (myArt && config.artilheiroReal && myArt.toLowerCase() === config.artilheiroReal.toLowerCase()) points += 20
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
        result.push({ participant: sorted[k].participant, points: sorted[k].points, prize: prizeMap.get(sorted[k].participant.id) ?? 0, position: pos })
      }
      i = j
    }
    setStandings(result)
    setLoading(false)
  }

  if (loading) return <p style={{ padding: 24, color: 'var(--texto-dim)' }}>Carregando classificação...</p>

  return (
    <div>
      <div className="bolo-card">
        <div>
          <div className="bolo-label">Bolo total</div>
          <div className="bolo-valor">R$ {pot.toFixed(2)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="bolo-label">Apostadores</div>
          <div className="bolo-valor" style={{ color: 'var(--texto)' }}>{count}</div>
        </div>
      </div>

      <div style={{ background: 'var(--card)', borderRadius: 'var(--raio)', overflow: 'hidden', border: '1px solid var(--borda)' }}>
        <table className="classif-table">
          <thead>
            <tr>
              <th style={{ width: 48 }}>#</th>
              <th>Nome</th>
              <th style={{ textAlign: 'center' }}>Pts</th>
              <th style={{ textAlign: 'right' }}>Prêmio</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.participant.id}>
                <td><span className={`pos-num${i < 5 ? ' top' : ''}`}>{s.position}</span></td>
                <td style={{ fontWeight: 700, color: 'var(--branco)' }}>{s.participant.name}</td>
                <td style={{ textAlign: 'center', fontWeight: 800, color: 'var(--neon)', fontSize: 16 }}>{s.points}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, color: s.prize > 0 ? 'var(--amarelo)' : 'var(--texto-dim)', fontSize: s.prize > 0 ? 14 : 12 }}>
                  {s.prize > 0 ? `R$ ${s.prize.toFixed(2)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: 'var(--texto-dim)', marginTop: 8, fontWeight: 600 }}>* posição compartilhada — prêmio dividido</p>
    </div>
  )
}
