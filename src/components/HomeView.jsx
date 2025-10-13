import React from 'react'

export default function HomeView ({ currentGame, setView, exportAll, importAll }) {
  return (
    <div className="h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center overflow-hidden">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <h1 className="text-2xl font-bold mb-2">Basketball Tracker</h1>
          <p className="text-sm text-gray-600 mb-4">Create teams, track games, and view stats.</p>
          <div className="space-y-2">
            <button onClick={() => setView('teams')} className="w-full btn">Teams</button>
            <button onClick={() => setView('newGame')} className="w-full btn">New Game</button>
            {currentGame && <button onClick={() => setView('liveGame')} className="w-full btn">Resume Game</button>}
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
