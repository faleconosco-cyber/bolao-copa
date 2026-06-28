import { useEffect, useState } from 'react'
import { getAllParticipants, addParticipant, deleteParticipant } from '../../supabase/api'
import type { Participant } from '../../lib/types'

function generatePin(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function ManageParticipants() {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [name, setName] = useState('')
  const [lastPin, setLastPin] = useState('')
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

  if (loading) return <p style={{ padding: 24, color: 'var(--cinza-medio)' }}>Carregando...</p>

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
        <button type="submit" className="btn-verde" style={{ whiteSpace: 'nowrap' }}>
          + Adicionar
        </button>
      </form>

      {lastPin && (
        <div className="pin-destaque">
          <div>
            <div style={{ fontSize: 12, color: 'var(--verde)', fontWeight: 700, marginBottom: 4 }}>PIN GERADO — anote e entregue ao apostador!</div>
            <div className="pin-codigo">{lastPin}</div>
          </div>
          <button onClick={() => setLastPin('')} style={{ background: 'none', border: 'none', color: 'var(--cinza-medio)', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {participants.length === 0 ? (
        <p style={{ color: 'var(--cinza-medio)', textAlign: 'center', padding: '32px 0', fontWeight: 600 }}>
          Nenhum apostador ainda. Adicione o primeiro!
        </p>
      ) : (
        <div style={{ background: 'var(--branco)', borderRadius: 'var(--raio)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <table className="classif-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>PIN</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {participants.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700 }}>{p.name}</td>
                  <td>
                    <span style={{ fontFamily: 'monospace', letterSpacing: 3, fontWeight: 700, color: 'var(--verde)', fontSize: 16 }}>
                      {p.pin}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(p.id, p.name)} className="btn-perigo">
                      Remover
                    </button>
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
