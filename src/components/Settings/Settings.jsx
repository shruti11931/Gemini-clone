import React, { useContext, useState } from 'react'
import { Context } from '../../context/Context'
import './Settings.css'

const Settings = ({ onClose }) => {
    const { darkMode, setDarkMode, sessions, setSessions } = useContext(Context)
    const [fontSize, setFontSize] = useState(
        localStorage.getItem('fontSize') || 'medium'
    )
    const [confirmClear, setConfirmClear] = useState(false)

    const handleFontSize = (size) => {
        setFontSize(size)
        localStorage.setItem('fontSize', size)
        document.documentElement.setAttribute('data-font', size)
    }


    const handleClearHistory = () => {
        if (confirmClear) {
            setSessions([])
            localStorage.removeItem('chatSessions')
            setConfirmClear(false)
        } else {
            setConfirmClear(true)
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Settings</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                {/* Dark Mode */}
                <div className="setting-row">
                    <div>
                        <p className="setting-label">Appearance</p>
                        <p className="setting-sub">Switch between light and dark theme</p>
                    </div>
                    <div className="toggle-group">
                        <button
                            className={`toggle-btn ${!darkMode ? 'active' : ''}`}
                            onClick={() => setDarkMode(false)}
                        >☀️ Light</button>
                        <button
                            className={`toggle-btn ${darkMode ? 'active' : ''}`}
                            onClick={() => setDarkMode(true)}
                        >🌙 Dark</button>
                    </div>
                </div>

                {/* Font Size */}
                <div className="setting-row">
                    <div>
                        <p className="setting-label">Font Size</p>
                        <p className="setting-sub">Adjust text size across the app</p>
                    </div>
                    <div className="toggle-group">
                        {['small', 'medium', 'large'].map(size => (
                            <button
                                key={size}
                                className={`toggle-btn ${fontSize === size ? 'active' : ''}`}
                                onClick={() => handleFontSize(size)}
                            >{size.charAt(0).toUpperCase() + size.slice(1)}</button>
                        ))}
                    </div>
                </div>

                {/* Clear History */}
                <div className="setting-row">
                    <div>
                        <p className="setting-label">Chat History</p>
                        <p className="setting-sub">Permanently delete all conversations</p>
                    </div>
                    <button
                        className={`clear-btn ${confirmClear ? 'confirm' : ''}`}
                        onClick={handleClearHistory}
                    >
                        {confirmClear ? '⚠️ Confirm?' : '🗑️ Clear All'}
                    </button>
                </div>

            </div>
        </div>
    )
}

export default Settings