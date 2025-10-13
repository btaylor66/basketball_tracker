import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function EditGame ({ editingGame, setEditingGame, saveEditedGame, selectedPlayer, setView }) {
  return (
    <div className="h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-start overflow-hidden">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView(selectedPlayer ? 'playerDetail' : 'teamDetail')} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">Edit Game</h2>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {editingGame && Object.keys(editingGame.stats).map(k => (
              <div key={k} className="flex items-center gap-2">
                <div className="flex-1 capitalize">{k}</div>
                <input type="number" value={editingGame.stats[k]} onChange={e => setEditingGame({ ...editingGame, stats: { ...editingGame.stats, [k]: parseInt(e.target.value || 0) } })} className="input w-24" />
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <button onClick={saveEditedGame} className="btn w-full">Save</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
