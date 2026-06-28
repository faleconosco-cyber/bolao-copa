import { supabase } from './client'
import type { Game, Prediction, Participant } from '../lib/types'

function rowToGame(row: Record<string, unknown>): Game {
  return {
    id: row.id as string,
    phase: row.phase as Game['phase'],
    order: row.ordering as number,
    date: row.game_date as string,
    homeTeam: row.home_team as string | null,
    awayTeam: row.away_team as string | null,
    homeSourceGameId: row.home_source_game_id as string | null,
    awaySourceGameId: row.away_source_game_id as string | null,
    resultHome: (row.result_home ?? null) as number | null,
    resultAway: (row.result_away ?? null) as number | null,
    resultAdvanceTeam: (row.result_advance_team ?? null) as string | null,
  }
}

function rowToPrediction(row: Record<string, unknown>): Prediction {
  return {
    participantId: row.participant_id as string,
    gameId: row.game_id as string,
    homeScore: row.home_score as number,
    awayScore: row.away_score as number,
    advanceTeam: row.advance_team as string | null,
  }
}

export async function getParticipantByPin(pin: string): Promise<Participant | null> {
  const { data } = await supabase.from('participants').select('*').eq('pin', pin).single()
  if (!data) return null
  return { id: data.id, name: data.name, pin: data.pin }
}

export async function getGames(): Promise<Game[]> {
  const { data } = await supabase.from('games').select('*').order('ordering')
  return (data ?? []).map(rowToGame)
}

export async function getPredictions(participantId: string): Promise<Prediction[]> {
  const { data } = await supabase.from('predictions').select('*').eq('participant_id', participantId)
  return (data ?? []).map(rowToPrediction)
}

export async function savePrediction(pred: Prediction): Promise<void> {
  await supabase.from('predictions').upsert({
    participant_id: pred.participantId,
    game_id: pred.gameId,
    home_score: pred.homeScore,
    away_score: pred.awayScore,
    advance_team: pred.advanceTeam,
  })
}

export async function getArtilheiroPrediction(participantId: string): Promise<string | null> {
  const { data } = await supabase.from('artilheiro_predictions').select('player').eq('participant_id', participantId).single()
  return data?.player ?? null
}

export async function saveArtilheiroPrediction(participantId: string, player: string): Promise<void> {
  await supabase.from('artilheiro_predictions').upsert({ participant_id: participantId, player })
}

export async function getAllParticipants(): Promise<Participant[]> {
  const { data } = await supabase.from('participants').select('*').order('name')
  return (data ?? []).map(p => ({ id: p.id, name: p.name, pin: p.pin }))
}

export async function getAllPredictions(): Promise<Prediction[]> {
  const { data } = await supabase.from('predictions').select('*')
  return (data ?? []).map(rowToPrediction)
}

export async function getAllArtilheiroPredictions(): Promise<Record<string, string>> {
  const { data } = await supabase.from('artilheiro_predictions').select('*')
  const result: Record<string, string> = {}
  for (const row of data ?? []) result[row.participant_id] = row.player
  return result
}

export async function getConfig(): Promise<{ inscricao: number; artilheiroReal: string | null }> {
  const { data } = await supabase.from('config').select('*').single()
  return { inscricao: Number(data?.inscricao ?? 50), artilheiroReal: data?.artilheiro_real ?? null }
}

export async function saveGameResult(gameId: string, homeScore: number, awayScore: number, advanceTeam: string): Promise<void> {
  await supabase.from('games').update({
    result_home: homeScore,
    result_away: awayScore,
    result_advance_team: advanceTeam,
  }).eq('id', gameId)
}

export async function saveArtilheiroReal(player: string): Promise<void> {
  await supabase.from('config').update({ artilheiro_real: player }).eq('id', 1)
}

export async function addParticipant(name: string, pin: string): Promise<Participant> {
  const { data } = await supabase.from('participants').insert({ name, pin }).select().single()
  return { id: data.id, name: data.name, pin: data.pin }
}

export async function deleteParticipant(id: string): Promise<void> {
  await supabase.from('participants').delete().eq('id', id)
}
