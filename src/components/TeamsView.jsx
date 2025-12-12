import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function TeamsView ({ teams, setView, setSelectedTeam, deleteConfirmId, setDeleteConfirmId, deleteTeam, newTeamName, setNewTeamName, createTeam }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView('home')} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">Teams</h2>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {teams.length === 0 ? (
              <div className="text-center text-gray-400 py-4">No teams yet. Add one below!</div>
            ) : (
              teams.map(t => (
                <div key={t.id} className="border-2 border-orange-300 rounded flex items-center justify-between overflow-hidden bg-orange-50">
                  <div
                    onClick={() => { setSelectedTeam(t); setView('teamDetail') }}
                    className="flex-1 p-3 cursor-pointer hover:bg-orange-100 active:bg-orange-200"
                  >
                    <div className="font-semibold text-orange-900">{t.name}</div>
                    <div className="text-xs text-orange-600">{t.players.length} players</div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (deleteConfirmId === t.id) deleteTeam(t.id)
                      else { setDeleteConfirmId(t.id); setTimeout(() => setDeleteConfirmId(null), 3000) }
                    }}
                    className={`px-4 py-3 text-sm ${deleteConfirmId === t.id ? 'bg-red-600 text-white' : 'text-red-600'}`}
                  >
                    {deleteConfirmId === t.id ? 'Confirm?' : 'Delete'}
                  </button>
                </div>
              ))
            )}
          </div>
          <div className="mt-4">
            <input value={newTeamName} onChange={e => setNewTeamName(e.target.value)} placeholder="New team name" className="input" />
            <button onClick={() => { if (newTeamName.trim()) { createTeam(newTeamName.trim()); setNewTeamName('') } }} className="ml-2 btn">Add</button>
          </div>
        </div>
      </div>
    </div>
  )
}
