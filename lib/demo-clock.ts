export const demoNow = new Date("2026-11-12T17:00:00.000Z")

const HOUR_MS = 60 * 60 * 1000

export function deadlineFromNow(hoursRemaining: number) {
  const deadline = new Date(demoNow.getTime() + hoursRemaining * HOUR_MS)
  return {
    deadline: deadline.toISOString(),
    hoursRemaining: Math.round((deadline.getTime() - demoNow.getTime()) / HOUR_MS),
  }
}

export function createRng(seed = 20261112) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const demoRandom = createRng()
