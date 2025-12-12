import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'

const TEAMS_KEY = 'basketballTeams'
const GAMES_KEY = 'basketballGames'
const CURRENT_KEY = 'currentGame'
const ICLOUD_FILENAME = 'basketball-tracker-data.json'

const isNative = () => Capacitor.isNativePlatform()

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

// iCloud sync functions
export const syncToICloud = async () => {
  if (!isNative()) {
    throw new Error('iCloud sync only available on native iOS')
  }

  try {
    const data = {
      teams: JSON.parse(localStorage.getItem(TEAMS_KEY) || '[]'),
      games: JSON.parse(localStorage.getItem(GAMES_KEY) || '[]'),
      syncDate: new Date().toISOString()
    }

    await Filesystem.writeFile({
      path: ICLOUD_FILENAME,
      data: JSON.stringify(data, null, 2),
      directory: Directory.Documents,
      encoding: 'utf8'
    })

    return { success: true, message: 'Data synced to iCloud successfully' }
  } catch (error) {
    console.error('iCloud sync error:', error)
    return { success: false, message: `Sync failed: ${error.message}` }
  }
}

export const loadFromICloud = async () => {
  if (!isNative()) {
    throw new Error('iCloud sync only available on native iOS')
  }

  try {
    const result = await Filesystem.readFile({
      path: ICLOUD_FILENAME,
      directory: Directory.Documents,
      encoding: 'utf8'
    })

    const data = JSON.parse(result.data)

    if (data.teams && data.games) {
      localStorage.setItem(TEAMS_KEY, JSON.stringify(data.teams))
      localStorage.setItem(GAMES_KEY, JSON.stringify(data.games))
      return { success: true, message: 'Data loaded from iCloud successfully', data }
    } else {
      return { success: false, message: 'Invalid data format in iCloud file' }
    }
  } catch (error) {
    console.error('iCloud load error:', error)
    if (error.message.includes('does not exist')) {
      return { success: false, message: 'No iCloud backup found' }
    }
    return { success: false, message: `Load failed: ${error.message}` }
  }
}

export const checkICloudBackup = async () => {
  if (!isNative()) return false

  try {
    await Filesystem.stat({
      path: ICLOUD_FILENAME,
      directory: Directory.Documents
    })
    return true
  } catch {
    return false
  }
}
