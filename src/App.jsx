import React, { useEffect, useRef, useState } from 'react'
import { formatTime } from './utils/calculations'
import { loadData, saveData, saveCurrentGame, loadCurrentGame, clearCurrentGame } from './utils/storage'
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
import { calculatePlayerStats } from './utils/calculations'

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
  const [view, setView] = useState('home')
  const [teams, setTeams] = useState([])
  const [games, setGames] = useState([])
  const [currentGame, setCurrentGame] = useState(null)
  const [editingGame, setEditingGame] = useState(null)
  const [viewingGame, setViewingGame] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [copiedGameId, setCopiedGameId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [lastAction, setLastAction] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [newTeamName, setNewTeamName] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [formData, setFormData] = useState({ date: new Date().toISOString().split('T')[0], time: new Date().toTimeString().slice(0,5), teamId: '', playerId: '', opponent: '' })

  const timerRef = useRef(null)

  // load data
  useEffect(() => {
    const d = loadData()
    setTeams(d.teams)
    setGames(d.games)
    const cg = loadCurrentGame()
    if (cg) {
      setCurrentGame(cg)
      setTimeElapsed(cg.stats.timePlayed || 0)
      setView('liveGame')
    }
  }, [])

  // persist teams/games
  useEffect(() => saveData('teams', teams), [teams])
  useEffect(() => saveData('games', games), [games])

  useEffect(() => {
    if (currentGame) saveCurrentGame(currentGame)
    else clearCurrentGame()
  }, [currentGame])

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeElapsed(t => {
          const nt = t + 1
          setCurrentGame(cg => cg ? { ...cg, stats: { ...cg.stats, timePlayed: nt } } : cg)
          return nt
        })
      }, 1000)
    } else {
      if (timerRef.current) clearInterval(timerRef.current)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [isPlaying])

  // helpers
  const forceSaveGames = (g) => { setGames(g); saveData('games', g) }

  // Team management
  const createTeam = (name) => {
    const t = { id: Date.now(), name, players: [] }
    const nt = [...teams, t]
    setTeams(nt)
    saveData('teams', nt)
    return t.id
  }

  const addPlayer = (teamId, playerName) => {
    const playerId = Date.now()
    const nt = teams.map(t => t.id === teamId ? { ...t, players: [...t.players, { id: playerId, name: playerName }] } : t)
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
    setTeams(nt); forceSaveGames(ng); setDeleteConfirmId(null)
  }

  const deletePlayer = (teamId, playerId) => {
    const nt = teams.map(t => t.id === teamId ? { ...t, players: t.players.filter(p => p.id !== playerId) } : t)
    const ng = games.filter(g => g.playerId !== playerId)
    setTeams(nt); forceSaveGames(ng); setDeleteConfirmId(null)
    // Update selectedTeam if it matches
    const updatedTeam = nt.find(t => t.id === teamId)
    if (selectedTeam?.id === teamId && updatedTeam) {
      setSelectedTeam(updatedTeam)
    }
  }

  // Games
  const startNewGame = (data) => {
    const team = teams.find(t => t.id === parseInt(data.teamId))
    const player = team?.players.find(p => p.id === parseInt(data.playerId))
    const g = {
      id: Date.now(),
      teamId: parseInt(data.teamId),
      playerId: parseInt(data.playerId),
      teamName: team?.name || '',
      playerName: player?.name || '',
      opponent: data.opponent,
      date: data.date,
      time: data.time,
      stats: defaultStats()
    }
    setCurrentGame(g); setTimeElapsed(0); setTransactions([]); setView('liveGame')
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
    setCurrentGame(g); setTimeElapsed(0); setTransactions([]); setIsPlaying(true); setView('liveGame')
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
          isQuickGame: false // No longer a quick game once associated
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
      // If associated with team/player, go to player detail
      const team = teams.find(t => t.id === teamId)
      const player = team?.players.find(p => p.id === playerId)
      if (team && player) {
        setSelectedTeam(team)
        setSelectedPlayer(player)
        setView('playerDetail')
      } else {
        setView('home')
      }
    } else if (!currentGame.isQuickGame) {
      // Regular games navigate to player detail
      const team = teams.find(t => t.id === currentGame.teamId)
      const player = team?.players.find(p => p.id === currentGame.playerId)
      if (team && player) { setSelectedTeam(team); setSelectedPlayer(player); setView('playerDetail') } else setView('home')
    } else {
      // Unassociated quick games go back to home
      setView('home')
    }
    setCurrentGame(null); setIsPlaying(false); clearCurrentGame()
  }

  const deleteGame = (gameId) => {
    const ng = games.filter(g => g.id !== gameId)
    forceSaveGames(ng)
    setDeleteConfirmId(null)
  }

  const viewGame = (g) => { setViewingGame(g); setView('gameDetail') }
  const editGame = (g) => { setEditingGame(g); setView('editGame') }

  const saveEditedGame = () => {
    const ng = games.map(g => g.id === editingGame.id ? editingGame : g)
    forceSaveGames(ng); setEditingGame(null); setViewingGame(null); setView(selectedPlayer ? 'playerDetail' : 'teamDetail')
  }

  // Helper to get friendly stat names
  const getStatLabel = (stat, points) => {
    const labels = {
      freeThrowsMade: 'FT +',
      freeThrowsMissed: 'FT -',
      twoPointersMade: '2PT +',
      twoPointersMissed: '2PT -',
      threePointersMade: '3PT +',
      threePointersMissed: '3PT -',
      offensiveRebounds: 'OReb',
      defensiveRebounds: 'DReb',
      assists: 'Ast',
      steals: 'Stl',
      blocks: 'Blk',
      turnovers: 'TO',
      fouls: 'Foul'
    }
    return labels[stat] || stat
  }

  // Live game stat updates
  const updateStat = (stat, points = 0) => {
    if (!currentGame) return
    const newStatTotal = (currentGame.stats[stat] || 0) + 1
    const transaction = {
      id: Date.now(),
      stat,
      points,
      label: getStatLabel(stat, points),
      timestamp: timeElapsed,
      totalPoints: (currentGame.stats.points || 0) + points,
      statTotal: newStatTotal
    }
    setLastAction(transaction)
    setTransactions(prev => [...prev, transaction])
    setCurrentGame(cg => {
      const nstats = { ...cg.stats, [stat]: cg.stats[stat] + 1, points: cg.stats.points + points }
      const ncg = { ...cg, stats: nstats }
      saveCurrentGame(ncg)
      return ncg
    })
  }

  const undoLast = () => {
    if (!lastAction || !currentGame) return
    const { stat, points } = lastAction
    setCurrentGame(cg => {
      const nstats = { ...cg.stats, [stat]: Math.max(0, cg.stats[stat] - 1), points: Math.max(0, cg.stats.points - points) }
      const ncg = { ...cg, stats: nstats }
      saveCurrentGame(ncg)
      return ncg
    })
    setTransactions(prev => prev.slice(0, -1))
    setLastAction(null)
  }

  const deleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (!transaction || !currentGame) return

    setCurrentGame(cg => {
      const nstats = {
        ...cg.stats,
        [transaction.stat]: Math.max(0, cg.stats[transaction.stat] - 1),
        points: Math.max(0, cg.stats.points - transaction.points)
      }
      const ncg = { ...cg, stats: nstats }
      saveCurrentGame(ncg)
      return ncg
    })
    setTransactions(prev => prev.filter(t => t.id !== transactionId))
    if (lastAction?.id === transactionId) setLastAction(null)
  }

  const exportGame = async (g) => {
    const text = formatExportText(g)
    try { await navigator.clipboard.writeText(text); setCopiedGameId(g.id); setTimeout(() => setCopiedGameId(null), 2000) } catch (e) { alert(text) }
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
          setTeams(d.teams); setGames(d.games); saveData('teams', d.teams); saveData('games', d.games); setView('home')
        } else alert('Invalid backup file')
      } catch (err) { alert('Error reading file') }
    }
    r.readAsText(file)
  }

  // Render split components

  // route
  return (
    <>
      {view === 'home' && <HomeView currentGame={currentGame} setView={setView} startQuickGame={startQuickGame} />}
      {view === 'teams' && <TeamsView teams={teams} setView={setView} setSelectedTeam={setSelectedTeam} deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} deleteTeam={deleteTeam} newTeamName={newTeamName} setNewTeamName={setNewTeamName} createTeam={createTeam} />}
      {view === 'players' && <PlayersView teams={teams} setView={setView} setSelectedTeam={setSelectedTeam} setSelectedPlayer={setSelectedPlayer} />}
      {view === 'cloudSettings' && <CloudSettings setView={setView} exportAll={exportAll} importAll={importAll} />}
      {view === 'teamDetail' && <TeamDetail selectedTeam={selectedTeam} setView={setView} setSelectedPlayer={setSelectedPlayer} newPlayerName={newPlayerName} setNewPlayerName={setNewPlayerName} addPlayer={addPlayer} games={games} viewGame={viewGame} exportGame={exportGame} deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} deletePlayer={deletePlayer} deleteGame={deleteGame} />}
      {view === 'playerDetail' && <PlayerDetail selectedPlayer={selectedPlayer} selectedTeam={selectedTeam} setView={setView} games={games} viewGame={viewGame} exportGame={exportGame} deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} setFormData={setFormData} formData={formData} currentGame={currentGame} />}
      {view === 'gameDetail' && <GameDetail game={viewingGame} setView={setView} setEditingGame={setEditingGame} selectedPlayer={selectedPlayer} teams={teams} createTeam={createTeam} addPlayer={addPlayer} saveEditedGame={saveEditedGame} />}
      {view === 'newGame' && <NewGame teams={teams} formData={formData} setFormData={setFormData} startNewGame={startNewGame} setView={setView} />}
      {view === 'liveGame' && <LiveGame currentGame={currentGame} timeElapsed={timeElapsed} setView={setView} setIsPlaying={setIsPlaying} isPlaying={isPlaying} updateStat={updateStat} undoLast={undoLast} saveFinishedGame={saveFinishedGame} lastAction={lastAction} transactions={transactions} deleteTransaction={deleteTransaction} updateGameInfo={updateGameInfo} teams={teams} />}
      {view === 'editGame' && <EditGame editingGame={editingGame} setEditingGame={setEditingGame} saveEditedGame={saveEditedGame} selectedPlayer={selectedPlayer} setView={setView} teams={teams} createTeam={createTeam} addPlayer={addPlayer} />}
    </>
  )
}
