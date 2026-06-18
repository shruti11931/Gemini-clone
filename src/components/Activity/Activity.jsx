import React, { useContext, useState } from 'react'
import { Context } from '../../context/Context'
import './Activity.css'

const groupByDate = (sessions) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  const week = new Date(today); week.setDate(today.getDate() - 7)

  const groups = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] }

  sessions.forEach((session, index) => {
    const d = session.timestamp ? new Date(session.timestamp) : new Date(0)
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    if (day >= today) groups['Today'].push({ ...session, index })
    else if (day >= yesterday) groups['Yesterday'].push({ ...session, index })
    else if (day >= week) groups['Last 7 Days'].push({ ...session, index })
    else groups['Older'].push({ ...session, index })
  })

  return groups
}

const Activity = ({ onClose }) => {
  const { sessions, setSessions, loadSession } = useContext(Context)
  const [search, setSearch] = useState('')
  const [confirmClearAll, setConfirmClearAll] = useState(false)

  const handleDelete = (index) => {
    setSessions(prev => {
      const updated = prev.filter((_, i) => i !== index)
      localStorage.setItem('chatSessions', JSON.stringify(updated))
      return updated
    })
  }

  const handleClearAll = () => {
    if (confirmClearAll) {
      setSessions([])
      localStorage.removeItem('chatSessions')
      setConfirmClearAll(false)
    } else {
      setConfirmClearAll(true)
    }
  }

  const filtered = sessions.filter(s =>
    s.prompt.toLowerCase().includes(search.toLowerCase())
  )

  const groups = groupByDate(filtered)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box activity-box" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h2>Activity</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Search */}
        <div className="activity-search">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {/* Clear All */}
        {sessions.length > 0 && (
          <div className="activity-clear-row">
            <button
              className={`clear-btn ${confirmClearAll ? 'confirm' : ''}`}
              onClick={handleClearAll}
            >
              {confirmClearAll ? '⚠️ Confirm clear all?' : '🗑️ Clear All History'}
            </button>
          </div>
        )}

        {/* Sessions List */}
        <div className="activity-list">
          {filtered.length === 0 ? (
            <div className="activity-empty">
              {search ? 'No results found' : 'No conversations yet'}
            </div>
          ) : (
            Object.entries(groups).map(([group, items]) =>
              items.length > 0 ? (
                <div key={group}>
                  <p className="activity-group-title">{group}</p>
                  {items.map((session) => (
                    <div key={session.index} className="activity-item">
                      <div
                        className="activity-item-content"
                        onClick={() => { loadSession(session); onClose() }}
                      >
                        <p className="activity-prompt">{session.prompt}</p>
                        <p className="activity-meta">
                          {session.timestamp
                            ? new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'No time'}
                          {' · '}
                          {session.response
                            ? session.response.replace(/<[^>]+>/g, '').slice(0, 60) + '...'
                            : 'No response'}
                        </p>
                      </div>
                      <button
                        className="activity-delete"
                        onClick={() => handleDelete(session.index)}
                        title="Delete"
                      >🗑️</button>
                    </div>
                  ))}
                </div>
              ) : null
            )
          )}
        </div>

      </div>
    </div>
  )
}

export default Activity