import React from 'react'
import Sidebar from './components/Sidebar/Sidebar'
import Main from './components/Main/Main'
import ContextProvider from './context/Context'

const App = () => {
  return (
    <ContextProvider>
      <div className="app-layout">
        <Sidebar />
        <Main />
      </div>
    </ContextProvider>
  )
}

export default App