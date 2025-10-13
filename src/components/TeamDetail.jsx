import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function TeamDetail ({ selectedTeam, setView, setSelectedPlayer, newPlayerName, setNewPlayerName, addPlayer, games, editGame, exportGame, deleteConfirmId, setDeleteConfirmId, deletePlayer, deleteGame }) {
  return (
    <div className="h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-start overflow-hidden">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView('teams')} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">{selectedTeam?.name}</h2>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {selectedTeam?.players.map(p => (
              <div key={p.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedPlayer(p); setView('playerDetail') }} className="btn-sm">Open</button>
                  <button onClick={() => { if (deleteConfirmId === p.id) deletePlayer(selectedTeam.id, p.id); else { setDeleteConfirmId(p.id); setTimeout(() => setDeleteConfirmId(null), 3000) } }} className={`btn-sm ${deleteConfirmId === p.id ? 'danger' : ''}`}>{deleteConfirmId === p.id ? 'Confirm?' : 'Delete'}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <input value={newPlayerName} onChange={e => setNewPlayerName(e.target.value)} placeholder="New player name" className="input flex-1" />
            <button onClick={() => { if (newPlayerName.trim()) { addPlayer(selectedTeam.id, newPlayerName.trim()); setNewPlayerName('') } }} className="btn">Add</button>
          </div>
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Team Games</h3>
            <div className="space-y-2">
              {games.filter(g => g.teamId === selectedTeam?.id).map(game => (
                <div key={game.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold">{game.stats.points}</div>
                    <div className="text-xs text-gray-500">{game.playerName} vs {game.opponent}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => editGame(game)} className="btn-sm">Edit</button>
                    <button onClick={() => exportGame(game)} className="btn-sm">Export</button>
                    <button onClick={() => { if (deleteConfirmId === game.id) deleteGame(game.id); else { setDeleteConfirmId(game.id); setTimeout(() => setDeleteConfirmId(null), 3000) } }} className={`btn-sm ${deleteConfirmId === game.id ? 'danger' : ''}`}>{deleteConfirmId === game.id ? 'Confirm?' : 'Delete'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
