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
    <div className="login-bg" style={{ background: 'linear-gradient(160deg, #001a5c 0%, #002776 60%, #003399 100%)' }}>
      <div>
        <div className="login-card">
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 8 }}>🔐</div>
          <h1 className="login-titulo" style={{ color: 'var(--azul)' }}>Admin</h1>
          <p className="login-sub">Acesso restrito — apenas Cláudia</p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              placeholder="Senha"
              className="login-input"
              style={{ letterSpacing: 4 }}
              autoFocus
            />
            {error && <p className="login-erro">{error}</p>}
            <button
              type="submit"
              className="login-btn"
              style={{ background: 'var(--azul)' }}
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
