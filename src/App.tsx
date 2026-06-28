import { useState } from 'react'
import type { Participant } from './lib/types'
import { currentParticipant, logout, isAdmin, logoutAdmin } from './auth/session'
import { Login } from './components/Login'
import { MyPredictions } from './components/MyPredictions'
import { Artilheiro } from './components/Artilheiro'
import { Standings } from './components/Standings'
import { AdminLogin } from './components/admin/AdminLogin'
import { ManageParticipants } from './components/admin/ManageParticipants'
import { EnterResults } from './components/admin/EnterResults'

type Tab = 'palpites' | 'artilheiro' | 'classificacao'
type AdminTab = 'apostadores' | 'resultados'

export default function App() {
  const [participant, setParticipant] = useState<Participant | null>(currentParticipant())
  const [adminMode, setAdminMode] = useState(isAdmin())
  const [tab, setTab] = useState<Tab>('palpites')
  const [adminTab, setAdminTab] = useState<AdminTab>('apostadores')
  const [showAdminLogin, setShowAdminLogin] = useState(false)

  if (adminMode) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--cinza-claro)' }}>
        <div className="admin-header">
          <div className="bola" style={{ width: 48, height: 48 }} />
          <h1 className="admin-titulo">Bolão Copa 2026 — Admin</h1>
          <button onClick={() => { logoutAdmin(); setAdminMode(false) }} className="btn-sair">
            Sair do admin
          </button>
        </div>
        <div className="admin-tabs">
          {(['apostadores', 'resultados'] as const).map(t => (
            <button key={t} onClick={() => setAdminTab(t)} className={`admin-tab${adminTab === t ? ' ativa' : ''}`}>
              {{ apostadores: '👥 Apostadores', resultados: '⚽ Resultados' }[t]}
            </button>
          ))}
        </div>
        {adminTab === 'apostadores' ? <ManageParticipants /> : <EnterResults />}
      </div>
    )
  }

  if (showAdminLogin) {
    return <AdminLogin onLogin={() => { setAdminMode(true); setShowAdminLogin(false) }} />
  }

  if (!participant) {
    return (
      <Login
        onLogin={p => setParticipant(p)}
        onAdminClick={() => setShowAdminLogin(true)}
      />
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--cinza-claro)' }}>
      <div className="header">
        <div className="bola" style={{ width: 48, height: 48 }} />
        <div style={{ flex: 1 }}>
          <div className="header-titulo">Bolão Copa 2026</div>
          <div className="header-sub">🇧🇷 Fase final — Rumo ao Hexa!</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="header-user">Olá, <strong>{participant.name}</strong></div>
          <button onClick={() => { logout(); setParticipant(null) }} className="btn-sair" style={{ marginTop: 4 }}>
            Sair
          </button>
        </div>
      </div>

      <div className="tabs">
        {(['palpites', 'artilheiro', 'classificacao'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`tab${tab === t ? ' ativa' : ''}`}>
            {{ palpites: '📝 Meus Palpites', artilheiro: '🥅 Artilheiro', classificacao: '🏆 Classificação' }[t]}
          </button>
        ))}
      </div>

      <div className="conteudo">
        {tab === 'palpites' && <MyPredictions participantId={participant.id} />}
        {tab === 'artilheiro' && <Artilheiro participantId={participant.id} />}
        {tab === 'classificacao' && <Standings />}
      </div>
    </div>
  )
}
