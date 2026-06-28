import { useState } from 'react'
import { login } from '../auth/session'
import type { Participant } from '../lib/types'
import { BolaIcon } from './BolaIcon'

interface Props {
  onLogin: (p: Participant) => void
  onAdminClick: () => void
}

export function Login({ onLogin, onAdminClick }: Props) {
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
    <div className="login-bg">
      <div>
        <div className="login-card">
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <BolaIcon size={80} />
          </div>
          <h1 className="login-titulo">Bolão Copa 2026</h1>
          <p className="login-sub">Digite seu código PIN para entrar</p>
          <form onSubmit={handleSubmit}>
            <input
              value={pin}
              onChange={e => setPin(e.target.value.toUpperCase())}
              placeholder="ABC123"
              className="login-input"
              autoFocus
              maxLength={8}
            />
            {error && <p className="login-erro">{error}</p>}
            <button type="submit" disabled={loading || !pin} className="login-btn">
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={onAdminClick} className="login-admin">
            Acesso admin
          </button>
        </div>
      </div>
    </div>
  )
}
