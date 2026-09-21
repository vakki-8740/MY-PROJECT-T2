import React, { useState } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Tickets from './pages/Tickets.jsx'
import Chat from './pages/Chat.jsx'
import Settings from './pages/Settings.jsx'

function isLoggedIn() {
  return localStorage.getItem('lucky_admin_token') === '1'
}

export default function App() {
  const [token, setToken] = useState(isLoggedIn())
  const navigate = useNavigate()

  const onLogin = () => {
    localStorage.setItem('lucky_admin_token', '1')
    setToken(true)
    navigate('/')
  }

  const onLogout = () => {
    localStorage.removeItem('lucky_admin_token')
    setToken(false)
    navigate('/login')
  }

  if (!token) {
    return <Login onLogin={onLogin} />
  }

  return (
    <div className="app">
      <Header onLogout={onLogout} />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
