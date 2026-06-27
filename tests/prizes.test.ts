import { describe, it, expect } from 'vitest'
import { distributePrizes } from '../src/lib/prizes'

describe('distributePrizes', () => {
  it('no ties: 50/20/15/10/5 of the pot', () => {
    const standings = [
      { id: 'a', points: 90 }, { id: 'b', points: 80 }, { id: 'c', points: 70 },
      { id: 'd', points: 60 }, { id: 'e', points: 50 }, { id: 'f', points: 40 },
    ]
    const pot = 300 // 6 * 50
    const r = distributePrizes(standings, pot)
    expect(r.get('a')).toBeCloseTo(150)
    expect(r.get('b')).toBeCloseTo(60)
    expect(r.get('c')).toBeCloseTo(45)
    expect(r.get('d')).toBeCloseTo(30)
    expect(r.get('e')).toBeCloseTo(15)
    expect(r.get('f') ?? 0).toBe(0)
  })

  it('tie for 1st shares prizes of 1st and 2nd', () => {
    const standings = [
      { id: 'a', points: 76 }, { id: 'b', points: 76 }, { id: 'c', points: 70 },
      { id: 'd', points: 60 }, { id: 'e', points: 50 },
    ]
    const pot = 1000
    const r = distributePrizes(standings, pot)
    expect(r.get('a')).toBeCloseTo(350) // (500+200)/2
    expect(r.get('b')).toBeCloseTo(350)
    expect(r.get('c')).toBeCloseTo(150)
    expect(r.get('d')).toBeCloseTo(100)
    expect(r.get('e')).toBeCloseTo(50)
  })

  it('4-way tie for 1st through 4th', () => {
    const standings = [
      { id: 'a', points: 100 }, { id: 'b', points: 100 },
      { id: 'c', points: 100 }, { id: 'd', points: 100 },
      { id: 'e', points: 50 },
    ]
    const pot = 1000
    const r = distributePrizes(standings, pot)
    // (500+200+150+100)/4 = 237.5 each
    expect(r.get('a')).toBeCloseTo(237.5)
    expect(r.get('b')).toBeCloseTo(237.5)
    expect(r.get('c')).toBeCloseTo(237.5)
    expect(r.get('d')).toBeCloseTo(237.5)
    expect(r.get('e')).toBeCloseTo(50)
  })
})
