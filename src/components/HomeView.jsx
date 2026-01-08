import React from 'react'
import { Cloud } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { VIEWS } from '../utils/constants'

export default function HomeView ({ currentGame, setView, startQuickGame }) {
  const isNative = Capacitor.isNativePlatform()

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <h1 className="text-2xl font-bold mb-2">Basketball Tracker</h1>
          <p className="text-sm text-gray-600 mb-4">Create teams, track games, and view stats.</p>
          <div className="space-y-2">
            <button onClick={startQuickGame} className="w-full btn bg-green-500 text-white">Quick Game</button>
            <button onClick={() => setView(VIEWS.TEAMS)} className="w-full btn">Teams</button>
            <button onClick={() => setView(VIEWS.PLAYERS)} className="w-full btn">Players</button>
            <button onClick={() => setView(VIEWS.NEW_GAME)} className="w-full btn">New Game</button>
            {currentGame && <button onClick={() => setView(VIEWS.LIVE_GAME)} className="w-full btn bg-blue-500 text-white">Resume Game</button>}

            <div className="mt-3 pt-3 border-t">
              <button
                onClick={() => setView(VIEWS.CLOUD_SETTINGS)}
                className="w-full btn bg-blue-500 text-white flex items-center justify-center gap-2"
              >
                <Cloud className="w-4 h-4" />
                {isNative ? 'iCloud Sync' : 'Backup & Restore'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
