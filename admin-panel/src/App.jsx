import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tickets from './pages/Tickets.jsx'
import Chat from './pages/Chat.jsx'
import Settings from './pages/Settings.jsx'
import { watchAuth, adminLogout } from './lib/db.js'

export default function App() {
  const [user, setUser] = useState(null)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const unsub = watchAuth((u) => {
      setUser(u)
      setChecking(false)
    })
    return () => unsub()
  }, [])

  if (checking) {
    return <main className="login-page"><p className="admin-empty">Loading...</p></main>
  }

  if (!user) {
    // Firebase onAuthStateChanged (watchAuth) updates state after login succeeds.
    return <Login onLogin={() => {}} />
  }

  return (
    <div className="app">
      <Header email={user.email} onLogout={() => adminLogout().catch(() => {})} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}
