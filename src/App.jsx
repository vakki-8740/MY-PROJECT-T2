import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header.jsx'
import Home from './pages/Home.jsx'
import TicketForm from './pages/TicketForm.jsx'
import Chat from './pages/Chat.jsx'
import { trackPresence } from './lib/db.js'

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    trackPresence()
  }, [])

  return (
    <div className="app">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/deposit" element={<TicketForm type="deposit" />} />
        <Route path="/withdrawal" element={<TicketForm type="withdrawal" />} />
        <Route path="/email-verification" element={<TicketForm type="email" />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <footer className="footer">Lucky Star Help Center - 24x7 Support</footer>
    </div>
  )
}
