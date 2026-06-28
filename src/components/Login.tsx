import { useState } from 'react'
import { login } from '../auth/session'
import type { Participant } from '../lib/types'

interface Props { onLogin: (p: Participant) => void }

export function Login({ onLogin }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const p = await login(pin)
    if (p) {
      onLogin(p)
    } else {
      setError('PIN inválido. Verifique o código recebido.')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4f8' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.1)', width: 320 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 8, fontSize: 24 }}>⚽ Bolão Copa 2026</h1>
        <p style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}>Digite seu código PIN para entrar</p>
        <form onSubmit={handleSubmit}>
          <input
            value={pin}
            onChange={e => setPin(e.target.value.toUpperCase())}
            placeholder="Seu PIN (ex: ABC123)"
            style={{ width: '100%', padding: '10px 12px', fontSize: 18, textAlign: 'center', letterSpacing: 4, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
            autoFocus
          />
          {error && <p style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button
            type="submit"
            disabled={loading || !pin}
            style={{ width: '100%', marginTop: 16, padding: '12px', fontSize: 16, background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
