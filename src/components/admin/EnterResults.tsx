import { useEffect, useState } from 'react'
import { getGames, saveGameResult, getConfig, saveArtilheiroReal } from '../../supabase/api'
import { computeRealBracket } from '../../lib/score-standings'
import type { Game } from '../../lib/types'

interface GameRow extends Game { resultHome: number | null; resultAway: number | null; resultAdvanceTeam: string | null }

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

  async function handleArtilheiro(e: React.FormEvent) {
    e.preventDefault()
    await saveArtilheiroReal(artilheiro.trim())
    setSavedArt(artilheiro.trim())
  }

  if (loading) return <p style={{ padding: 24, color: 'var(--texto-dim)' }}>Carregando...</p>

  const phases = ['rodada32', 'oitavas', 'quartas', 'semis', 'terceiro', 'final'] as const
  const phaseLabel = { rodada32: 'Rodada de 32', oitavas: 'Oitavas', quartas: 'Quartas', semis: 'Semifinais', terceiro: '3º Lugar', final: 'Final' }

  // Times reais cascateados dos resultados já lançados (preenche oitavas em diante).
  const real = computeRealBracket(games)

  return (
    <div className="conteudo">
      {phases.map(phase => {
        const pg = games.filter(g => g.phase === phase)
        if (!pg.length) return null
        return (
          <div key={phase} style={{ marginBottom: 24 }}>
            <h2 className="fase-titulo">{phaseLabel[phase]}</h2>
            {pg.map(g => (
              <ResultRow
                key={g.id}
                game={g}
                homeTeam={real.get(g.id)?.home ?? null}
                awayTeam={real.get(g.id)?.away ?? null}
                onSave={async (h, a, adv) => { await saveGameResult(g.id, h, a, adv); load() }}
              />
            ))}
          </div>
        )
      })}

      <div style={{ marginTop: 8, background: 'var(--card)', border: '1px solid rgba(245,196,0,0.2)', borderRadius: 'var(--raio)', padding: '18px 20px' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: 'var(--amarelo)', marginBottom: 14, letterSpacing: 1 }}>
          Artilheiro da Copa
        </div>
        {savedArt && (
          <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: 'var(--texto-dim)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Atual:</span>
            <span style={{ fontWeight: 800, color: 'var(--neon)' }}>{savedArt}</span>
          </div>
        )}
        <form onSubmit={handleArtilheiro} style={{ display: 'flex', gap: 8 }}>
          <input value={artilheiro} onChange={e => setArtilheiro(e.target.value)} placeholder="Nome do artilheiro" className="input" />
          <button type="submit" className="btn-neon" style={{ whiteSpace: 'nowrap' }}>Salvar</button>
        </form>
      </div>
    </div>
  )
}

function ResultRow({ game, homeTeam: realHome, awayTeam: realAway, onSave }: { game: GameRow; homeTeam: string | null; awayTeam: string | null; onSave: (h: number, a: number, adv: string) => void }) {
  const [home, setHome] = useState(game.resultHome ?? 0)
  const [away, setAway] = useState(game.resultAway ?? 0)
  const [advance, setAdvance] = useState(game.resultAdvanceTeam ?? '')
  const isDraw = home === away
  const homeTeam = realHome ?? 'a definir'
  const awayTeam = realAway ?? 'a definir'
  const definido = !!realHome && !!realAway

  const corTime = definido ? 'var(--branco)' : 'var(--texto-dim)'

  return (
    <div style={{ background: 'var(--card)', borderRadius: 'var(--raio)', border: '1px solid var(--borda)', padding: '12px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', opacity: definido ? 1 : 0.6 }}>
      <span style={{ flex: 1, textAlign: 'right', fontWeight: 700, fontSize: 13, color: corTime, fontStyle: definido ? 'normal' : 'italic' }}>{homeTeam}</span>
      <input type="number" min={0} max={20} value={home} disabled={!definido} onChange={e => setHome(Number(e.target.value))}
        style={{ width: 52, textAlign: 'center', padding: '6px 4px', fontSize: 20, fontWeight: 800, background: 'var(--bg3)', border: '1px solid var(--borda)', borderRadius: 6, color: 'var(--neon)', outline: 'none' }} />
      <span style={{ color: 'var(--texto-dim)', fontWeight: 800 }}>×</span>
      <input type="number" min={0} max={20} value={away} disabled={!definido} onChange={e => setAway(Number(e.target.value))}
        style={{ width: 52, textAlign: 'center', padding: '6px 4px', fontSize: 20, fontWeight: 800, background: 'var(--bg3)', border: '1px solid var(--borda)', borderRadius: 6, color: 'var(--neon)', outline: 'none' }} />
      <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: corTime, fontStyle: definido ? 'normal' : 'italic' }}>{awayTeam}</span>
      {isDraw && definido && (
        <select value={advance} onChange={e => setAdvance(e.target.value)} className="avanca-select" style={{ flex: 'none', width: 'auto' }}>
          <option value="">Quem avançou?</option>
          <option value={homeTeam}>{homeTeam}</option>
          <option value={awayTeam}>{awayTeam}</option>
        </select>
      )}
      <button onClick={() => onSave(home, away, advance)} disabled={!definido} className="btn-neon" style={{ padding: '7px 14px', fontSize: 13 }}>
        Salvar
      </button>
      {game.resultHome != null && (
        <span style={{ fontSize: 12, color: 'var(--neon)', fontWeight: 800 }}>✓ {game.resultHome}×{game.resultAway}</span>
      )}
    </div>
  )
}
