import React, { useContext, useState } from 'react'
import './Sidebar.css'
import { assets } from '../../assets/assets'
import { Context } from '../../context/Context'
import Settings from '../Settings/Settings'
import Help from '../Help/Help';
import Activity from '../Activity/Activity'


const Sidebar = () => {
  const [extended, setExtended] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false);
  const [showActivity, setShowActivity] = useState(false)
  const { sessions, loadSession, newChat, darkMode, setDarkMode } = useContext(Context)

  return (
    <div className={`sidebar ${!extended ? 'collapsed' : ''}`}>
      <div className="top">
        <img
          onClick={() => setExtended(prev => !prev)}
          className='menu'
          src={assets.menu_icon}
          alt="menu"
        />
        <div onClick={newChat} className="new-chat">
          <img src={assets.plus_icon} alt="new chat" />
          {extended ? <p>New Chat</p> : null}
        </div>
        {extended && (
          <div className="recent">
            <p className='recent-title'>Recent</p>
            {sessions.map((session, index) => (
              <div
                key={index}
                onClick={() => loadSession(session)}
                className="recent-entry"
              >
                <img src={assets.message_icon} alt="" />
                <p>{session.title || session.prompt.slice(0, 20)}...</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bottom">
        {/* <div
          className="bottom-item recent-entry"
          onClick={() => setDarkMode(prev => !prev)}
          style={{ cursor: 'pointer' }}
        >
          <span style={{ fontSize: '18px', width: '20px', textAlign: 'center' }}>
            {darkMode ? '☀️' : '🌙'}
          </span>
          {extended ? <p>{darkMode ? 'Light mode' : 'Dark mode'}</p> : null}
        </div> */}

        <div className="bottom-item recent-entry" onClick={() => setShowHelp(true)}>
          <img src={assets.question_icon} alt="" />
          {extended ? <p>Help</p> : null}
        </div>
        <div className="bottom-item recent-entry" onClick={() => setShowActivity(true)}>
          <img src={assets.history_icon} alt="" />
          {extended ? <p>Activity</p> : null}
        </div>
        <div className="bottom-item recent-entry" onClick={() => setShowSettings(true)}>
          <img src={assets.setting_icon} alt="" />
          {extended ? <p>Settings</p> : null}
        </div>
      </div>

      {/* ← moved OUTSIDE bottom div, INSIDE sidebar div */}
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
      {showActivity && <Activity onClose={() => setShowActivity(false)} />}
      {showHelp && <Help onClose={() => setShowHelp(false)} />}


    </div>  // ← closes .sidebar
  )
}

export default Sidebar