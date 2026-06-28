import { useEffect, useState } from 'react'
import { getAllParticipants, getGames, getPredictions, getArtilheiroPrediction } from '../../supabase/api'
import { fillBracket } from '../../lib/bracket'
import type { Participant, Game, Prediction } from '../../lib/types'

const PHASE_LABELS: Record<string, string> = {
  rodada32: 'Rodada de 32',
  oitavas: 'Oitavas de Final',
  quartas: 'Quartas de Final',
  semis: 'Semifinais',
  terceiro: 'Disputa de 3º Lugar',
  final: 'Final',
}
const PHASE_ORDER: Game['phase'][] = ['rodada32', 'oitavas', 'quartas', 'semis', 'terceiro', 'final']

export function AdminPredictions() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [games, setGames] = useState<Game[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [preds, setPreds] = useState<Prediction[]>([])
  const [artilheiro, setArtilheiro] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPreds, setLoadingPreds] = useState(false)

  useEffect(() => {
    Promise.all([getAllParticipants(), getGames()]).then(([ps, gs]) => {
      setParticipants(ps)
      setGames(gs)
      setLoading(false)
    })
  }, [])

  async function selecionar(id: string) {
    setSelectedId(id)
    if (!id) return
    setLoadingPreds(true)
    const [p, art] = await Promise.all([getPredictions(id), getArtilheiroPrediction(id)])
    setPreds(p)
    setArtilheiro(art)
    setLoadingPreds(false)
  }

  if (loading) return <p style={{ padding: 24, color: 'var(--texto-dim)' }}>Carregando...</p>

  const filled = fillBracket(games, preds)
  const predMap = new Map(preds.map(p => [p.gameId, p]))
  const selecionado = participants.find(p => p.id === selectedId)

  return (
    <div className="conteudo">
      <h2 className="fase-titulo">Ver palpites dos apostadores</h2>

      <select
        value={selectedId}
        onChange={e => selecionar(e.target.value)}
        className="input"
        style={{ marginBottom: 16 }}
      >
        <option value="">— escolha um apostador —</option>
        {participants.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {!selectedId && (
        <p style={{ color: 'var(--texto-dim)', textAlign: 'center', padding: '24px 0', fontWeight: 600 }}>
          Selecione um apostador acima para ver o que ele preencheu.
        </p>
      )}

      {selectedId && loadingPreds && <p style={{ color: 'var(--texto-dim)' }}>Carregando palpites...</p>}

      {selectedId && !loadingPreds && (
        <div>
          <div style={{ background: 'rgba(0,232,122,0.06)', border: '1px solid rgba(0,232,122,0.25)', borderRadius: 'var(--raio)', padding: '12px 16px', marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: 'var(--texto-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Artilheiro</span>
            <div style={{ fontSize: 18, fontWeight: 800, color: artilheiro ? 'var(--neon)' : 'var(--texto-dim)', marginTop: 2 }}>
              {artilheiro || 'não preencheu'}
            </div>
          </div>

          {PHASE_ORDER.map(phase => {
            const phaseGames = filled.filter(g => g.phase === phase).sort((a, b) => a.order - b.order)
            if (!phaseGames.length) return null
            return (
              <div key={phase} style={{ marginBottom: 18 }}>
                <h3 className="fase-titulo" style={{ marginTop: 8 }}>{PHASE_LABELS[phase]}</h3>
                {phaseGames.map(g => {
                  const pr = predMap.get(g.id)
                  const home = g.homeTeam ?? '?'
                  const away = g.awayTeam ?? '?'
                  const preencheu = !!pr
                  return (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--card)', border: '1px solid var(--borda)', borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ flex: 1, textAlign: 'right', color: 'var(--branco)', fontWeight: 700, fontSize: 13 }}>{home}</span>
                      <span style={{ fontWeight: 800, color: preencheu ? 'var(--neon)' : 'var(--texto-dim)', fontSize: 16, minWidth: 50, textAlign: 'center' }}>
                        {preencheu ? `${pr!.homeScore} × ${pr!.awayScore}` : '— × —'}
                      </span>
                      <span style={{ flex: 1, color: 'var(--branco)', fontWeight: 700, fontSize: 13 }}>{away}</span>
                    </div>
                  )
                })}
              </div>
            )
          })}

          {preds.length === 0 && (
            <p style={{ color: 'var(--texto-dim)', textAlign: 'center', padding: '16px 0', fontWeight: 600 }}>
              {selecionado?.name} ainda não preencheu nenhum palpite.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
