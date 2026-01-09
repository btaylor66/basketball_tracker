import React, { useEffect, useState, useCallback } from 'react'
import { formatTime } from './utils/calculations'
import { saveCurrentGame, loadCurrentGame, clearCurrentGame } from './utils/storage'
import { VIEWS, TIMEOUTS, parseId } from './utils/constants'
import HomeView from './components/HomeView'
import TeamsView from './components/TeamsView'
import PlayersView from './components/PlayersView'
import CloudSettings from './components/CloudSettings'
import TeamDetail from './components/TeamDetail'
import PlayerDetail from './components/PlayerDetail'
import NewGame from './components/NewGame'
import LiveGame from './components/LiveGame'
import EditGame from './components/EditGame'
import GameDetail from './components/GameDetail'
import useTeamManagement from './hooks/useTeamManagement'
import useGameTimer from './hooks/useGameTimer'
import useLiveGameStats from './hooks/useLiveGameStats'

const defaultStats = () => ({
  points: 0,
  freeThrowsMade: 0,
  freeThrowsMissed: 0,
  twoPointersMade: 0,
  twoPointersMissed: 0,
  threePointersMade: 0,
  threePointersMissed: 0,
  defensiveRebounds: 0,
  offensiveRebounds: 0,
  assists: 0,
  steals: 0,
  blocks: 0,
  turnovers: 0,
  fouls: 0,
  timePlayed: 0
})

