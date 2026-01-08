import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { VIEWS } from '../utils/constants'
import DeleteConfirmButton from './DeleteConfirmButton'

export default function TeamDetail ({ selectedTeam, setView, setSelectedPlayer, newPlayerName, setNewPlayerName, addPlayer, games, viewGame, exportGame, deleteConfirmId, setDeleteConfirmId, deletePlayer, deleteGame }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView(VIEWS.TEAMS)} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">{selectedTeam?.name}</h2>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {selectedTeam?.players.map(p => (
              <div key={p.id} className="border-2 border-orange-300 rounded flex items-center justify-between overflow-hidden bg-orange-50">
                <div
                  onClick={() => { setSelectedPlayer(p); setView(VIEWS.PLAYER_DETAIL) }}
                  className="flex-1 p-3 cursor-pointer hover:bg-orange-100 active:bg-orange-200"
                >
                  <div className="font-semibold text-orange-900">{p.name}</div>
                </div>
                <DeleteConfirmButton
                  id={p.id}
                  deleteConfirmId={deleteConfirmId}
                  setDeleteConfirmId={setDeleteConfirmId}
                  onDelete={() => deletePlayer(selectedTeam.id, p.id)}
                />
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
              {games.filter(g => g.teamId === selectedTeam?.id).sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.time || '00:00'}`)
                const dateB = new Date(`${b.date} ${b.time || '00:00'}`)
                return dateB - dateA
              }).map(game => {
                const totalReb = (game.stats.offensiveRebounds || 0) + (game.stats.defensiveRebounds || 0)
                return (
                  <div key={game.id} className="border-2 border-orange-300 rounded overflow-hidden bg-orange-50">
                    <div
                      onClick={() => viewGame(game)}
                      className="p-3 cursor-pointer hover:bg-orange-100 active:bg-orange-200"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="text-2xl font-bold text-blue-600">{game.playerScore ?? game.stats.points}</div>
                          {game.result && (
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              game.result === 'win' ? 'bg-green-100 text-green-700' :
                              game.result === 'loss' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {game.result.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{game.date}</div>
                      </div>
                      <div className="text-sm font-semibold mb-1">
                        {game.playerName} vs {game.opponent}
                        {game.teamScore !== undefined && game.opponentTeamScore !== undefined ? (
                          <span className="text-gray-500 ml-2">({game.teamScore} - {game.opponentTeamScore})</span>
                        ) : game.opponentScore !== undefined && (
                          <span className="text-gray-500 ml-2">({game.playerScore ?? game.stats.points} - {game.opponentScore})</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-600">
                        {totalReb} REB • {game.stats.assists || 0} AST • {game.stats.steals || 0} STL • {game.stats.blocks || 0} BLK
                      </div>
                    </div>
                    <div className="flex border-t">
                      <button onClick={(e) => { e.stopPropagation(); exportGame(game) }} className="flex-1 py-2 text-xs text-blue-600 hover:bg-blue-50">Export</button>
                      <DeleteConfirmButton
                        id={game.id}
                        deleteConfirmId={deleteConfirmId}
                        setDeleteConfirmId={setDeleteConfirmId}
                        onDelete={() => deleteGame(game.id)}
                        variant="flex"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
