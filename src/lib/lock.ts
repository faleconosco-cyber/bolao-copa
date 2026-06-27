export function isGameLocked(gameDate: string, now: Date): boolean {
  const [y, m, d] = gameDate.split('-').map(Number)
  const lockMoment = new Date(y, m - 1, d, 0, 0, 0, 0)
  return now.getTime() >= lockMoment.getTime()
}

export function isArtilheiroLocked(firstOitavasDate: string, now: Date): boolean {
  return isGameLocked(firstOitavasDate, now)
}
