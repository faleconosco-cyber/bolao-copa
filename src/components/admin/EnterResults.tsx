import { useEffect, useState } from 'react'
import { getGames, saveGameResult, getConfig, saveArtilheiroReal } from '../../supabase/api'
import type { Game } from '../../lib/types'

interface GameRow extends Game {
  resultHome: number | null
  resultAway: number | null
  resultAdvanceTeam: string | null
}

export function EnterResults() {
  const [games, setGames] = useState<GameRow[]>([])
  const [artilheiro, setArtilheiro] = useState('')
  const [savedArt, setSavedArt] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const [g, config] = await Promise.all([getGames(), getConfig()])
    setGames(g as unknown as GameRow[])
    setSavedArt(config.artilheiroReal ?? '')
    setArtilheiro(config.artilheiroReal ?? '')
    setLoading(false)
  }

  async function handleResult(game: GameRow, home: number, away: number, advance: string) {
    await saveGameResult(game.id, home, away, advance)
    load()
  }

  async function handleArtilheiro(e: React.FormEvent) {
    e.preventDefault()
    await saveArtilheiroReal(artilheiro.trim())
    setSavedArt(artilheiro.trim())
    alert('Artilheiro salvo!')
  }

  if (loading) return <p>Carregando...</p>

  const phases = ['oitavas', 'quartas', 'semis', 'terceiro', 'final'] as const

  return (
    <div>
      <h3>⚽ Lançar Resultados</h3>
      {phases.map(phase => {
        const phaseGames = games.filter(g => g.phase === phase)
        if (!phaseGames.length) return null
        return (
          <div key={phase} style={{ marginBottom: 24 }}>
            <h4 style={{ borderBottom: '1px solid #eee', paddingBottom: 4 }}>
              {{ oitavas: 'Oitavas', quartas: 'Quartas', semis: 'Semifinais', terceiro: '3º Lugar', final: 'Final' }[phase]}
            </h4>
            {phaseGames.map(g => (
              <ResultRow key={g.id} game={g} onSave={handleResult} />
            ))}
          </div>
        )
      })}

      <div style={{ marginTop: 32, padding: 16, background: '#fef9c3', borderRadius: 8 }}>
        <h4>🥅 Artilheiro da Copa</h4>
        {savedArt && <p>Atual: <strong>{savedArt}</strong></p>}
        <form onSubmit={handleArtilheiro} style={{ display: 'flex', gap: 8 }}>
          <input
            value={artilheiro}
            onChange={e => setArtilheiro(e.target.value)}
            placeholder="Nome do artilheiro"
            style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '8px 16px', background: '#ca8a04', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            Salvar
          </button>
        </form>
      </div>
    </div>
  )
}

function ResultRow({ game, onSave }: { game: GameRow; onSave: (g: GameRow, h: number, a: number, adv: string) => void }) {
  const [home, setHome] = useState(game.resultHome ?? 0)
  const [away, setAway] = useState(game.resultAway ?? 0)
  const [advance, setAdvance] = useState(game.resultAdvanceTeam ?? '')
  const isDraw = home === away
  const homeTeam = game.homeTeam ?? 'Time A'
  const awayTeam = game.awayTeam ?? 'Time B'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, flexWrap: 'wrap', padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
      <span style={{ flex: 1, textAlign: 'right', fontSize: 13 }}>{homeTeam}</span>
      <input type="number" min={0} max={20} value={home} onChange={e => setHome(Number(e.target.value))} style={{ width: 48, textAlign: 'center', padding: 4, fontSize: 16 }} />
      <span>×</span>
      <input type="number" min={0} max={20} value={away} onChange={e => setAway(Number(e.target.value))} style={{ width: 48, textAlign: 'center', padding: 4, fontSize: 16 }} />
      <span style={{ flex: 1, fontSize: 13 }}>{awayTeam}</span>
      {isDraw && (
        <select value={advance} onChange={e => setAdvance(e.target.value)} style={{ padding: '4px 8px' }}>
          <option value="">Quem avançou?</option>
          <option value={homeTeam}>{homeTeam}</option>
          <option value={awayTeam}>{awayTeam}</option>
        </select>
      )}
      <button onClick={() => onSave(game, home, away, advance)} style={{ padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
        Salvar
      </button>
      {game.resultHome != null && (
        <span style={{ fontSize: 12, color: '#16a34a' }}>✓ {game.resultHome}×{game.resultAway}</span>
      )}
    </div>
  )
}
