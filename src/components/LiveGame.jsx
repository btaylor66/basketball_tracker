import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { formatTime } from '../utils/calculations'

export default function LiveGame ({ currentGame, timeElapsed, setView, setIsPlaying, isPlaying, updateStat, undoLast, saveFinishedGame, lastAction }) {
  return (
    <div className="h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-start overflow-hidden">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow p-4 sticky top-0">
          <div className="flex items-center justify-between">
            <button onClick={() => { setView('playerDetail'); setIsPlaying(false) }} className="btn-ghost"><ArrowLeft /></button>
            <div className="text-center">
              <div className="text-2xl font-bold">{currentGame?.stats.points || 0}</div>
              <div className="text-xs text-gray-500">Points</div>
            </div>
            <div className="w-8" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="font-semibold">{currentGame?.playerName} - {currentGame?.teamName}</div>
            <div className="text-sm">{formatTime(timeElapsed)}</div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => updateStat('freeThrowsMade', 1)} className="btn-made">FT +</button>
            <button onClick={() => updateStat('freeThrowsMissed', 0)} className="btn-miss">FT -</button>
            <button onClick={() => updateStat('twoPointersMade', 2)} className="btn-made">2PT +</button>
            <button onClick={() => updateStat('twoPointersMissed', 0)} className="btn-miss">2PT -</button>
            <button onClick={() => updateStat('threePointersMade', 3)} className="btn-made">3PT +</button>
            <button onClick={() => updateStat('threePointersMissed', 0)} className="btn-miss">3PT -</button>
            <button onClick={() => updateStat('offensiveRebounds', 0)} className="btn">OReb</button>
            <button onClick={() => updateStat('defensiveRebounds', 0)} className="btn">DReb</button>
            <button onClick={() => updateStat('steals', 0)} className="btn">Stl</button>
            <button onClick={() => updateStat('blocks', 0)} className="btn">Blk</button>
            <button onClick={() => updateStat('turnovers', 0)} className="btn">TO</button>
            <button onClick={() => updateStat('fouls', 0)} className="btn">Foul</button>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={() => setIsPlaying(p => !p)} className="flex-1 btn">{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={undoLast} className="flex-1 btn">Undo</button>
            <button onClick={saveFinishedGame} className="flex-1 btn-danger">End</button>
          </div>
          {lastAction && <div className="mt-2 text-sm">Last: {lastAction.stat}</div>}
        </div>
      </div>
    </div>
  )
}
