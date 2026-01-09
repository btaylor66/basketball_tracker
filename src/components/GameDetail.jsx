import React, { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import { formatTime } from '../utils/calculations'
import { VIEWS, parseId } from '../utils/constants'

export default function GameDetail ({ game, setView, setEditingGame, selectedPlayer, teams, createTeam, addPlayer, saveEditedGame }) {
  const [showEdit, setShowEdit] = useState(false)
  const [editingGame, setEditingGameLocal] = useState(game)
  const [newTeamName, setNewTeamName] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState(game?.teamId || '')
  const [selectedPlayerId, setSelectedPlayerId] = useState(game?.playerId || '')

  const selectedTeam = teams?.find(t => t.id === parseId(selectedTeamId))
  const availablePlayers = selectedTeam?.players || []

  const handleCreateTeam = () => {
    if (newTeamName.trim()) {
      const newTeamId = createTeam(newTeamName.trim())
      setSelectedTeamId(newTeamId)
      setNewTeamName('')
    }
  }

  const handleCreatePlayer = () => {
    if (newPlayerName.trim() && selectedTeamId) {
      const newPlayerId = addPlayer(parseId(selectedTeamId), newPlayerName.trim())
      setSelectedPlayerId(newPlayerId)
      setNewPlayerName('')
    }
  }

  const handleSave = () => {
    // Update team/player if selected
    if (selectedTeamId && selectedPlayerId) {
      const teamId = parseId(selectedTeamId)
      const playerId = parseId(selectedPlayerId)
      const team = teams.find(t => t.id === teamId)
      const player = team?.players.find(p => p.id === playerId)
      if (team && player) {
        setEditingGameLocal({
          ...editingGame,
          teamId,
          playerId,
          teamName: team.name,
          playerName: player.name,
          isQuickGame: false
        })
      }
    }
    setEditingGame(editingGame)
    saveEditedGame()
  }

  if (!game) return null

  const s = game.stats
  const totalReb = (s.offensiveRebounds || 0) + (s.defensiveRebounds || 0)
  const fgMade = (s.twoPointersMade || 0) + (s.threePointersMade || 0)
  const fgAtt = fgMade + (s.twoPointersMissed || 0) + (s.threePointersMissed || 0)
  const fgPct = fgAtt > 0 ? ((fgMade / fgAtt) * 100).toFixed(1) : '0.0'

  const twoPtAtt = (s.twoPointersMade || 0) + (s.twoPointersMissed || 0)
  const twoPct = twoPtAtt > 0 ? (((s.twoPointersMade || 0) / twoPtAtt) * 100).toFixed(1) : '0.0'

  const threePtAtt = (s.threePointersMade || 0) + (s.threePointersMissed || 0)
  const threePct = threePtAtt > 0 ? (((s.threePointersMade || 0) / threePtAtt) * 100).toFixed(1) : '0.0'

  const ftAtt = (s.freeThrowsMade || 0) + (s.freeThrowsMissed || 0)
  const ftPct = ftAtt > 0 ? (((s.freeThrowsMade || 0) / ftAtt) * 100).toFixed(1) : '0.0'

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setView(selectedPlayer ? VIEWS.PLAYER_DETAIL : VIEWS.TEAM_DETAIL)} className="btn">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold text-white">Game Details</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 space-y-4">
          {/* Game Header */}
          <div className="text-center border-b pb-4">
            <div className="text-3xl font-bold text-blue-600 mb-2">{game.playerScore ?? s.points}</div>
            <div className="text-lg font-semibold">{game.playerName}</div>
            <div className="text-sm text-gray-600">
              {game.teamName} vs {game.opponent}
            </div>
            {game.teamScore !== undefined && game.opponentTeamScore !== undefined && (
              <div className="text-sm text-gray-600">
                Team Score: {game.teamScore} - {game.opponentTeamScore}
              </div>
            )}
            {game.result && (
              <span className={`inline-block mt-2 text-xs font-bold px-3 py-1 rounded ${
                game.result === 'win' ? 'bg-green-100 text-green-700' :
                game.result === 'loss' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {game.result.toUpperCase()}
              </span>
            )}
            <div className="text-xs text-gray-400 mt-2">{game.date} {game.time}</div>
          </div>

          {/* Stats Summary - Similar to Season Summary */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Game Stats</h3>

            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="p-2 bg-blue-50 rounded text-center">
                <div className="text-2xl font-bold text-blue-600">{s.points}</div>
                <div className="text-xs text-gray-600">PTS</div>
              </div>
              <div className="p-2 bg-purple-50 rounded text-center">
                <div className="text-2xl font-bold text-purple-600">{totalReb}</div>
                <div className="text-xs text-gray-600">REB</div>
              </div>
              <div className="p-2 bg-green-50 rounded text-center">
                <div className="text-2xl font-bold text-green-600">{s.assists || 0}</div>
                <div className="text-xs text-gray-600">AST</div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="p-2 bg-orange-50 rounded text-center">
                <div className="font-semibold text-orange-600">{fgPct}%</div>
                <div className="text-xs text-gray-600">FG%</div>
                <div className="text-xs text-gray-500">{fgMade}/{fgAtt}</div>
              </div>
              <div className="p-2 bg-orange-50 rounded text-center">
                <div className="font-semibold text-orange-600">{twoPct}%</div>
                <div className="text-xs text-gray-600">2PT%</div>
                <div className="text-xs text-gray-500">{s.twoPointersMade || 0}/{twoPtAtt}</div>
              </div>
              <div className="p-2 bg-orange-50 rounded text-center">
                <div className="font-semibold text-orange-600">{threePct}%</div>
                <div className="text-xs text-gray-600">3PT%</div>
                <div className="text-xs text-gray-500">{s.threePointersMade || 0}/{threePtAtt}</div>
              </div>
              <div className="p-2 bg-red-50 rounded text-center">
                <div className="font-semibold text-red-600">{ftPct}%</div>
                <div className="text-xs text-gray-600">FT%</div>
                <div className="text-xs text-gray-500">{s.freeThrowsMade || 0}/{ftAtt}</div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="font-semibold">{s.steals || 0}</div>
                <div className="text-xs text-gray-600">STL</div>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="font-semibold">{s.blocks || 0}</div>
                <div className="text-xs text-gray-600">BLK</div>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="font-semibold">{s.turnovers || 0}</div>
                <div className="text-xs text-gray-600">TO</div>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="font-semibold">{s.fouls || 0}</div>
                <div className="text-xs text-gray-600">PF</div>
              </div>
              <div className="p-2 bg-gray-50 rounded text-center">
                <div className="font-semibold">{formatTime(s.timePlayed || 0)}</div>
                <div className="text-xs text-gray-600">MIN</div>
              </div>
            </div>
          </div>

          {/* Collapsible Edit Section */}
          <div className="border-t pt-4">
            <button
              onClick={() => setShowEdit(!showEdit)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded transition-colors"
            >
              <span className="font-semibold">Edit Game</span>
              {showEdit ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>

            {showEdit && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Opponent</label>
                  <input
                    type="text"
                    value={editingGame.opponent}
                    onChange={e => setEditingGameLocal({ ...editingGame, opponent: e.target.value })}
                    className="input"
                    placeholder="Opponent name"
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-3 text-orange-600">Team & Player</div>

                  <div className="mb-3">
                    <label className="block text-sm font-semibold mb-1">Team</label>
                    <select
                      value={selectedTeamId}
                      onChange={e => {
                        setSelectedTeamId(e.target.value)
                        setSelectedPlayerId('')
                      }}
                      className="input mb-2"
                    >
                      <option value="">-- Select Team --</option>
                      {teams?.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTeamName}
                        onChange={e => setNewTeamName(e.target.value)}
                        placeholder="Or create new team"
                        className="input flex-1"
                      />
                      <button onClick={handleCreateTeam} className="btn">Create</button>
                    </div>
                  </div>

                  {selectedTeamId && (
                    <div>
                      <label className="block text-sm font-semibold mb-1">Player</label>
                      <select
                        value={selectedPlayerId}
                        onChange={e => setSelectedPlayerId(e.target.value)}
                        className="input mb-2"
                      >
                        <option value="">-- Select Player --</option>
                        {availablePlayers.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newPlayerName}
                          onChange={e => setNewPlayerName(e.target.value)}
                          placeholder="Or create new player"
                          className="input flex-1"
                        />
                        <button onClick={handleCreatePlayer} className="btn">Create</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-3 text-blue-600">Scores</div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">Player Score</div>
                      <input
                        type="number"
                        value={editingGame.playerScore ?? editingGame.stats?.points ?? 0}
                        className="input w-24 bg-gray-100"
                        disabled
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1">Team Score</div>
                      <input
                        type="number"
                        value={editingGame.teamScore ?? ''}
                        onChange={e => setEditingGameLocal({ ...editingGame, teamScore: parseInt(e.target.value || 0) })}
                        className="input w-24"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">Opponent Team Score</div>
                      <input
                        type="number"
                        value={editingGame.opponentTeamScore ?? ''}
                        onChange={e => setEditingGameLocal({ ...editingGame, opponentTeamScore: parseInt(e.target.value || 0) })}
                        className="input w-24"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm font-semibold mb-2">Stats</div>
                  {Object.keys(editingGame.stats).map(k => (
                    <div key={k} className="flex items-center gap-2 mb-2">
                      <div className="flex-1 capitalize text-sm">{k.replace(/([A-Z])/g, ' $1').trim()}</div>
                      <input
                        type="number"
                        value={editingGame.stats[k]}
                        onChange={e => setEditingGameLocal({ ...editingGame, stats: { ...editingGame.stats, [k]: parseInt(e.target.value || 0) } })}
                        className={`input w-24 ${k === 'points' ? 'bg-gray-100' : ''}`}
                        disabled={k === 'points'}
                      />
                    </div>
                  ))}
                </div>

                <button onClick={handleSave} className="w-full btn bg-blue-500 text-white">Save Changes</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
