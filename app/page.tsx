'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/context/UserContext'
import { languages } from '@/lib/lingoMock'

export default function Home() {
  const [name, setName] = useState('')
  const [lang, setLang] = useState('en')
  const { login } = useUser()
  const router = useRouter()

  // Auto-redirect if already logged in (Persistent Session)
  useEffect(() => {
    // Check LocalStorage directly to avoid flicker
    const stored = localStorage.getItem('lingo_user')
    if (stored) {
      router.push('/workspace')
    }
  }, [router])

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    login(name, lang)
    router.push('/workspace')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white p-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-purple-500/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            LingoLive
          </h1>
          <p className="text-gray-400 text-center mb-8">
            Collaborate in any language.
          </p>

          <form onSubmit={handleJoin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">
                Display Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="language" className="text-sm font-medium text-gray-300">
                I speak...
              </label>
              <div className="grid grid-cols-2 gap-2">
                {languages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => setLang(l.code)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all ${lang === l.code
                      ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                      : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-gray-700'
                      }`}
                  >
                    <span className="text-lg">{l.flag}</span>
                    <span className="font-medium">{l.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
            >
              Join Workspace
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
