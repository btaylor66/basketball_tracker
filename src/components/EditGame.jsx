import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { VIEWS, parseId } from '../utils/constants'

export default function EditGame ({ editingGame, setEditingGame, saveEditedGame, selectedPlayer, setView, teams, createTeam, addPlayer }) {
  const [newTeamName, setNewTeamName] = useState('')
  const [newPlayerName, setNewPlayerName] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState(editingGame?.teamId || '')
  const [selectedPlayerId, setSelectedPlayerId] = useState(editingGame?.playerId || '')

  const selectedTeam = teams?.find(t => t.id === parseId(selectedTeamId))
  const availablePlayers = selectedTeam?.players || []
  const isQuickGame = editingGame?.isQuickGame

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
        setEditingGame({
          ...editingGame,
          teamId,
          playerId,
          teamName: team.name,
          playerName: player.name,
          isQuickGame: false
        })
      }
    }
    saveEditedGame()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView(selectedPlayer ? VIEWS.PLAYER_DETAIL : VIEWS.TEAM_DETAIL)} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">Edit Game</h2>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {editingGame && (
              <>
                <div className="mb-4 pb-3 border-b">
                  <label className="block text-sm font-semibold mb-1">Opponent</label>
                  <input
                    type="text"
                    value={editingGame.opponent}
                    onChange={e => setEditingGame({ ...editingGame, opponent: e.target.value })}
                    className="input"
                    placeholder="Opponent name"
                  />
                </div>

                <div className="mb-4 pb-3 border-b">
                  <div className="text-sm font-semibold mb-3 text-orange-600">Team & Player</div>

                    {/* Team Selection */}
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

                    {/* Player Selection */}
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

                <div className="mb-4 pb-3 border-b">
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
                        onChange={e => setEditingGame({ ...editingGame, teamScore: parseInt(e.target.value || 0) })}
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
                        onChange={e => setEditingGame({ ...editingGame, opponentTeamScore: parseInt(e.target.value || 0) })}
                        className="input w-24"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-sm font-semibold mb-2">Stats</div>
                {Object.keys(editingGame.stats).map(k => (
                  <div key={k} className="flex items-center gap-2">
                    <div className="flex-1 capitalize">{k}</div>
                    <input
                      type="number"
                      value={editingGame.stats[k]}
                      onChange={e => setEditingGame({ ...editingGame, stats: { ...editingGame.stats, [k]: parseInt(e.target.value || 0) } })}
                      className={`input w-24 ${k === 'points' ? 'bg-gray-100' : ''}`}
                      disabled={k === 'points'}
                    />
                  </div>
                ))}
                <div className="flex gap-2 mt-3">
                  <button onClick={handleSave} className="btn w-full">Save</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
