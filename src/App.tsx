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
      <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ margin: 0 }}>⚽ Bolão Copa 2026 — Admin</h1>
          <button onClick={() => { logoutAdmin(); setAdminMode(false) }} style={{ padding: '6px 12px', cursor: 'pointer' }}>
            Sair do admin
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {(['apostadores', 'resultados'] as const).map(t => (
            <button key={t} onClick={() => setAdminTab(t)} style={{
              padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: adminTab === t ? '#1e293b' : '#e2e8f0',
              color: adminTab === t ? '#fff' : '#333',
            }}>
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
      <div>
        <Login onLogin={p => setParticipant(p)} />
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button onClick={() => setShowAdminLogin(true)} style={{ fontSize: 12, color: '#999', background: 'none', border: 'none', cursor: 'pointer' }}>
            Acesso admin
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 20 }}>⚽ Bolão Copa 2026</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: '#666' }}>Olá, <strong>{participant.name}</strong></span>
          <button onClick={() => { logout(); setParticipant(null) }} style={{ padding: '4px 10px', cursor: 'pointer', fontSize: 13 }}>
            Sair
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '2px solid #eee', paddingBottom: 8 }}>
        {(['palpites', 'artilheiro', 'classificacao'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: tab === t ? '#16a34a' : '#e2e8f0',
            color: tab === t ? '#fff' : '#333',
            fontWeight: tab === t ? 600 : 400,
          }}>
            {{ palpites: '📝 Meus Palpites', artilheiro: '🥅 Artilheiro', classificacao: '🏆 Classificação' }[t]}
          </button>
        ))}
      </div>

      {tab === 'palpites' && <MyPredictions participantId={participant.id} />}
      {tab === 'artilheiro' && <Artilheiro participantId={participant.id} />}
      {tab === 'classificacao' && <Standings />}
    </div>
  )
}
