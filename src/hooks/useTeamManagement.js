import { useState, useEffect } from 'react'
import { loadData, saveData } from '../utils/storage'

export default function useTeamManagement () {
  const [teams, setTeams] = useState([])
  const [games, setGames] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Load initial data
  useEffect(() => {
    const d = loadData()
    setTeams(d.teams)
    setGames(d.games)
  }, [])

  // Persist teams/games changes
  useEffect(() => saveData('teams', teams), [teams])
  useEffect(() => saveData('games', games), [games])

  // Force save games (used when updating games outside of state flow)
  const forceSaveGames = (g) => {
    setGames(g)
    saveData('games', g)
  }

  const createTeam = (name) => {
    const t = { id: Date.now(), name, players: [] }
    const nt = [...teams, t]
    setTeams(nt)
    saveData('teams', nt)
    return t.id
  }

  const addPlayer = (teamId, playerName) => {
    const playerId = Date.now()
    const nt = teams.map(t =>
      t.id === teamId
        ? { ...t, players: [...t.players, { id: playerId, name: playerName }] }
        : t
    )
    setTeams(nt)
    saveData('teams', nt)
    // Update selectedTeam if it matches
    const updatedTeam = nt.find(t => t.id === teamId)
    if (selectedTeam?.id === teamId && updatedTeam) {
      setSelectedTeam(updatedTeam)
    }
    return playerId
  }

  const deleteTeam = (teamId) => {
    const nt = teams.filter(t => t.id !== teamId)
    const ng = games.filter(g => g.teamId !== teamId)
    setTeams(nt)
    forceSaveGames(ng)
    setDeleteConfirmId(null)
  }

  const deletePlayer = (teamId, playerId) => {
    const nt = teams.map(t =>
      t.id === teamId
        ? { ...t, players: t.players.filter(p => p.id !== playerId) }
        : t
    )
    const ng = games.filter(g => g.playerId !== playerId)
    setTeams(nt)
    forceSaveGames(ng)
    setDeleteConfirmId(null)
    // Update selectedTeam if it matches
    const updatedTeam = nt.find(t => t.id === teamId)
    if (selectedTeam?.id === teamId && updatedTeam) {
      setSelectedTeam(updatedTeam)
    }
  }

  const deleteGame = (gameId) => {
    const ng = games.filter(g => g.id !== gameId)
    forceSaveGames(ng)
    setDeleteConfirmId(null)
  }

  return {
    teams,
    setTeams,
    games,
    setGames,
    forceSaveGames,
    selectedTeam,
    setSelectedTeam,
    selectedPlayer,
    setSelectedPlayer,
    deleteConfirmId,
    setDeleteConfirmId,
    createTeam,
    addPlayer,
    deleteTeam,
    deletePlayer,
    deleteGame
  }
}
