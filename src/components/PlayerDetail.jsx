import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { formatTime, calculatePlayerStats } from '../utils/calculations'

export default function PlayerDetail ({ selectedPlayer, selectedTeam, setView, games, editGame, exportGame, deleteConfirmId, setDeleteConfirmId, setFormData, formData }) {
  const stats = calculatePlayerStats(games, selectedPlayer?.id)
  return (
    <div className="h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-start overflow-hidden">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView('teamDetail')} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">{selectedPlayer?.name}</h2>
            <div className="w-8" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-3 bg-gray-50 rounded">Games: {stats?.gamesPlayed || 0}</div>
            <div className="p-3 bg-gray-50 rounded">PPG: {stats?.ppg || 0}</div>
            <div className="p-3 bg-gray-50 rounded">RPG: {stats?.rpg || 0}</div>
            <div className="p-3 bg-gray-50 rounded">FG%: {stats?.fgPct || 0}</div>
          </div>
          <div className="space-y-2">
            {games.filter(g => g.playerId === selectedPlayer?.id).map(game => (
              <div key={game.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold">{game.stats.points}</div>
                  <div className="text-xs text-gray-500">{game.teamName} vs {game.opponent}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => editGame(game)} className="btn-sm">Edit</button>
                  <button onClick={() => exportGame(game)} className="btn-sm">Export</button>
                  <button onClick={() => { if (deleteConfirmId === game.id) deleteGame(game.id); else { setDeleteConfirmId(game.id); setTimeout(() => setDeleteConfirmId(null), 3000) } }} className={`btn-sm ${deleteConfirmId === game.id ? 'danger' : ''}`}>{deleteConfirmId === game.id ? 'Confirm?' : 'Delete'}</button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button onClick={() => { setFormData({ ...formData, teamId: selectedTeam.id, playerId: selectedPlayer.id }); setView('newGame') }} className="btn w-full">New Game</button>
          </div>
        </div>
      </div>
    </div>
  )
}