export default function App () {
  const [view, setView] = useState(VIEWS.HOME)
  const [currentGame, setCurrentGame] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [viewingGame, setViewingGame] = useState(null)
  const [copiedGameId, setCopiedGameId] = useState(null)
  const [newTeamName, setNewTeamName] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    teamId: '',
    playerId: '',
    opponent: ''
  })

  // Custom hooks
  const {
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
  } = useTeamManagement()

  // Timer tick handler - updates currentGame time
  const handleTimerTick = useCallback((newTime) => {
    setCurrentGame(cg => cg ? { ...cg, stats: { ...cg.stats, timePlayed: newTime } } : cg)
  }, [])

  const {
    isPlaying,
    setIsPlaying,
    timeElapsed,
    setTimeElapsed,
    resetTimer
  } = useGameTimer(handleTimerTick)

  const {
    lastAction,
    transactions,
    updateStat,
    undoLast,
    deleteTransaction,
    resetStats
  } = useLiveGameStats(currentGame, setCurrentGame, timeElapsed)

  // Restore current game on mount
  useEffect(() => {
    const cg = loadCurrentGame()
    if (cg) {
      setCurrentGame(cg)
      setTimeElapsed(cg.stats.timePlayed || 0)
      setView(VIEWS.LIVE_GAME)
    }
  }, [setTimeElapsed])

  // Persist current game
  useEffect(() => {
    if (currentGame) saveCurrentGame(currentGame)
    else clearCurrentGame()
  }, [currentGame])

  // Games
  const startNewGame = (data) => {
    const teamId = parseId(data.teamId)
    const playerId = parseId(data.playerId)
    const team = teams.find(t => t.id === teamId)
    const player = team?.players.find(p => p.id === playerId)
    const g = {
      id: Date.now(),
      teamId,
      playerId,
      teamName: team?.name || '',
      playerName: player?.name || '',
      opponent: data.opponent,
      date: data.date,
      time: data.time,
      stats: defaultStats()
    }
    setCurrentGame(g)
    resetTimer(0)
    resetStats()
    setView(VIEWS.LIVE_GAME)
  }

  const startQuickGame = () => {
    const today = new Date()
    const g = {
      id: Date.now(),
      teamId: null,
      playerId: null,
      teamName: '',
      playerName: 'Quick Game',
      opponent: 'Opponent',
      date: today.toISOString().split('T')[0],
      time: today.toTimeString().slice(0, 5),
      stats: defaultStats(),
      isQuickGame: true
    }
    setCurrentGame(g)
    resetTimer(0)
    resetStats()
    setIsPlaying(true)
    setView(VIEWS.LIVE_GAME)
  }

  const updateGameInfo = (playerName, opponent) => {
    if (!currentGame) return
    setCurrentGame({
      ...currentGame,
      playerName,
      opponent
    })
  }

  const saveFinishedGame = (playerScore, teamScore, opponentPlayerScore, opponentTeamScore, teamId = null, playerId = null) => {
    if (!currentGame) return

    // Determine win/loss/tie result based on team scores
    let result = 'loss'
    if (teamScore > opponentTeamScore) result = 'win'
    else if (teamScore === opponentTeamScore) result = 'tie'

    // For quick games that are being associated, update team/player info
    let finalGame = { ...currentGame }
    if (currentGame.isQuickGame && teamId && playerId) {
      const team = teams.find(t => t.id === teamId)
      const player = team?.players.find(p => p.id === playerId)
      if (team && player) {
        finalGame = {
          ...finalGame,
          teamId,
          playerId,
          teamName: team.name,
          playerName: player.name,
          isQuickGame: false
        }
      }
    }

    // Add all scores and result to game data
    const gameWithScores = {
      ...finalGame,
      playerScore,
      teamScore,
      opponentPlayerScore,
      opponentTeamScore,
      result
    }

    const ng = [...games, gameWithScores]
    forceSaveGames(ng)

    // Navigate based on game type and association
    if (teamId && playerId) {
      const team = teams.find(t => t.id === teamId)
      const player = team?.players.find(p => p.id === playerId)
      if (team && player) {
        setSelectedTeam(team)
        setSelectedPlayer(player)
        setView(VIEWS.PLAYER_DETAIL)
      } else {
        setView(VIEWS.HOME)
      }
    } else if (!currentGame.isQuickGame) {
      const team = teams.find(t => t.id === currentGame.teamId)
      const player = team?.players.find(p => p.id === currentGame.playerId)
      if (team && player) {
        setSelectedTeam(team)
        setSelectedPlayer(player)
        setView(VIEWS.PLAYER_DETAIL)
      } else {
        setView(VIEWS.HOME)
      }
    } else {
      setView(VIEWS.HOME)
    }
    setCurrentGame(null)
    setIsPlaying(false)
    clearCurrentGame()
  }

  const viewGame = (g) => {
    setViewingGame(g)
    setView(VIEWS.GAME_DETAIL)
  }

  const editGame = (g) => {
    setEditingGame(g)
    setView(VIEWS.EDIT_GAME)
  }

  const saveEditedGame = () => {
    const ng = games.map(g => g.id === editingGame.id ? editingGame : g)
    forceSaveGames(ng)
    setEditingGame(null)
    setViewingGame(null)
    setView(selectedPlayer ? VIEWS.PLAYER_DETAIL : VIEWS.TEAM_DETAIL)
  }

  const exportGame = async (g) => {
    const text = formatExportText(g)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedGameId(g.id)
      setTimeout(() => setCopiedGameId(null), TIMEOUTS.COPIED_FEEDBACK)
    } catch (e) {
      alert(text)
    }
  }

  const formatExportText = (game) => {
    const s = game.stats
    const fgMade = s.twoPointersMade + s.threePointersMade
    const fgAtt = s.twoPointersMade + s.twoPointersMissed + s.threePointersMade + s.threePointersMissed
    const fgPct = fgAtt > 0 ? ((fgMade / fgAtt) * 100).toFixed(1) : '0'
    const ftAtt = s.freeThrowsMade + s.freeThrowsMissed
    const ftPct = ftAtt > 0 ? ((s.freeThrowsMade / ftAtt) * 100).toFixed(1) : '0'
    return `🏀 ${game.playerName} - ${game.teamName} vs ${game.opponent}\n📅 ${game.date} ${game.time}\n\nPoints: ${s.points}\nFG: ${fgMade}/${fgAtt} (${fgPct}%)\n2PT: ${s.twoPointersMade}/${s.twoPointersMade + s.twoPointersMissed}\n3PT: ${s.threePointersMade}/${s.threePointersMade + s.threePointersMissed}\nFT: ${s.freeThrowsMade}/${ftAtt} (${ftPct}%)\nRebounds: ${s.defensiveRebounds + s.offensiveRebounds} (${s.offensiveRebounds}O, ${s.defensiveRebounds}D)\nAssists: ${s.assists}\nSteals: ${s.steals}\nBlocks: ${s.blocks}\nTurnovers: ${s.turnovers}\nFouls: ${s.fouls}\nTime: ${formatTime(s.timePlayed)}`
  }

  const exportAll = () => {
    const data = { teams, games, exportDate: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `basketball-stats-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importAll = (file) => {
    const r = new FileReader()
    r.onload = (e) => {
      try {
        const d = JSON.parse(e.target.result)
        if (d.teams && d.games) {
          setTeams(d.teams)
          setGames(d.games)
          setView(VIEWS.HOME)
        } else {
          alert('Invalid backup file')
        }
      } catch (err) {
        alert('Error reading file')
      }
    }
    r.readAsText(file)
  }

  return (
    <>
      {view === VIEWS.HOME && <HomeView currentGame={currentGame} setView={setView} startQuickGame={startQuickGame} />}
      {view === VIEWS.TEAMS && <TeamsView teams={teams} setView={setView} setSelectedTeam={setSelectedTeam} deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} deleteTeam={deleteTeam} newTeamName={newTeamName} setNewTeamName={setNewTeamName} createTeam={createTeam} />}
      {view === VIEWS.PLAYERS && <PlayersView teams={teams} setView={setView} setSelectedTeam={setSelectedTeam} setSelectedPlayer={setSelectedPlayer} />}
      {view === VIEWS.CLOUD_SETTINGS && <CloudSettings setView={setView} exportAll={exportAll} importAll={importAll} />}
      {view === VIEWS.TEAM_DETAIL && <TeamDetail selectedTeam={selectedTeam} setView={setView} setSelectedPlayer={setSelectedPlayer} newPlayerName={newPlayerName} setNewPlayerName={setNewPlayerName} addPlayer={addPlayer} games={games} viewGame={viewGame} exportGame={exportGame} deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} deletePlayer={deletePlayer} deleteGame={deleteGame} />}
      {view === VIEWS.PLAYER_DETAIL && <PlayerDetail selectedPlayer={selectedPlayer} selectedTeam={selectedTeam} setView={setView} games={games} viewGame={viewGame} exportGame={exportGame} deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} setFormData={setFormData} formData={formData} currentGame={currentGame} deleteGame={deleteGame} />}
      {view === VIEWS.GAME_DETAIL && <GameDetail game={viewingGame} setView={setView} setEditingGame={setEditingGame} selectedPlayer={selectedPlayer} teams={teams} createTeam={createTeam} addPlayer={addPlayer} saveEditedGame={saveEditedGame} />}
      {view === VIEWS.NEW_GAME && <NewGame teams={teams} formData={formData} setFormData={setFormData} startNewGame={startNewGame} setView={setView} />}
      {view === VIEWS.LIVE_GAME && <LiveGame currentGame={currentGame} timeElapsed={timeElapsed} setTimeElapsed={setTimeElapsed} setCurrentGame={setCurrentGame} setView={setView} setIsPlaying={setIsPlaying} isPlaying={isPlaying} updateStat={updateStat} undoLast={undoLast} saveFinishedGame={saveFinishedGame} lastAction={lastAction} transactions={transactions} deleteTransaction={deleteTransaction} updateGameInfo={updateGameInfo} teams={teams} />}
      {view === VIEWS.EDIT_GAME && <EditGame editingGame={editingGame} setEditingGame={setEditingGame} saveEditedGame={saveEditedGame} selectedPlayer={selectedPlayer} setView={setView} teams={teams} createTeam={createTeam} addPlayer={addPlayer} />}
    </>
  )
}
