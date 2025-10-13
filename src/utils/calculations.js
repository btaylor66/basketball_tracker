export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const calculatePlayerStats = (games, playerId) => {
  if (!playerId) return null
  const playerGames = games.filter(g => g.playerId === playerId)
  if (playerGames.length === 0) return null

  const totals = playerGames.reduce((acc, g) => {
    Object.keys(g.stats).forEach(k => { acc[k] = (acc[k] || 0) + g.stats[k] })
    return acc
  }, {})

  const fgMade = totals.twoPointersMade + totals.threePointersMade
  const fgAtt = totals.twoPointersMade + totals.twoPointersMissed + totals.threePointersMade + totals.threePointersMissed
  const ftAtt = totals.freeThrowsMade + totals.freeThrowsMissed
  const twoAtt = totals.twoPointersMade + totals.twoPointersMissed
  const threeAtt = totals.threePointersMade + totals.threePointersMissed

  return {
    gamesPlayed: playerGames.length,
    ppg: (totals.points / playerGames.length).toFixed(1),
    rpg: ((totals.defensiveRebounds + totals.offensiveRebounds) / playerGames.length).toFixed(1),
    fgPct: fgAtt > 0 ? ((fgMade / fgAtt) * 100).toFixed(1) : 0,
    twoPct: twoAtt > 0 ? ((totals.twoPointersMade / twoAtt) * 100).toFixed(1) : 0,
    threePct: threeAtt > 0 ? ((totals.threePointersMade / threeAtt) * 100).toFixed(1) : 0,
    ftPct: ftAtt > 0 ? ((totals.freeThrowsMade / ftAtt) * 100).toFixed(1) : 0,
    totalPoints: totals.points,
    totalRebounds: totals.defensiveRebounds + totals.offensiveRebounds,
    totalSteals: totals.steals,
    totalBlocks: totals.blocks
  }
}
