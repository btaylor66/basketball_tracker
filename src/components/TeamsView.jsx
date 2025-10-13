import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function TeamsView ({ teams, setView, setSelectedTeam, deleteConfirmId, setDeleteConfirmId, deleteTeam, newTeamName, setNewTeamName, createTeam }) {
  return (
    <div className="h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-start overflow-hidden">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView('home')} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">Teams</h2>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            {teams.map(t => (
              <div key={t.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-semibold">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.players.length} players</div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => { setSelectedTeam(t); setView('teamDetail') }} className="btn-sm">Open</button>
                  <button onClick={() => {
                    if (deleteConfirmId === t.id) deleteTeam(t.id)
                    else { setDeleteConfirmId(t.id); setTimeout(() => setDeleteConfirmId(null), 3000) }
                  }} className={`btn-sm ${deleteConfirmId === t.id ? 'danger' : ''}`}>{deleteConfirmId === t.id ? 'Confirm?' : 'Delete'}</button>
                </div>
              </div>
            ))}
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
