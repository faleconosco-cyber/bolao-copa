import type { Participant } from '../lib/types'
import { getParticipantByPin } from '../supabase/api'

const PARTICIPANT_KEY = 'bolao_participant'
const ADMIN_KEY = 'bolao_admin'

export async function login(pin: string): Promise<Participant | null> {
  const p = await getParticipantByPin(pin.trim().toUpperCase())
  if (p) localStorage.setItem(PARTICIPANT_KEY, JSON.stringify(p))
  return p
}

export function currentParticipant(): Participant | null {
  const raw = localStorage.getItem(PARTICIPANT_KEY)
  return raw ? JSON.parse(raw) : null
}

export function logout(): void {
  localStorage.removeItem(PARTICIPANT_KEY)
}

export function loginAdmin(password: string): boolean {
  const ok = password === import.meta.env.VITE_ADMIN_PASSWORD
  if (ok) localStorage.setItem(ADMIN_KEY, '1')
  return ok
}

export function isAdmin(): boolean {
  return localStorage.getItem(ADMIN_KEY) === '1'
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_KEY)
}
