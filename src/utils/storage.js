const TEAMS_KEY = 'basketballTeams'
const GAMES_KEY = 'basketballGames'
const CURRENT_KEY = 'currentGame'

export const loadData = () => {
  try {
    const teams = JSON.parse(localStorage.getItem(TEAMS_KEY) || '[]')
    const games = JSON.parse(localStorage.getItem(GAMES_KEY) || '[]')
    return { teams, games }
  } catch (e) { return { teams: [], games: [] } }
}

export const saveData = (type, data) => {
  if (type === 'teams') localStorage.setItem(TEAMS_KEY, JSON.stringify(data))
  if (type === 'games') localStorage.setItem(GAMES_KEY, JSON.stringify(data))
}

export const saveCurrentGame = (game) => localStorage.setItem(CURRENT_KEY, JSON.stringify(game))
export const loadCurrentGame = () => { try { return JSON.parse(localStorage.getItem(CURRENT_KEY)) } catch (e) { return null } }
export const clearCurrentGame = () => localStorage.removeItem(CURRENT_KEY)
