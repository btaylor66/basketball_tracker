import { describe, test, expect, beforeEach } from 'vitest'
import { saveData, loadData, saveCurrentGame, loadCurrentGame, clearCurrentGame } from './storage'

// Polyfill localStorage if missing
if (typeof global.localStorage === 'undefined') {
  let store = {}
  global.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v) },
    removeItem: (k) => { delete store[k] },
    clear: () => { store = {} }
  }
}

describe('storage helpers', () => {
  beforeEach(() => { localStorage.clear() })

  test('save and load teams/games', () => {
    saveData('teams', [{ id: 1, name: 'T' }])
    saveData('games', [{ id: 2, teamId: 1 }])
    const d = loadData()
    expect(d.teams.length).toBe(1)
    expect(d.games.length).toBe(1)
  })

  test('current game save/load/clear', () => {
    const g = { id: 5, stats: { points: 10 } }
    saveCurrentGame(g)
    const cg = loadCurrentGame()
    expect(cg.id).toBe(5)
    clearCurrentGame()
    expect(loadCurrentGame()).toBeNull()
  })
})
