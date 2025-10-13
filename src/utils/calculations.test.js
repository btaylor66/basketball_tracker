import { describe, test, expect } from 'vitest'
import { formatTime, calculatePlayerStats } from './calculations'

describe('calculations', () => {
  test('formatTime formats seconds correctly', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(65)).toBe('1:05')
    expect(formatTime(125)).toBe('2:05')
  })

  test('calculatePlayerStats returns null when no playerId', () => {
    expect(calculatePlayerStats([], null)).toBeNull()
  })

  test('calculatePlayerStats computes aggregates', () => {
    const games = [
      { playerId: 1, stats: { points: 10, twoPointersMade: 4, twoPointersMissed: 2, threePointersMade: 0, threePointersMissed: 0, freeThrowsMade: 2, freeThrowsMissed: 0, defensiveRebounds: 3, offensiveRebounds: 1, steals: 1, blocks: 0 } },
      { playerId: 1, stats: { points: 8, twoPointersMade: 3, twoPointersMissed: 1, threePointersMade: 0, threePointersMissed: 1, freeThrowsMade: 0, freeThrowsMissed: 1, defensiveRebounds: 2, offensiveRebounds: 0, steals: 0, blocks: 1 } }
    ]
    const stats = calculatePlayerStats(games, 1)
    expect(stats.gamesPlayed).toBe(2)
    expect(parseFloat(stats.ppg)).toBeCloseTo(9)
    expect(stats.totalPoints).toBe(18)
  })
})
