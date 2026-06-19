import React, { useContext, useEffect, useRef, useState } from 'react'
import { Context } from '../../context/Context'
import { assets } from '../../assets/assets'
import './Conversation.css'

const Conversation = () => {
    const {
        messages, loading, isGenerating,
        regenerateResponse, editAndResend,
        user,   
    } = useContext(Context)

    const getInitials = (name) => {
        if (!name) return "?"
        const parts = name.trim().split(" ")
        return parts.length > 1
            ? (parts[0][0] + parts[1][0]).toUpperCase()
            : parts[0][0].toUpperCase()
    }

    const [feedback, setFeedbackLocal] = useState(null)
    const [copied, setCopied] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [editText, setEditText] = useState("")
    const bottomRef = useRef(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, loading])

    const handleCopy = (content) => {
        const plain = content.replace(/<[^>]+>/g, '')
        navigator.clipboard.writeText(plain)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="conversation">
            {messages.map((msg, idx) => {
                const isLastAssistant =
                    msg.role === 'assistant' && idx === messages.length - 1

                return (
                    <div key={msg.id} className={`msg-row ${msg.role}`}>
                        {msg.role === 'user' ? (
                            <div className="user-row">
                                <div className="msg-avatar nav-avatar">{getInitials(user?.name)}</div>
                                <div className="user-bubble">
                                    {msg.imagePreview && (
                                        <img src={msg.imagePreview} alt="uploaded" className="msg-image" />
                                    )}
                                    {editingId === msg.id ? (
                                        <div className="edit-inline">
                                            <input
                                                value={editText}
                                                onChange={e => setEditText(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        setEditingId(null)
                                                        editAndResend(editText)
                                                    }
                                                    if (e.key === 'Escape') setEditingId(null)
                                                }}
                                                autoFocus
                                                className="edit-input"
                                            />
                                            <div className="edit-btns">
                                                <button onClick={() => { setEditingId(null); editAndResend(editText) }}>✅</button>
                                                <button onClick={() => setEditingId(null)}>✕</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p
                                            onClick={() => { setEditText(msg.content); setEditingId(msg.id) }}
                                            title="Click to edit"
                                        >
                                            {msg.content}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="assistant-row">
                                <img src={assets.gemini_icon} className="msg-avatar" alt="" />
                                <div className="assistant-bubble">
                                    <p dangerouslySetInnerHTML={{ __html: msg.content }} />
                                    {isLastAssistant && !loading && (
                                        <div className="msg-actions">
                                            <button onClick={() => handleCopy(msg.content)} title="Copy">
                                                {copied ? '✅' : '📋'}
                                            </button>
                                            <button onClick={regenerateResponse} title="Regenerate">🔄</button>
                                            <button
                                                onClick={() => setFeedbackLocal(p => p === 'up' ? null : 'up')}
                                                style={{ opacity: feedback === 'up' ? 1 : 0.7, color: feedback === 'up' ? '#1a73e8' : 'inherit' }}
                                            >👍</button>
                                            <button
                                                onClick={() => setFeedbackLocal(p => p === 'down' ? null : 'down')}
                                                style={{ opacity: feedback === 'down' ? 1 : 0.7, color: feedback === 'down' ? '#e53935' : 'inherit' }}
                                            >👎</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )
            })}

            {/* Loader for in-flight response */}
            {loading && (
                <div className="assistant-row">
                    <img src={assets.gemini_icon} className="msg-avatar" alt="" />
                    <div className="loader">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    )
}

export default Conversation