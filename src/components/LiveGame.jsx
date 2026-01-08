import React, { useState, useEffect } from 'react'
import { ArrowLeft, Play, Pause, History, X } from 'lucide-react'
import { formatTime } from '../utils/calculations'
import { KeepAwake } from '@capacitor-community/keep-awake'
import { Capacitor } from '@capacitor/core'
import { VIEWS } from '../utils/constants'

export default function LiveGame ({ currentGame, timeElapsed, setTimeElapsed, setCurrentGame, setView, setIsPlaying, isPlaying, updateStat, undoLast, saveFinishedGame, lastAction, transactions, deleteTransaction, updateGameInfo, teams }) {
  const isNative = Capacitor.isNativePlatform()

  // Keep screen awake during live game on native platforms
  useEffect(() => {
    if (isNative) {
      KeepAwake.keepAwake().catch(err => console.error('KeepAwake error:', err))

      return () => {
        KeepAwake.allowSleep().catch(err => console.error('AllowSleep error:', err))
      }
    }
  }, [])
  const [showHistory, setShowHistory] = useState(false)
  const [showScoreDialog, setShowScoreDialog] = useState(false)
  const [teamScore, setTeamScore] = useState('')
  const [opponentTeamScore, setOpponentTeamScore] = useState('')
  const [yourTeamName, setYourTeamName] = useState('')
  const [opponentTeamName, setOpponentTeamName] = useState('')
  const [playerNameInput, setPlayerNameInput] = useState('')
  const [showEditInfo, setShowEditInfo] = useState(false)
  const [editPlayerName, setEditPlayerName] = useState('')
  const [editOpponent, setEditOpponent] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [showEditTime, setShowEditTime] = useState(false)
  const [editTimeMinutes, setEditTimeMinutes] = useState('')
  const [editTimeSeconds, setEditTimeSeconds] = useState('')
  const s = currentGame?.stats || {}
  const totalRebounds = (s.offensiveRebounds || 0) + (s.defensiveRebounds || 0)
  const twoPointersMade = s.twoPointersMade || 0
  const twoPointersAttempted = (s.twoPointersMade || 0) + (s.twoPointersMissed || 0)
  const twoPtPct = twoPointersAttempted > 0 ? ((twoPointersMade / twoPointersAttempted) * 100).toFixed(0) : '0'
  const freeThrowsMade = s.freeThrowsMade || 0
  const freeThrowsAttempted = (s.freeThrowsMade || 0) + (s.freeThrowsMissed || 0)
  const ftPct = freeThrowsAttempted > 0 ? ((freeThrowsMade / freeThrowsAttempted) * 100).toFixed(0) : '0'

  const handleEndGame = () => {
    setTeamScore('')
    setOpponentTeamScore('')
    setYourTeamName(currentGame?.teamName || '')
    setOpponentTeamName(currentGame?.opponent || '')
    setPlayerNameInput(currentGame?.playerName || '')
    setShowScoreDialog(true)
  }

  const handleSaveGame = () => {
    const pScore = s.points || 0
    const tScore = parseInt(teamScore) || 0
    const oppTScore = parseInt(opponentTeamScore) || 0

    if (teamScore === '' || opponentTeamScore === '') {
      alert('Please enter both team scores')
      return
    }

    // For quick games, validate and handle either linking OR manual entry
    if (currentGame?.isQuickGame) {
      if (!opponentTeamName.trim()) {
        alert('Please enter opponent team name')
        return
      }

      // Check if linking to existing team/player
      if (selectedTeamId && selectedPlayerId) {
        // Using existing team/player - get names from them
        const team = teams.find(t => t.id === parseInt(selectedTeamId))
        const player = team?.players.find(p => p.id === parseInt(selectedPlayerId))
        if (team && player) {
          updateGameInfo(player.name, opponentTeamName.trim())
          saveFinishedGame(pScore, tScore, 0, oppTScore, parseInt(selectedTeamId), parseInt(selectedPlayerId))
        }
      } else {
        // Manual entry - validate names are provided
        if (!yourTeamName.trim() || !playerNameInput.trim()) {
          alert('Please enter player name and team name, or select an existing team/player')
          return
        }
        updateGameInfo(playerNameInput.trim(), opponentTeamName.trim())
        saveFinishedGame(pScore, tScore, 0, oppTScore, null, null)
      }
      setShowScoreDialog(false)
    } else {
      // Regular games just save
      saveFinishedGame(pScore, tScore, 0, oppTScore, null, null)
      setShowScoreDialog(false)
    }
  }

  const selectedTeam = teams.find(t => t.id === parseInt(selectedTeamId))
  const availablePlayers = selectedTeam?.players || []

  const handleEditInfo = () => {
    setEditPlayerName(currentGame?.playerName || '')
    setEditOpponent(currentGame?.opponent || '')
    setShowEditInfo(true)
  }

  const handleEditTime = () => {
    const minutes = Math.floor(timeElapsed / 60)
    const seconds = timeElapsed % 60
    setEditTimeMinutes(minutes.toString())
    setEditTimeSeconds(seconds.toString())
    setShowEditTime(true)
  }

  const handleSaveTime = () => {
    const minutes = parseInt(editTimeMinutes) || 0
    const seconds = parseInt(editTimeSeconds) || 0
    const totalSeconds = (minutes * 60) + seconds

    setTimeElapsed(totalSeconds)
    if (currentGame) {
      setCurrentGame({
        ...currentGame,
        stats: {
          ...currentGame.stats,
          timePlayed: totalSeconds
        }
      })
    }
    setShowEditTime(false)
  }

  const handleSaveInfo = () => {
    if (editPlayerName.trim() && editOpponent.trim()) {
      updateGameInfo(editPlayerName.trim(), editOpponent.trim())
      setShowEditInfo(false)
    } else {
      alert('Please enter both player name and opponent')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 to-red-600 p-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow p-4 sticky top-0">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => { setView(VIEWS.HOME); setIsPlaying(false) }} className="btn-ghost" title="Back to home (game will be saved)">
              <ArrowLeft />
            </button>
            <div className="text-center flex-1">
              <div className="font-semibold cursor-pointer hover:text-blue-600" onClick={currentGame?.isQuickGame ? handleEditInfo : undefined}>
                {currentGame?.playerName}
                {currentGame?.isQuickGame && <span className="text-xs ml-1">✏️</span>}
              </div>
              <div
                className="text-xs text-gray-500 cursor-pointer hover:text-blue-600"
                onClick={handleEditTime}
                title="Click to edit time"
              >
                {formatTime(timeElapsed)} ✏️
              </div>
            </div>
            <button onClick={() => setIsPlaying(p => !p)} className="btn-ghost">
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center">
            <div className="bg-blue-50 rounded p-2">
              <div className="text-xl font-bold text-blue-600">{s.points || 0}</div>
              <div className="text-xs text-gray-600">PTS</div>
            </div>
            <div className="bg-purple-50 rounded p-2">
              <div className="text-xl font-bold text-purple-600">{totalRebounds}</div>
              <div className="text-xs text-gray-600">REB</div>
            </div>
            <div className="bg-green-50 rounded p-2">
              <div className="text-xl font-bold text-green-600">{s.assists || 0}</div>
              <div className="text-xs text-gray-600">AST</div>
            </div>
            <div className="bg-orange-50 rounded p-2">
              <div className="text-lg font-bold text-orange-600">{twoPtPct}%</div>
              <div className="text-xs text-gray-600">2PT</div>
            </div>
            <div className="bg-red-50 rounded p-2">
              <div className="text-lg font-bold text-red-600">{ftPct}%</div>
              <div className="text-xs text-gray-600">FT</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4 mt-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="flex flex-col gap-2">
              <button onClick={() => updateStat('freeThrowsMade', 1)} className="btn-made">FT +</button>
              <button onClick={() => updateStat('freeThrowsMissed', 0)} className="btn-miss">FT -</button>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => updateStat('twoPointersMade', 2)} className="btn-made">2PT +</button>
              <button onClick={() => updateStat('twoPointersMissed', 0)} className="btn-miss">2PT -</button>
            </div>
            <div className="flex flex-col gap-2">
              <button onClick={() => updateStat('threePointersMade', 3)} className="btn-made">3PT +</button>
              <button onClick={() => updateStat('threePointersMissed', 0)} className="btn-miss">3PT -</button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => updateStat('offensiveRebounds', 0)} className="btn">OReb</button>
            <button onClick={() => updateStat('defensiveRebounds', 0)} className="btn">DReb</button>
            <button onClick={() => updateStat('assists', 0)} className="btn">Ast</button>
            <button onClick={() => updateStat('steals', 0)} className="btn">Stl</button>
            <button onClick={() => updateStat('blocks', 0)} className="btn">Blk</button>
            <button onClick={() => updateStat('turnovers', 0)} className="btn">TO</button>
            <button onClick={() => updateStat('fouls', 0)} className="btn">Foul</button>
          </div>

          <div className="mt-4 flex gap-2">
            <button onClick={undoLast} disabled={!lastAction} className="flex-1 btn disabled:opacity-50">Undo</button>
            <button onClick={() => setShowHistory(!showHistory)} className="flex-1 btn">{showHistory ? 'Hide' : 'History'}</button>
            <button onClick={handleEndGame} className="flex-1 btn-danger">End Game</button>
          </div>
          {lastAction && (
            <div className="mt-2 text-sm text-gray-600">
              Last: <span className="font-semibold">{lastAction.label}</span> ({lastAction.statTotal} total{lastAction.points > 0 ? `, ${lastAction.totalPoints} pts` : ''})
            </div>
          )}
        </div>

        {showHistory && (
          <div className="bg-white rounded-xl shadow p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Transaction History</h3>
              <button onClick={() => setShowHistory(false)} className="btn-ghost"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {transactions.length === 0 ? (
                <div className="text-center text-gray-400 py-4">No transactions yet</div>
              ) : (
                transactions.slice().reverse().map((t, idx) => (
                  <div key={t.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex-1">
                      <div className="font-semibold">{t.label} ({t.statTotal})</div>
                      <div className="text-xs text-gray-500">{formatTime(t.timestamp)} • {t.totalPoints} pts total</div>
                    </div>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="btn-sm danger ml-2"
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {showScoreDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-center">Final Score</h3>

              {currentGame?.isQuickGame && (
                <div className="mb-4 pb-4 border-b space-y-3">
                  {teams.length > 0 ? (
                    <>
                      <div className="text-xs font-semibold mb-2 text-orange-600">Link to Team & Player OR Enter Names</div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs mb-1">Team</label>
                          <select
                            value={selectedTeamId}
                            onChange={e => {
                              setSelectedTeamId(e.target.value)
                              setSelectedPlayerId('')
                            }}
                            className="input w-full text-sm"
                          >
                            <option value="">-- Or enter names below --</option>
                            {teams.map(t => (
                              <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                          </select>
                        </div>

                        {selectedTeamId && (
                          <div>
                            <label className="block text-xs mb-1">Player</label>
                            <select
                              value={selectedPlayerId}
                              onChange={e => setSelectedPlayerId(e.target.value)}
                              className="input w-full text-sm"
                            >
                              <option value="">-- Select Player --</option>
                              {availablePlayers.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {!selectedTeamId && (
                        <>
                          <div className="text-xs font-semibold mb-2 text-gray-500">Or enter names manually:</div>
                          <div>
                            <label className="block text-xs mb-1">Player Name</label>
                            <input
                              type="text"
                              value={playerNameInput}
                              onChange={e => setPlayerNameInput(e.target.value)}
                              className="input w-full"
                              placeholder="Player name"
                            />
                          </div>
                          <div>
                            <label className="block text-xs mb-1">Your Team Name</label>
                            <input
                              type="text"
                              value={yourTeamName}
                              onChange={e => setYourTeamName(e.target.value)}
                              className="input w-full"
                              placeholder="Team name"
                            />
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Player Name</label>
                        <input
                          type="text"
                          value={playerNameInput}
                          onChange={e => setPlayerNameInput(e.target.value)}
                          className="input w-full"
                          placeholder="Player name"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Your Team Name</label>
                        <input
                          type="text"
                          value={yourTeamName}
                          onChange={e => setYourTeamName(e.target.value)}
                          className="input w-full"
                          placeholder="Team name"
                        />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-xs font-semibold mb-1">Opponent Team Name</label>
                    <input
                      type="text"
                      value={opponentTeamName}
                      onChange={e => setOpponentTeamName(e.target.value)}
                      className="input w-full"
                      placeholder="Opponent team"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-blue-600">
                    {yourTeamName || currentGame?.teamName || 'Your Team'} Score
                  </label>
                  <input
                    type="number"
                    value={teamScore}
                    onChange={e => setTeamScore(e.target.value)}
                    className="input w-full text-center text-2xl font-bold"
                    placeholder="0"
                    autoFocus={!currentGame?.isQuickGame}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-orange-600">
                    {opponentTeamName || currentGame?.opponent || 'Opponent'} Score
                  </label>
                  <input
                    type="number"
                    value={opponentTeamScore}
                    onChange={e => setOpponentTeamScore(e.target.value)}
                    className="input w-full text-center text-2xl font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowScoreDialog(false)} className="flex-1 btn">Cancel</button>
                <button onClick={handleSaveGame} className="flex-1 btn bg-blue-500 text-white">Save Game</button>
              </div>
            </div>
          </div>
        )}

        {showEditInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-center">Edit Game Info</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Player Name</label>
                  <input
                    type="text"
                    value={editPlayerName}
                    onChange={e => setEditPlayerName(e.target.value)}
                    className="input w-full"
                    placeholder="Player name"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Opponent</label>
                  <input
                    type="text"
                    value={editOpponent}
                    onChange={e => setEditOpponent(e.target.value)}
                    className="input w-full"
                    placeholder="Opponent name"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowEditInfo(false)} className="flex-1 btn">Cancel</button>
                <button onClick={handleSaveInfo} className="flex-1 btn bg-blue-500 text-white">Save</button>
              </div>
            </div>
          </div>
        )}

        {showEditTime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-semibold mb-4 text-center">Edit Playing Time</h3>

              <div className="space-y-4">
                <div className="flex gap-2 items-center">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2">Minutes</label>
                    <input
                      type="number"
                      min="0"
                      value={editTimeMinutes}
                      onChange={e => setEditTimeMinutes(e.target.value)}
                      className="input w-full text-center text-xl"
                      placeholder="0"
                      autoFocus
                    />
                  </div>
                  <div className="text-2xl font-bold pt-6">:</div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold mb-2">Seconds</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={editTimeSeconds}
                      onChange={e => setEditTimeSeconds(e.target.value)}
                      className="input w-full text-center text-xl"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="text-xs text-gray-500 text-center">
                  Current time: {formatTime(timeElapsed)}
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button onClick={() => setShowEditTime(false)} className="flex-1 btn">Cancel</button>
                <button onClick={handleSaveTime} className="flex-1 btn bg-blue-500 text-white">Save</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
