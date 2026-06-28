import { useEffect, useState } from 'react'
import { getAllParticipants, getGames, getPredictions, getArtilheiroPrediction, getAllPredictions } from '../../supabase/api'
import { fillBracket, advancingTeam } from '../../lib/bracket'
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
  const [comPalpite, setComPalpite] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [loadingPreds, setLoadingPreds] = useState(false)

  useEffect(() => {
    Promise.all([getAllParticipants(), getGames(), getAllPredictions()]).then(([ps, gs, allPreds]) => {
      setParticipants(ps)
      setGames(gs)
      setComPalpite(new Set(allPreds.map(p => p.participantId)))
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

  // Times do 3º lugar = perdedores das semis, conforme o palpite da pessoa.
  function loserOfSemi(semiId: string): string | null {
    const fg = filled.find(g => g.id === semiId)
    if (!fg || fg.homeTeam == null || fg.awayTeam == null) return null
    const adv = advancingTeam(fg, predMap.get(semiId))
    if (!adv) return null
    return adv === fg.homeTeam ? fg.awayTeam : fg.homeTeam
  }
  const terceiroTeams: [string | null, string | null] = [loserOfSemi('G101'), loserOfSemi('G102')]

  const faltam = participants.filter(p => !comPalpite.has(p.id))

  return (
    <div className="conteudo">
      <h2 className="fase-titulo">Ver palpites dos apostadores</h2>

      {participants.length > 0 && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--borda)', borderRadius: 'var(--raio)', padding: '14px 16px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: 'var(--texto-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Já começaram a preencher</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--neon)', lineHeight: 1.1, marginTop: 2 }}>
            {comPalpite.size} <span style={{ color: 'var(--texto-dim)', fontSize: 18 }}>de {participants.length}</span>
          </div>
          {faltam.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'var(--amarelo)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Ainda não preencheram:</span>
              <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {faltam.map(p => (
                  <span key={p.id} style={{ background: 'var(--bg3)', color: 'var(--texto)', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 6 }}>{p.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
                  const home = (g.phase === 'terceiro' ? terceiroTeams[0] : g.homeTeam) ?? '?'
                  const away = (g.phase === 'terceiro' ? terceiroTeams[1] : g.awayTeam) ?? '?'
                  const preencheu = !!pr

                  // Rodada de 32: mostra o placar. Demais fases: mostra quem a pessoa escolheu pra avançar.
                  let meio: string
                  let cor = 'var(--texto-dim)'
                  if (g.phase === 'rodada32') {
                    meio = preencheu ? `${pr!.homeScore} × ${pr!.awayScore}` : '— × —'
                    if (preencheu) cor = 'var(--neon)'
                  } else {
                    const escolha = pr?.advanceTeam
                    meio = escolha ? `✓ ${escolha}` : 'não escolheu'
                    if (escolha) cor = 'var(--neon)'
                  }

                  return (
                    <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--card)', border: '1px solid var(--borda)', borderRadius: 8, marginBottom: 6 }}>
                      <span style={{ flex: 1, textAlign: 'right', color: 'var(--branco)', fontWeight: 700, fontSize: 13 }}>{home}</span>
                      <span style={{ fontWeight: 800, color: cor, fontSize: g.phase === 'rodada32' ? 16 : 12, minWidth: 80, textAlign: 'center' }}>
                        {meio}
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
