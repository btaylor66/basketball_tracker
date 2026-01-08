import React, { useState, useEffect } from 'react'
import { ArrowLeft, Cloud, CloudOff } from 'lucide-react'
import { syncToICloud, loadFromICloud, checkICloudBackup } from '../utils/storage'
import { Capacitor } from '@capacitor/core'
import { VIEWS, TIMEOUTS } from '../utils/constants'

export default function CloudSettings ({ setView, exportAll, importAll }) {
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
    setTimeout(() => setICloudStatus(null), TIMEOUTS.STATUS_MESSAGE)
  }

  const handleLoadFromICloud = async () => {
    if (!confirm('This will replace your current data with data from iCloud. Continue?')) return
    setICloudStatus('loading')
    const result = await loadFromICloud()
    setICloudStatus(result.success ? 'success' : 'error')
    if (result.success) {
      setTimeout(() => window.location.reload(), TIMEOUTS.RELOAD_DELAY)
    } else {
      setTimeout(() => setICloudStatus(null), TIMEOUTS.STATUS_MESSAGE)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setView(VIEWS.HOME)} className="btn">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold text-white">Cloud Settings</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {isNative ? (
            <>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">iCloud Sync</h2>
                  {hasBackup && <Cloud className="w-5 h-5 text-blue-500" />}
                  {!hasBackup && <CloudOff className="w-5 h-5 text-gray-400" />}
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  {hasBackup ? 'Backup found in iCloud' : 'No backup found in iCloud'}
                </p>

                <div className="space-y-2">
                  <button
                    onClick={handleSyncToICloud}
                    disabled={iCloudStatus === 'syncing'}
                    className="w-full btn bg-blue-500 text-white disabled:opacity-50"
                  >
                    {iCloudStatus === 'syncing' ? 'Syncing...' : 'Sync to iCloud'}
                  </button>
                  <button
                    onClick={handleLoadFromICloud}
                    disabled={!hasBackup || iCloudStatus === 'loading'}
                    className="w-full btn bg-blue-500 text-white disabled:opacity-50"
                  >
                    {iCloudStatus === 'loading' ? 'Loading...' : 'Load from iCloud'}
                  </button>
                </div>

                {iCloudStatus === 'success' && (
                  <div className="mt-3 text-sm text-green-600 text-center font-medium">
                    ✓ Success!
                  </div>
                )}
                {iCloudStatus === 'error' && (
                  <div className="mt-3 text-sm text-red-600 text-center font-medium">
                    ✗ Failed - check console
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-3">Local Backup</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Export or import data as JSON file
                </p>
                <div className="flex gap-2">
                  <button onClick={exportAll} className="flex-1 btn">Export Backup</button>
                  <label className="flex-1 btn cursor-pointer text-center">
                    Import Backup
                    <input
                      type="file"
                      accept="application/json"
                      onChange={e => e.target.files[0] && importAll(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold mb-3">Local Backup</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Export or import data as JSON file
                </p>
                <div className="flex gap-2">
                  <button onClick={exportAll} className="flex-1 btn">Export Backup</button>
                  <label className="flex-1 btn cursor-pointer text-center">
                    Import Backup
                    <input
                      type="file"
                      accept="application/json"
                      onChange={e => e.target.files[0] && importAll(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div className="text-sm text-gray-500 text-center">
                iCloud sync is only available on iOS native app
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
