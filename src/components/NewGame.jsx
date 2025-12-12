import React from 'react'
import { ArrowLeft } from 'lucide-react'

export default function NewGame ({ teams, formData, setFormData, startNewGame, setView }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => setView('home')} className="btn-ghost"><ArrowLeft /></button>
            <h2 className="text-lg font-semibold">New Game</h2>
            <div className="w-8" />
          </div>
          <div className="space-y-2">
            <select className="input" value={formData.teamId} onChange={e => setFormData({ ...formData, teamId: e.target.value, playerId: '' })}>
              <option value="">Select team</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select className="input" value={formData.playerId} onChange={e => setFormData({ ...formData, playerId: e.target.value })}>
              <option value="">Select player</option>
              {(teams.find(t => t.id === parseInt(formData.teamId))?.players || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input className="input" value={formData.opponent} onChange={e => setFormData({ ...formData, opponent: e.target.value })} placeholder="Opponent" />
            <div className="flex gap-2">
              <input type="date" className="input flex-1" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
              <input type="time" className="input" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} />
            </div>
            <button onClick={() => { if (formData.teamId && formData.playerId) startNewGame(formData) }} className="btn w-full">Start</button>
          </div>
        </div>
      </div>
    </div>
  )
}
