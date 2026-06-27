interface ScorePair { homeScore: number; awayScore: number }

const outcome = (s: ScorePair): 'home' | 'away' | 'draw' =>
  s.homeScore === s.awayScore ? 'draw' : s.homeScore > s.awayScore ? 'home' : 'away'

export function scoreGame(pred: ScorePair, result: ScorePair): number {
  const exact = pred.homeScore === result.homeScore && pred.awayScore === result.awayScore
  if (exact) return 12

  const winnerRight = outcome(pred) === outcome(result)
  const oneNumberRight =
    pred.homeScore === result.homeScore || pred.awayScore === result.awayScore

  if (winnerRight && oneNumberRight) return 8
  if (winnerRight) return 6
  if (oneNumberRight) return 2
  return 0
}
