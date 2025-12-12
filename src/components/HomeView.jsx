import React, { useState, useEffect } from 'react'
import { Cloud, CloudOff } from 'lucide-react'
import { syncToICloud, loadFromICloud, checkICloudBackup } from '../utils/storage'
import { Capacitor } from '@capacitor/core'

export default function HomeView ({ currentGame, setView, exportAll, importAll, startQuickGame }) {
  const [iCloudStatus, setICloudStatus] = useState(null)
  const [hasBackup, setHasBackup] = useState(false)
  const isNative = Capacitor.isNativePlatform()

  useEffect(() => {
    if (isNative) {
      checkICloudBackup().then(setHasBackup)
    }
  }, [isNative])

  const handleSyncToICloud = async () => {
    setICloudStatus('syncing')
    const result = await syncToICloud()
    setICloudStatus(result.success ? 'success' : 'error')
    if (result.success) setHasBackup(true)
    setTimeout(() => setICloudStatus(null), 3000)
  }

  const handleLoadFromICloud = async () => {
    if (!confirm('This will replace your current data with data from iCloud. Continue?')) return
    setICloudStatus('loading')
    const result = await loadFromICloud()
    setICloudStatus(result.success ? 'success' : 'error')
    if (result.success) {
      setTimeout(() => window.location.reload(), 1000)
    } else {
      setTimeout(() => setICloudStatus(null), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <h1 className="text-2xl font-bold mb-2">Basketball Tracker</h1>
          <p className="text-sm text-gray-600 mb-4">Create teams, track games, and view stats.</p>
          <div className="space-y-2">
            <button onClick={startQuickGame} className="w-full btn bg-green-500 text-white">Quick Game</button>
            <button onClick={() => setView('teams')} className="w-full btn">Teams</button>
            <button onClick={() => setView('players')} className="w-full btn">Players</button>
            <button onClick={() => setView('newGame')} className="w-full btn">New Game</button>
            {currentGame && <button onClick={() => setView('liveGame')} className="w-full btn bg-blue-500 text-white">Resume Game</button>}

            {isNative && (
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">iCloud Sync</div>
                  {hasBackup && <Cloud className="w-4 h-4 text-blue-500" />}
                  {!hasBackup && <CloudOff className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSyncToICloud}
                    disabled={iCloudStatus === 'syncing'}
                    className="flex-1 btn bg-blue-500 disabled:opacity-50"
                  >
                    {iCloudStatus === 'syncing' ? 'Syncing...' : 'Sync to iCloud'}
                  </button>
                  <button
                    onClick={handleLoadFromICloud}
                    disabled={!hasBackup || iCloudStatus === 'loading'}
                    className="flex-1 btn bg-blue-500 disabled:opacity-50"
                  >
                    {iCloudStatus === 'loading' ? 'Loading...' : 'Load from iCloud'}
                  </button>
                </div>
                {iCloudStatus === 'success' && (
                  <div className="mt-2 text-xs text-green-600 text-center">Success!</div>
                )}
                {iCloudStatus === 'error' && (
                  <div className="mt-2 text-xs text-red-600 text-center">Failed - check console</div>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-3">
              <button onClick={exportAll} className="flex-1 btn">Backup</button>
              <label className="flex-1 btn cursor-pointer">
                Restore
                <input type="file" accept="application/json" onChange={e => e.target.files[0] && importAll(e.target.files[0])} className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
