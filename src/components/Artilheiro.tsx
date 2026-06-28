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
    Promise.all([
      getGames(),
      getArtilheiroPrediction(participantId),
    ]).then(([games, pred]) => {
      const firstOitavas = games.filter(g => g.phase === 'oitavas').sort((a, b) => a.order - b.order)[0]
      if (firstOitavas) setLocked(isArtilheiroLocked(firstOitavas.date, new Date()))
      if (pred) { setPlayer(pred); setSaved(pred) }
      setLoading(false)
    })
  }, [participantId])

  async function handleSave() {
    if (!player.trim()) return
    await saveArtilheiroPrediction(participantId, player.trim())
    setSaved(player.trim())
    alert('Artilheiro salvo!')
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24 }}>
      <h3>🥅 Artilheiro da Copa</h3>
      <p style={{ color: '#666', fontSize: 14 }}>
        Acertar o artilheiro vale <strong>20 pontos</strong>. Trava junto com o primeiro jogo das oitavas.
      </p>
      {locked ? (
        <div style={{ padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
          <span>🔒 Travado</span>
          {saved && <p>Seu palpite: <strong>{saved}</strong></p>}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            value={player}
            onChange={e => setPlayer(e.target.value)}
            placeholder="Nome do jogador"
            style={{ flex: 1, padding: '8px 12px', fontSize: 16, borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button onClick={handleSave} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Salvar
          </button>
        </div>
      )}
      {saved && !locked && <p style={{ color: '#16a34a', marginTop: 8 }}>✓ Salvo: {saved}</p>}
    </div>
  )
}
