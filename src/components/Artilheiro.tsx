import { useEffect, useState } from 'react'
import { getGames, getArtilheiroPrediction, saveArtilheiroPrediction } from '../supabase/api'
import { selecoesDoTorneio } from '../lib/selecoes'

interface Props { participantId: string }

// Artilheiro trava junto com o primeiro jogo (28/06 às 15:55 de Brasília = 18:55 UTC).
const ARTILHEIRO_DEADLINE = '2026-06-28T18:55:00Z'

export function Artilheiro({ participantId }: Props) {
  const [pais, setPais] = useState('')
  const [saved, setSaved] = useState('')
  const [selecoes, setSelecoes] = useState<string[]>([])
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGames(), getArtilheiroPrediction(participantId)]).then(([games, pred]) => {
      setSelecoes(selecoesDoTorneio(games))
      setLocked(Date.now() >= new Date(ARTILHEIRO_DEADLINE).getTime())
      if (pred) { setPais(pred); setSaved(pred) }
      setLoading(false)
    })
  }, [participantId])

  async function handleSave() {
    if (!pais) return
    await saveArtilheiroPrediction(participantId, pais)
    setSaved(pais)
  }

  if (loading) return <p style={{ padding: 24, color: 'var(--texto-dim)' }}>Carregando...</p>

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="artilheiro-card">
        <div className="artilheiro-titulo">Artilheiro da Copa</div>
        <div className="artilheiro-desc">
          De qual <strong style={{ color: 'var(--branco)' }}>seleção</strong> será o artilheiro da Copa? Acertar vale <strong style={{ color: 'var(--amarelo)' }}>+20 pontos</strong>. Trava junto com o primeiro jogo.
        </div>

        {locked ? (
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '14px 16px' }}>
            <div className="lock-badge" style={{ marginBottom: 8 }}>🔒 Palpite Travado</div>
            {saved && (
              <div style={{ marginTop: 8 }}>
                <span style={{ color: 'var(--texto-dim)', fontSize: 12, fontWeight: 700 }}>SUA SELEÇÃO</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--neon)', marginTop: 4 }}>{saved}</div>
              </div>
            )}
            {!saved && <p style={{ color: 'var(--texto-dim)', fontSize: 13 }}>Nenhum palpite registrado.</p>}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={pais} onChange={e => setPais(e.target.value)} className="input">
                <option value="">— escolha a seleção —</option>
                {selecoes.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={handleSave} disabled={!pais} className="btn-neon" style={{ whiteSpace: 'nowrap' }}>
                Salvar
              </button>
            </div>
            {saved && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: 'var(--neon)', fontSize: 12, fontWeight: 800 }}>✓ SALVO</span>
                <span style={{ color: 'var(--texto)', fontWeight: 700 }}>{saved}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
