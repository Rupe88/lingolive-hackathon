'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Globe, Zap, Sparkles } from 'lucide-react'
import { T } from '@/components/LingoCompiler'
import { useUser } from '@/context/UserContext'
import { supabase } from '@/lib/supabaseClient'
import { lingo } from '@/lib/lingoMock'
import { translateTextServer, translateTextBatchServer } from '@/app/actions/lingo'

type Message = {
    id: number
    content: string
    original_language: string
    translations: Record<string, string>
    user_name: string
    created_at: string
}

export default function ChatRoom() {
    const { user } = useUser()
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isSending, setIsSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Demo Fallback: LocalStorage detection
    // If Supabase is invalid, we fallback to LocalStorage for cross-tab demo
    const useFallback = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')

    // Use Ref to track messages without triggering re-renders in useEffect
    const messagesRef = useRef(messages)
    useEffect(() => {
        messagesRef.current = messages
    }, [messages])

    useEffect(() => {
        // Initial Load
        if (useFallback) {
            const saved = localStorage.getItem('demo_messages')
            if (saved) setMessages(JSON.parse(saved))

            // Listen for cross-tab updates
            const handleStorage = (e: StorageEvent) => {
                if (e.key === 'demo_messages' && e.newValue) {
                    setMessages(JSON.parse(e.newValue))
                }
            }
            window.addEventListener('storage', handleStorage)
            return () => window.removeEventListener('storage', handleStorage)
        } else {
            // Real Supabase
            const fetchMessages = async () => {
                const { data } = await supabase
                    .from('messages')
                    .select('*')
                    .order('created_at', { ascending: true })
                if (data) setMessages(data)
            }
            fetchMessages()

            const channel = supabase
                .channel('chat-room')
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'messages' },
                    (payload) => {
                        // Realtime received!
                        const newMsg = payload.new as Message
                        // DEDUPLICATION:
                        // If the message is from ME, I already added it optimistically.
                        // Strictly ignore it here to prevent "double bubble".
                        const isFromMe = newMsg.user_name?.trim().toLowerCase() === user?.name?.trim().toLowerCase();
                        if (isFromMe) {
                            return;
                        }

                        setMessages((current) => {
                            // Double Safety: Check if the exact same message was just added
                            const last = current[current.length - 1];
                            const isDuplicate = last && (
                                last.id === newMsg.id ||
                                (last.content === newMsg.content && last.user_name === newMsg.user_name)
                            );

                            if (isDuplicate) return current;
                            return [...current, newMsg]
                        })
                    }
                )
                .subscribe((status) => {
                    if (status === 'SUBSCRIBED') {
                        console.log('✅ Connected to Realtime Chat');
                    }
                })

            // Fallback Polling (3s) to guarantee message delivery if sockets fail
            const interval = setInterval(() => {
                const currentMessages = messagesRef.current // Use Ref!
                const lastMsg = currentMessages[currentMessages.length - 1]
                if (!lastMsg) {
                    // Don't re-fetch everything blindly here to avoid overwrite loop
                    return
                }

                supabase
                    .from('messages')
                    .select('*')
                    .gt('created_at', lastMsg.created_at) // Only get newer messages
                    .order('created_at', { ascending: true })
                    .then(({ data }) => {
                        if (data && data.length > 0) {
                            // Filter out messages that are MINE (I have them optimistically via local state)
                            const myName = user?.name?.trim().toLowerCase();

                            // STRICT DEDUPLICATION:
                            // 1. Ignore messages from 'me' (Optimistic UI handles them)
                            // 2. Ignore messages we already have by ID (Socket might have caught them)
                            const currentIds = new Set(messagesRef.current.map(m => m.id))
                            const foreignMessages = data.filter(m =>
                                m.user_name?.trim().toLowerCase() !== myName &&
                                !currentIds.has(m.id)
                            )

                            if (foreignMessages.length > 0) {
                                setMessages((prev) => [...prev, ...foreignMessages])
                            }
                        }
                    })
            }, 3000)

            return () => {
                supabase.removeChannel(channel)
                clearInterval(interval)
            }
        }
    }, [useFallback, user?.name]) // REMOVED 'messages' from dependency array!

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // TTS Voice Loading Fix
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices()
            console.log("🗣️ Loaded Voices:", voices.length, voices.map(v => v.lang))
        }
        loadVoices()
        window.speechSynthesis.onvoiceschanged = loadVoices
    }, [])

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || !user) return

        if (!input.trim() || !user) return

        // setIsSending(true) -- Removed for speed! Non-blocking UI.
        const currentInput = input
        setInput('') // 1. Clear input IMMEDIATELY (Instant feel)

        const tempId = Date.now()

        // 2. Add to UI IMMEDIATELY (0ms Latency)
        // We initially add it without translations. The UI handles this fine (falls back to content).
        const optimisticMsg: Message = {
            id: tempId,
            content: currentInput,
            original_language: user.preferredLanguage,
            user_name: user.name,
            translations: {}, // Empty initially
            created_at: new Date().toISOString()
        }

        setMessages((prev) => [...prev, optimisticMsg])

        // 3. Perform Expensive Work (Translation) in Background
        const targets = ['en', 'es', 'fr', 'de', 'ja', 'ne']

        // Asynchronous processing - UI doesn't wait for this!
        translateTextBatchServer(currentInput, targets, user.preferredLanguage || 'en', 'Global Chat Message').then(async (translations) => {
            // 4. Update the message with translations once ready
            setMessages((current) => current.map(m =>
                m.id === tempId ? { ...m, translations } : m
            ))

            if (useFallback) {
                const updated = [...messages, { ...optimisticMsg, translations }]
                setMessages(updated)
                localStorage.setItem('demo_messages', JSON.stringify(updated))
                setIsSending(false)
            } else {
                // 5. Save to Supabase
                const { error } = await supabase.from('messages').insert({
                    content: currentInput,
                    original_language: user.preferredLanguage,
                    user_name: user.name,
                    translations: translations
                })
                if (error) console.error("Supabase error:", error)
                setIsSending(false)
            }
        })

        // Input cleared at start
        // setIsSending handled in async callback
    }

    if (!user) return <div className="text-gray-500">Please log in.</div>

    return (
        <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden shadow-2xl relative">
            {/* Header */}
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <Globe className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-white text-sm flex items-center gap-2">
                            <T>Global Chat</T>
                        </h2>
                        <span className="flex items-center gap-1 text-[10px] text-purple-300/80">
                            <Zap className="w-3 h-3" /> Powered by Lingo.dev
                        </span>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Viewing In</span>
                    <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {user.preferredLanguage.toUpperCase()}
                    </span>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 relative scroll-smooth">
                <AnimatePresence initial={false}>
                    {messages.map((msg) => {
                        const isMe = msg.user_name === user?.name
                        const prefLang = user?.preferredLanguage || 'en'
                        const translation = msg.translations?.[prefLang]
                        const displayContent = translation
                            ? (translation) // Removed [LANG] prefix for cleaner look, handled via UI color hint if needed
                            : msg.content

                        // If it's a translation, show a tiny indicator
                        const isTranslated = translation && translation !== msg.content;

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`max-w-[85%] relative group`}>

                                    <div className={`px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm transition-all duration-200 ${isMe
                                        ? 'glass-bubble-me text-white rounded-tr-sm'
                                        : 'glass-bubble-them text-gray-100 rounded-tl-sm'
                                        }`}>
                                        <p className="text-sm leading-relaxed">{displayContent}</p>
                                    </div>

                                    {/* Metadata / Timestamp */}
                                    <div className={`flex items-center gap-2 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span className="text-[10px] font-medium text-gray-500">
                                            {msg.user_name}
                                        </span>
                                        {isTranslated && !isMe && (
                                            <span className="text-[9px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
                                                <Sparkles className="w-2 h-2" /> Translated
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-600">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        {/* TEXT TO SPEECH (10/10 Feature) */}
                                        <button
                                            onClick={() => {
                                                const langMap: Record<string, string> = {
                                                    'es': 'es-ES', 'fr': 'fr-FR', 'de': 'de-DE', 'ja': 'ja-JP', 'ne': 'hi-IN', 'en': 'en-US'
                                                }
                                                const targetLang = langMap[user.preferredLanguage] || 'en-US'

                                                const utterance = new SpeechSynthesisUtterance(displayContent)
                                                utterance.lang = targetLang

                                                // CRITICAL FIX: Explicitly find a voice for this language
                                                // Otherwise English voice tries to read Kanji -> Silence
                                                const voices = window.speechSynthesis.getVoices()
                                                const specificVoice = voices.find(v => v.lang.includes(user.preferredLanguage) || v.lang === targetLang)

                                                if (specificVoice) {
                                                    utterance.voice = specificVoice
                                                } else {
                                                    console.warn(`No voice found for ${targetLang}. Trying default.`)
                                                    // Emergency: If user clicks listen and nothing happens, log it.
                                                    if (user.preferredLanguage === 'ja' && !specificVoice) {
                                                        alert("⚠️ Your browser doesn't have a Japanese Voice pack installed! Try Chrome or Edge.")
                                                        return
                                                    }
                                                }

                                                // Boost volume and rate for clarity
                                                utterance.volume = 1
                                                utterance.rate = 1

                                                window.speechSynthesis.cancel() // Stop any previous speech
                                                window.speechSynthesis.speak(utterance)
                                            }}
                                            className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded-full"
                                            title="Listen to translation"
                                        >
                                            <svg className="w-3 h-3 text-gray-400 hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-700/50 bg-black/20 backdrop-blur-md flex gap-3 items-end">
                <div className="flex-1 relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl opacity-20 group-focus-within:opacity-50 transition duration-300 blur"></div>
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Type a message to translate...`}
                        className="relative w-full bg-[#0a0a12] border border-gray-800 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all font-light"
                    />
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!input} // Only disable if input is empty. NEVER block on sending.
                    className="h-[46px] w-[46px] flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </motion.button>
            </form>
        </div>
    )
}
