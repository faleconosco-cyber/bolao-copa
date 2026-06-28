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
    load()
  }

  if (loading) return <p>Carregando...</p>

  return (
    <div>
      <h3>👥 Apostadores ({participants.length})</h3>
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Nome do apostador"
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
          Adicionar
        </button>
      </form>
      {lastPin && (
        <div style={{ padding: 12, background: '#dcfce7', borderRadius: 8, marginBottom: 16 }}>
          ✅ PIN gerado: <strong style={{ fontSize: 20, letterSpacing: 4 }}>{lastPin}</strong> — anote e entregue ao apostador!
        </div>
      )}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={th}>Nome</th>
            <th style={th}>PIN</th>
            <th style={th}></th>
          </tr>
        </thead>
        <tbody>
          {participants.map(p => (
            <tr key={p.id}>
              <td style={td}>{p.name}</td>
              <td style={{ ...td, fontFamily: 'monospace', letterSpacing: 2 }}>{p.pin}</td>
              <td style={td}>
                <button onClick={() => handleDelete(p.id, p.name)} style={{ padding: '4px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12 }}>
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left' }
const td: React.CSSProperties = { padding: '8px 12px', borderBottom: '1px solid #eee' }
