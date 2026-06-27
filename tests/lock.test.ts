import { describe, it, expect } from 'vitest'
import { isGameLocked, isArtilheiroLocked } from '../src/lib/lock'

describe('isGameLocked', () => {
  const gameDate = '2026-07-04'

  it('open the day before at 23:59', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-03T23:59:00'))).toBe(false)
  })
  it('locked at midnight of game day', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-04T00:00:00'))).toBe(true)
  })
  it('locked during the game day', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-04T15:00:00'))).toBe(true)
  })
  it('open two days before', () => {
    expect(isGameLocked(gameDate, new Date('2026-07-02T10:00:00'))).toBe(false)
  })
})

describe('isArtilheiroLocked', () => {
  it('delegates to isGameLocked with firstOitavasDate', () => {
    expect(isArtilheiroLocked('2026-07-04', new Date('2026-07-03T23:59:00'))).toBe(false)
    expect(isArtilheiroLocked('2026-07-04', new Date('2026-07-04T00:00:00'))).toBe(true)
  })
})
