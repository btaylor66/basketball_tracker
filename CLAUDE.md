# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Basketball Stats Tracker - A mobile-first iOS app built with React + Vite + Capacitor for tracking basketball game statistics. Data is stored in localStorage with optional iCloud backup on native iOS.

**Stack:**
- React 18.2 + Vite 7.x (dev server & bundler)
- Capacitor 7.4.3 (native iOS bridge)
- Tailwind CSS (styling)
- Lucide React (icons)
- Vitest (testing with jsdom)

**App ID:** `solutions.righttackle.basketball`

## Development Commands

### Web Development
```bash
npm run dev          # Start Vite dev server
npm run build        # Build for production (outputs to dist/)
npm run preview      # Preview production build
```

### Testing
```bash
npm test            # Run all tests once
npm run test:watch  # Run tests in watch mode
```

### iOS Development
```bash
npm run build           # ALWAYS build first
npm run cap:sync        # Sync web assets + native deps to iOS
npm run cap:open        # Open Xcode workspace

# Common iOS build workflow:
npm run build && npm run cap:sync && npm run cap:open
```

**iOS Build Notes:**
- Test on physical iOS device (ID: `00008150-001971942EC0401C`)
- Simulator name: `iPhone 17`
- Use 1024x1024 square app icons
- Native features (iCloud, KeepAwake) require testing on device

## Architecture

### App Structure

**Single-page app with view-based routing** - All state and routing logic lives in `src/App.jsx` (~384 lines). Views are switched by updating the `view` state variable rather than using a routing library.

**Key state in App.jsx:**
- `teams` - Array of team objects with players
- `games` - Array of completed game records
- `currentGame` - In-progress game (null when no active game)
- `view` - Current view name ('home', 'liveGame', 'teams', etc.)
- `isPlaying` - Timer state for live games
- `timeElapsed` - Seconds elapsed in current game

### Data Model

**Teams:**
```js
{ id: timestamp, name: string, players: [{ id: timestamp, name: string }] }
```

**Games:**
```js
{
  id: timestamp,
  teamId: number,
  playerId: number,
  opponent: string,
  date: 'YYYY-MM-DD',
  time: 'HH:MM',
  stats: { points, freeThrowsMade, twoPointersMade, threePointersMade, rebounds, assists, ... }
}
```

**Stats tracking:** All stats are cumulative integers. Time is tracked in seconds.

### Storage Architecture

**localStorage** is the primary storage mechanism:
- `basketballTeams` - Serialized teams array
- `basketballGames` - Serialized games array
- `currentGame` - Serialized in-progress game (cleared when game ends)

**iCloud sync (iOS only):**
- File: `basketball-tracker-data.json` in Documents directory
- Uses `@capacitor/filesystem` plugin
- Manual sync/restore from CloudSettings view
- Check native platform with `Capacitor.isNativePlatform()`

### Component Organization

All views are in `src/components/`:
- `HomeView.jsx` - Main menu and recent games list
- `LiveGame.jsx` - Active game stat tracking with timer
- `NewGame.jsx` - Create new game form
- `GameDetail.jsx` - View completed game stats
- `EditGame.jsx` - Edit completed game stats
- `TeamsView.jsx` - Team management
- `TeamDetail.jsx` - Team roster and stats
- `PlayersView.jsx` - All players across teams
- `PlayerDetail.jsx` - Individual player stats
- `CloudSettings.jsx` - iCloud backup/restore

**View pattern:** Each component receives all needed state and callbacks as props from App.jsx. No local routing library.

### Utilities

**`src/utils/storage.js`:**
- `loadData()` / `saveData(type, data)` - localStorage CRUD
- `saveCurrentGame()` / `loadCurrentGame()` / `clearCurrentGame()` - Active game persistence
- `syncToICloud()` / `loadFromICloud()` - iOS-only cloud backup functions
- `isNative()` helper checks `Capacitor.isNativePlatform()`

**`src/utils/calculations.js`:**
- `formatTime(seconds)` - Converts seconds to MM:SS format
- `calculatePlayerStats(games, playerId)` - Aggregates per-game stats into averages (PPG, RPG, FG%) and cumulative totals

### Time Input Format

**MM:SS format with separate fields:**
- Time inputs use two separate number inputs for minutes and seconds
- Display format: `formatTime(seconds)` returns "MM:SS" string
- Storage: Always stored as integer seconds

### Native Features

**Conditional native features:**
```js
const isNative = Capacitor.isNativePlatform()
if (isNative) {
  // Use native-only features
}
```

**Active native plugins:**
- `@capacitor-community/keep-awake` - Prevents screen sleep during live games
- `@capacitor/filesystem` - iCloud file access via Documents directory
- `@capacitor/preferences` - Not currently used but available

## Testing

Tests use Vitest + React Testing Library with jsdom environment.

**Test files:**
- `src/utils/storage.test.js`
- `src/utils/calculations.test.js`

**Run single test file:**
```bash
npm test -- src/utils/storage.test.js
```

## Code Patterns

**Icons:** Use Lucide React icons exclusively (already imported throughout codebase)

**Collapsible sections:** Use ChevronDown/ChevronUp icons with boolean toggle state

**Default stats object:** Generated by `defaultStats()` function in App.jsx - returns object with all stat fields initialized to 0

**State updates:** Components receive state setters from App.jsx. Persistence happens via useEffect hooks in App.jsx watching teams/games/currentGame state.
