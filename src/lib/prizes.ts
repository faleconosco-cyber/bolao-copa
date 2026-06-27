const PCT = [0.5, 0.2, 0.15, 0.1, 0.05]

export function distributePrizes(
  standings: { id: string; points: number }[],
  pot: number,
): Map<string, number> {
  const sorted = [...standings].sort((a, b) => b.points - a.points)
  const result = new Map<string, number>()

  let i = 0
  while (i < sorted.length && i < 5) {
    let j = i
    while (j < sorted.length && sorted[j].points === sorted[i].points) j++
    let shareSum = 0
    for (let pos = i; pos < Math.min(j, 5); pos++) shareSum += PCT[pos] * pot
    const each = shareSum / (j - i)
    for (let k = i; k < j; k++) result.set(sorted[k].id, each)
    i = j
  }
  return result
}
