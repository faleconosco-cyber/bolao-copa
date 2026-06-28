import { useEffect, useState } from 'react'
import { getAllParticipants, addParticipant, deleteParticipant } from '../../supabase/api'
import type { Participant } from '../../lib/types'

function generatePin(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

function mensagemWhatsapp(nome: string, pin: string): string {
  const site = window.location.origin
  return (
    `Oi, ${nome}! 🏆⚽\n\n` +
    `Você está no nosso Bolão da Copa 2026!\n\n` +
    `Acesse o site: ${site}\n` +
    `Seu PIN de acesso: ${pin}\n\n` +
    `É só entrar com esse código e fazer seus palpites. Boa sorte! 🍀`
  )
}

export function ManageParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [name, setName] = useState('')
  const [lastPin, setLastPin] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])

  async function load() {
    const list = await getAllParticipants()
    setParticipants(list)
    setLoading(false)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    const pin = generatePin()
    await addParticipant(name.trim(), pin)
    setLastPin(pin)
    setName('')
    load()
  }

  async function handleDelete(id: string, pName: string) {
    if (!confirm(`Remover ${pName}?`)) return
    await deleteParticipant(id)
    setLastPin('')
    load()
  }

  async function copiarPin(id: string, pin: string) {
    try {
      await navigator.clipboard.writeText(pin)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      alert(`PIN: ${pin}`)
    }
  }

  function enviarWhatsapp(nome: string, pin: string) {
    const url = `https://wa.me/?text=${encodeURIComponent(mensagemWhatsapp(nome, pin))}`
    window.open(url, '_blank')
  }

  if (loading) return <p style={{ padding: 24, color: 'var(--texto-dim)' }}>Carregando...</p>

  return (
    <div className="conteudo">
      <h2 className="fase-titulo">Apostadores ({participants.length})</h2>

      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do apostador"
          className="input"
        />
        <button type="submit" className="btn-neon" style={{ whiteSpace: 'nowrap' }}>
          + Adicionar
        </button>
      </form>

      {lastPin && (
        <div className="pin-destaque">
          <div>
            <div style={{ fontSize: 11, color: 'var(--neon)', fontWeight: 800, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>PIN gerado — envie pelo WhatsApp abaixo</div>
            <div className="pin-codigo">{lastPin}</div>
          </div>
          <button onClick={() => setLastPin('')} style={{ background: 'none', border: 'none', color: 'var(--texto-dim)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {participants.length === 0 ? (
        <p style={{ color: 'var(--texto-dim)', textAlign: 'center', padding: '32px 0', fontWeight: 600 }}>
          Nenhum apostador ainda. Adicione o primeiro!
        </p>
      ) : (
        <div style={{ background: 'var(--card)', borderRadius: 'var(--raio)', overflow: 'hidden', border: '1px solid var(--borda)' }}>
          <table className="classif-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>PIN</th>
                <th style={{ textAlign: 'right' }}>Enviar</th>
              </tr>
            </thead>
            <tbody>
              {participants.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--branco)' }}>{p.name}</td>
                  <td>
                    <button
                      onClick={() => copiarPin(p.id, p.pin)}
                      title="Clique para copiar"
                      style={{
                        fontFamily: 'monospace', letterSpacing: 3, fontWeight: 800,
                        color: copiedId === p.id ? 'var(--amarelo)' : 'var(--neon)', fontSize: 16,
                        background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      }}
                    >
                      {copiedId === p.id ? '✓ copiado!' : `${p.pin} 📋`}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => enviarWhatsapp(p.name, p.pin)}
                        className="btn-neon"
                        style={{ padding: '5px 12px', fontSize: 12 }}
                        title="Abrir WhatsApp com a mensagem pronta"
                      >
                        WhatsApp
                      </button>
                      <button onClick={() => handleDelete(p.id, p.name)} className="btn-perigo">
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
