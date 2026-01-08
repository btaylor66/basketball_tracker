import React from 'react'
import { ArrowLeft, User } from 'lucide-react'
import { VIEWS } from '../utils/constants'

export default function PlayersView ({ teams, setView, setSelectedTeam, setSelectedPlayer }) {
  // Collect all players from all teams
  const allPlayers = teams.flatMap(team =>
    team.players.map(player => ({
      ...player,
      teamId: team.id,
      teamName: team.name
    }))
  ).sort((a, b) => a.name.localeCompare(b.name))

  const handlePlayerClick = (player) => {
    const team = teams.find(t => t.id === player.teamId)
    if (team) {
      setSelectedTeam(team)
      setSelectedPlayer(player)
      setView(VIEWS.PLAYER_DETAIL)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setView(VIEWS.HOME)} className="btn">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold text-white">Players</h1>
          <div className="w-10"></div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          {allPlayers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No players yet. Create a team and add players to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {allPlayers.map(player => (
                <button
                  key={`${player.teamId}-${player.id}`}
                  onClick={() => handlePlayerClick(player)}
                  className="w-full text-left p-3 rounded hover:bg-gray-50 border border-gray-200 transition-colors"
                >
                  <div className="font-medium text-gray-900">{player.name}</div>
                  <div className="text-sm text-gray-500">({player.teamName})</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
