import { useState, useCallback } from 'react'
import { saveCurrentGame } from '../utils/storage'

const getStatLabel = (stat) => {
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

export default function useLiveGameStats (currentGame, setCurrentGame, timeElapsed) {
  const [lastAction, setLastAction] = useState(null)
  const [transactions, setTransactions] = useState([])

  const updateStat = useCallback((stat, points = 0) => {
    if (!currentGame) return
    const newStatTotal = (currentGame.stats[stat] || 0) + 1
    const transaction = {
      id: Date.now(),
      stat,
      points,
      label: getStatLabel(stat),
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
  }, [currentGame, setCurrentGame, timeElapsed])

  const undoLast = useCallback(() => {
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
  }, [lastAction, currentGame, setCurrentGame])

  const deleteTransaction = useCallback((transactionId) => {
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
  }, [transactions, currentGame, setCurrentGame, lastAction])

  const resetStats = useCallback(() => {
    setLastAction(null)
    setTransactions([])
  }, [])

  return {
    lastAction,
    transactions,
    updateStat,
    undoLast,
    deleteTransaction,
    resetStats
  }
}
