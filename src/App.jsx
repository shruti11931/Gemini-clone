import React, { useEffect, useState, useContext } from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
import ContextProvider, { Context } from './context/Context'
import Skeleton from './components/Skeleton/Skeleton'
import Auth from './components/Auth/Auth'

const AppContent = () => {
  const { user } = useContext(Context)

  if (!user) return <Auth />

  return (
    <div className="app-layout">
      <Sidebar />
      <Main />
    </div>
  )
}

const App = () => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 600)
    return () => clearTimeout(timer)
  }, [])

  if (!isReady) {
    return <Skeleton />
  }

  return (
    <ContextProvider>
      <AppContent />
    </ContextProvider>
  )
}

export default App