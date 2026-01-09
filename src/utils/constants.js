export const VIEWS = {
  HOME: 'home',
  TEAMS: 'teams',
  TEAM_DETAIL: 'teamDetail',
  PLAYERS: 'players',
  PLAYER_DETAIL: 'playerDetail',
  NEW_GAME: 'newGame',
  LIVE_GAME: 'liveGame',
  GAME_DETAIL: 'gameDetail',
  EDIT_GAME: 'editGame',
  CLOUD_SETTINGS: 'cloudSettings'
}

export const TIMEOUTS = {
  DELETE_CONFIRM: 3000,
  COPIED_FEEDBACK: 2000,
  RELOAD_DELAY: 1000,
  STATUS_MESSAGE: 3000
}

// Safely convert select value (string) to numeric ID
// Returns null for empty/invalid values, number otherwise
export const parseId = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const num = parseInt(value, 10)
  return isNaN(num) ? null : num
}
