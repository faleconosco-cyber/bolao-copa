import { describe, it, expect } from 'vitest'
import { scoreGame } from '../src/lib/scoring'

const p = (h: number, a: number) => ({ homeScore: h, awayScore: a })

describe('scoreGame', () => {
  it('12 for exact score', () => {
    expect(scoreGame(p(3, 2), p(3, 2))).toBe(12)
  })
  it('8 for correct winner + one exact team score (home)', () => {
    expect(scoreGame(p(3, 2), p(3, 1))).toBe(8)
  })
  it('8 for correct winner + one exact team score (away)', () => {
    expect(scoreGame(p(3, 2), p(4, 2))).toBe(8)
  })
  it('6 for correct winner only', () => {
    expect(scoreGame(p(3, 2), p(4, 1))).toBe(6)
  })
  it('2 for wrong winner but one exact team score', () => {
    expect(scoreGame(p(3, 2), p(1, 2))).toBe(2)
  })
  it('0 for everything wrong', () => {
    expect(scoreGame(p(3, 2), p(1, 3))).toBe(0)
  })
  it('draws: exact draw is 12', () => {
    expect(scoreGame(p(3, 3), p(3, 3))).toBe(12)
  })
  it('draws: predicted draw, drawn result, no exact number is 6', () => {
    expect(scoreGame(p(3, 3), p(2, 2))).toBe(6)
  })
  it('draws: predicted draw but a side won, one exact number is 2', () => {
    expect(scoreGame(p(3, 3), p(3, 2))).toBe(2)
  })
})
