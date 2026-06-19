import React, { useState } from 'react'
import { useContext } from 'react'
import { Context } from '../../context/Context'
import './Auth.css'

const Auth = () => {
  const { login } = useContext(Context)
  const [name, setName] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }
    login(name)
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <div className="auth-logo">
          <span className="auth-logo-gradient">Gemini</span>
        </div>
        <h2>Welcome</h2>
        <p className="auth-sub">Enter your name to continue</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={e => { setName(e.target.value); setError("") }}
            autoFocus
            className="auth-input"
          />
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" className="auth-btn">Continue</button>
        </form>
      </div>
    </div>
  )
}

export default Auth