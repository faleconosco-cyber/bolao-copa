import { useState } from 'react'
import { loginAdmin } from '../../auth/session'

interface Props { onLogin: () => void }

export function AdminLogin({ onLogin }: Props) {
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (loginAdmin(pwd)) {
      onLogin()
    } else {
      setError('Senha incorreta.')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e293b' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, width: 320 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>🔐 Admin</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder="Senha admin"
            style={{ width: '100%', padding: '10px 12px', fontSize: 16, borderRadius: 8, border: '1px solid #ccc', boxSizing: 'border-box' }}
            autoFocus
          />
          {error && <p style={{ color: 'red', fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button type="submit" style={{ width: '100%', marginTop: 16, padding: 12, background: '#1e293b', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
