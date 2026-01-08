import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { formatTime, calculatePlayerStats } from '../utils/calculations'

export default function PlayerDetail ({ selectedPlayer, selectedTeam, setView, games, viewGame, exportGame, deleteConfirmId, setDeleteConfirmId, setFormData, formData, currentGame, deleteGame }) {
  const stats = calculatePlayerStats(games, selectedPlayer?.id)
  const hasActiveGame = currentGame && currentGame.playerId === selectedPlayer?.id
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView('teamDetail')} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">{selectedPlayer?.name}</h2>
            <div className="w-8" />
          </div>
          {stats && (
            <>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 bg-blue-50 rounded text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.totalPoints}</div>
                  <div className="text-xs text-gray-600">Total PTS</div>
                </div>
                <div className="p-2 bg-purple-50 rounded text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.totalRebounds}</div>
                  <div className="text-xs text-gray-600">Total REB</div>
                </div>
                <div className="p-2 bg-green-50 rounded text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.totalAssists}</div>
                  <div className="text-xs text-gray-600">Total AST</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="text-lg font-semibold">{stats.ppg}</div>
                  <div className="text-xs text-gray-600">PPG</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="text-lg font-semibold">{stats.rpg}</div>
                  <div className="text-xs text-gray-600">RPG</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="text-lg font-semibold">{stats.apg}</div>
                  <div className="text-xs text-gray-600">APG</div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="p-2 bg-orange-50 rounded text-center">
                  <div className="font-semibold text-orange-600">{stats.fgPct}%</div>
                  <div className="text-xs text-gray-600">FG%</div>
                  <div className="text-xs text-gray-500">{stats.totalFGMade}/{stats.totalFGAttempted}</div>
                </div>
                <div className="p-2 bg-orange-50 rounded text-center">
                  <div className="font-semibold text-orange-600">{stats.twoPct}%</div>
                  <div className="text-xs text-gray-600">2PT%</div>
                  <div className="text-xs text-gray-500">{stats.total2PTMade}/{stats.total2PTAttempted}</div>
                </div>
                <div className="p-2 bg-orange-50 rounded text-center">
                  <div className="font-semibold text-orange-600">{stats.threePct}%</div>
                  <div className="text-xs text-gray-600">3PT%</div>
                  <div className="text-xs text-gray-500">{stats.total3PTMade}/{stats.total3PTAttempted}</div>
                </div>
                <div className="p-2 bg-red-50 rounded text-center">
                  <div className="font-semibold text-red-600">{stats.ftPct}%</div>
                  <div className="text-xs text-gray-600">FT%</div>
                  <div className="text-xs text-gray-500">{stats.totalFTMade}/{stats.totalFTAttempted}</div>
                </div>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-3">
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="font-semibold">{stats.totalSteals}</div>
                  <div className="text-xs text-gray-600">STL</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="font-semibold">{stats.totalBlocks}</div>
                  <div className="text-xs text-gray-600">BLK</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="font-semibold">{stats.totalTurnovers}</div>
                  <div className="text-xs text-gray-600">TO</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="font-semibold">{stats.totalFouls}</div>
                  <div className="text-xs text-gray-600">PF</div>
                </div>
                <div className="p-2 bg-gray-50 rounded text-center">
                  <div className="font-semibold">{stats.gamesPlayed}</div>
                  <div className="text-xs text-gray-600">GP</div>
                </div>
              </div>
            </>
          )}
          <div className="space-y-2">
            {games.filter(g => g.playerId === selectedPlayer?.id).sort((a, b) => {
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
                      {game.teamName} vs {game.opponent}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (deleteConfirmId === game.id) deleteGame(game.id)
                        else { setDeleteConfirmId(game.id); setTimeout(() => setDeleteConfirmId(null), 3000) }
                      }}
                      className={`flex-1 py-2 text-xs border-l ${deleteConfirmId === game.id ? 'bg-red-600 text-white' : 'text-red-600 hover:bg-red-50'}`}
                    >
                      {deleteConfirmId === game.id ? 'Confirm?' : 'Delete'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="mt-4 space-y-2">
            {hasActiveGame && (
              <button onClick={() => setView('liveGame')} className="btn w-full bg-green-500">Resume Game</button>
            )}
            <button onClick={() => { setFormData({ ...formData, teamId: selectedTeam.id, playerId: selectedPlayer.id }); setView('newGame') }} className="btn w-full">New Game</button>
          </div>
        </div>
      </div>
    </div>
  )
}
