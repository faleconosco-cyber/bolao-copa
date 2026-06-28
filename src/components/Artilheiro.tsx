import { useEffect, useState } from 'react'
import { getGames, getArtilheiroPrediction, saveArtilheiroPrediction } from '../supabase/api'
import { isArtilheiroLocked } from '../lib/lock'

interface Props { participantId: string }

export function Artilheiro({ participantId }: Props) {
  const [player, setPlayer] = useState('')
  const [saved, setSaved] = useState('')
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getGames(), getArtilheiroPrediction(participantId)]).then(([games, pred]) => {
      const firstGame = [...games].sort((a, b) => a.date.localeCompare(b.date))[0]
      if (firstGame) setLocked(isArtilheiroLocked(firstGame.date, new Date()))
      if (pred) { setPlayer(pred); setSaved(pred) }
      setLoading(false)
    })
  }, [participantId])

  async function handleSave() {
    if (!player.trim()) return
    await saveArtilheiroPrediction(participantId, player.trim())
    setSaved(player.trim())
  }

  if (loading) return <p style={{ padding: 24, color: 'var(--texto-dim)' }}>Carregando...</p>

  return (
    <div style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="artilheiro-card">
        <div className="artilheiro-titulo">Artilheiro da Copa</div>
        <div className="artilheiro-desc">
          Acertar o artilheiro vale <strong style={{ color: 'var(--amarelo)' }}>+20 pontos</strong>. Trava junto com o primeiro jogo do mata-mata.
        </div>

        {locked ? (
          <div style={{ background: 'var(--bg3)', borderRadius: 8, padding: '14px 16px' }}>
            <div className="lock-badge" style={{ marginBottom: 8 }}>🔒 Palpite Travado</div>
            {saved && (
              <div style={{ marginTop: 8 }}>
                <span style={{ color: 'var(--texto-dim)', fontSize: 12, fontWeight: 700 }}>SEU PALPITE</span>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--neon)', marginTop: 4 }}>{saved}</div>
              </div>
            )}
            {!saved && <p style={{ color: 'var(--texto-dim)', fontSize: 13 }}>Nenhum palpite registrado.</p>}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={player}
                onChange={e => setPlayer(e.target.value)}
                placeholder="Nome do jogador"
                className="input"
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <button onClick={handleSave} disabled={!player.trim()} className="btn-neon" style={{ whiteSpace: 'nowrap' }}>
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
