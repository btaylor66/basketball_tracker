/**
 * @vitest-environment jsdom
 */
import { describe, test, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useTeamManagement from './useTeamManagement'

// Mock storage functions
vi.mock('../utils/storage', () => ({
  loadData: vi.fn(() => ({ teams: [], games: [] })),
  saveData: vi.fn()
}))

describe('useTeamManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('initializes with empty teams and games', () => {
    const { result } = renderHook(() => useTeamManagement())
    expect(result.current.teams).toEqual([])
    expect(result.current.games).toEqual([])
  })

  test('createTeam adds a new team', () => {
    const { result } = renderHook(() => useTeamManagement())

    act(() => {
      result.current.createTeam('Lakers')
    })

    expect(result.current.teams).toHaveLength(1)
    expect(result.current.teams[0].name).toBe('Lakers')
    expect(result.current.teams[0].players).toEqual([])
  })

  test('addPlayer adds player to correct team', () => {
    const { result } = renderHook(() => useTeamManagement())

    let teamId
    act(() => {
      teamId = result.current.createTeam('Lakers')
    })

    act(() => {
      result.current.addPlayer(teamId, 'LeBron')
    })

    const team = result.current.teams.find(t => t.id === teamId)
    expect(team.players).toHaveLength(1)
    expect(team.players[0].name).toBe('LeBron')
  })

  test('deleteTeam removes team and associated games', () => {
    const { result } = renderHook(() => useTeamManagement())

    let teamId
    act(() => {
      teamId = result.current.createTeam('Lakers')
    })

    // Add a game for this team
    act(() => {
      result.current.setGames([{ id: 1, teamId, playerId: 123 }])
    })

    act(() => {
      result.current.deleteTeam(teamId)
    })

    expect(result.current.teams).toHaveLength(0)
    expect(result.current.games).toHaveLength(0)
  })

  test('deletePlayer removes player and associated games', () => {
    const { result } = renderHook(() => useTeamManagement())

    let teamId, playerId
    act(() => {
      teamId = result.current.createTeam('Lakers')
    })

    act(() => {
      playerId = result.current.addPlayer(teamId, 'LeBron')
    })

    // Add a game for this player
    act(() => {
      result.current.setGames([{ id: 1, teamId, playerId }])
    })

    act(() => {
      result.current.deletePlayer(teamId, playerId)
    })

    const team = result.current.teams.find(t => t.id === teamId)
    expect(team.players).toHaveLength(0)
    expect(result.current.games).toHaveLength(0)
  })

  test('deleteGame removes specific game', () => {
    const { result } = renderHook(() => useTeamManagement())

    act(() => {
      result.current.setGames([
        { id: 1, teamId: 1, playerId: 1 },
        { id: 2, teamId: 1, playerId: 1 }
      ])
    })

    act(() => {
      result.current.deleteGame(1)
    })

    expect(result.current.games).toHaveLength(1)
    expect(result.current.games[0].id).toBe(2)
  })
})
