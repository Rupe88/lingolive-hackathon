'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, Save } from 'lucide-react'
import { T } from '@/components/LingoCompiler'
import { supabase } from '@/lib/supabaseClient'
import { useUser } from '@/context/UserContext'
import { LingoAuditor } from '@/components/LingoAuditor'

export default function DocumentEditor() {
    const { user } = useUser()
    const [content, setContent] = useState('')
    const [translations, setTranslations] = useState<Record<string, string>>({})
    // Channel Ref to reuse the connected socket
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
    // Demo Fallback: LocalStorage detection
    const useFallback = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
    const [status, setStatus] = useState('Saved')

    // Real-time synchronization
    useEffect(() => {
        if (!user || useFallback) return

        // 1. Initial Fetch
        const init = async () => {
            const { data, error } = await supabase
                .from('documents')
                .select('*')
                .eq('id', 1)
                .single()

            if (data) {
                setContent(data.content)
                setTranslations(data.translations as Record<string, string> || {})
            } else if (error?.code === 'PGRST116') {
                await supabase.from('documents').insert({ id: 1, content: '' })
            }

            // 2. JOIN CHANNEL (One time)
            if (!channelRef.current) {
                const channel = supabase.channel('room_doc_1', {
                    config: {
                        broadcast: { self: false } // We don't need to receive our own typing
                    }
                })

                channel
                    .on('broadcast', { event: 'typing' }, (event) => {
                        console.log('📨 Received:', event)
                        if (event.payload?.content !== undefined) {
                            setContent(event.payload.content)
                            setTranslations({}) // Clear translation to show live text
                        }
                    })
                    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'documents', filter: 'id=eq.1' }, (payload) => {
                        const newRow = payload.new as any
                        if (newRow.translations) {
                            setTranslations(newRow.translations)
                        }
                        // Optionally sync content if DB is newer/different
                    })
                    .subscribe((status) => {
                        console.log('🔌 Realtime Status:', status)
                    })

                channelRef.current = channel
            }
        }

        init()

        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
                channelRef.current = null
            }
        }
    }, [user, useFallback])

    // Debounce Ref
    const debounceTimer = useRef<NodeJS.Timeout | null>(null)

    const handleChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value
        setContent(newContent)
        setStatus('Saving...')

        if (useFallback) {
            localStorage.setItem('demo_doc', newContent)
            setTimeout(() => setStatus('Saved'), 500)
        } else {
            // 1. FAST: Broadcast using the ACTIVE channel
            if (channelRef.current) {
                await channelRef.current.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { content: newContent }
                })
            }

            // 2. SLOW: Save to DB (Debounced)
            if (debounceTimer.current) clearTimeout(debounceTimer.current)
            debounceTimer.current = setTimeout(async () => {
                const { error } = await supabase
                    .from('documents')
                    .upsert({
                        id: 1,
                        content: newContent,
                        translations: {} // CRITICAL: Clear old translations so viewers see real-time updates!
                    })

                if (!error) setStatus('Saved')
            }, 1000)
        }
    }

    // View Logic:
    const isViewer = user?.preferredLanguage !== 'en'
    // Check if we have a translation for the user's language
    const translatedText = translations && user && translations[user.preferredLanguage]

    return (
        <div className="flex flex-col h-full glass-panel rounded-xl overflow-hidden shadow-2xl relative">
            <div className="p-4 border-b border-gray-700/50 flex items-center justify-between bg-black/20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
                        <FileText className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="font-bold text-white text-sm">
                        <T>Project Plan</T>
                    </h2>
                </div>
                <span className={`text-xs flex items-center gap-1.5 px-2 py-1 rounded-full border ${status === 'Saved'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    }`}>
                    {status === 'Saved' ? <Save className="w-3 h-3" /> : <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />}
                    <span className="font-medium tracking-wide text-[10px] uppercase"><T>{status}</T></span>
                </span>
            </div>

            <div className="relative flex-1">
                <textarea
                    className="w-full h-full bg-[#0a0a12]/50 p-8 text-gray-200 focus:outline-none resize-none font-mono text-sm leading-7 selection:bg-purple-500/30"
                    // If I am a viewer and a translation exists, show it. Otherwise show raw content.
                    value={isViewer && translatedText ? translatedText : content}
                    onChange={handleChange}
                    // If viewing translation, make read-only
                    readOnly={!!(isViewer && translatedText)}
                    placeholder="Start typing your document..."
                    spellCheck={false}
                />

                {/* Lingo Auditor (Floating Top Right) */}
                <div className="absolute top-6 right-6 z-10 w-72 pointer-events-none hover:pointer-events-auto transition-opacity opacity-40 hover:opacity-100">
                    <LingoAuditor content={content} />
                </div>

                {/* Floating Translation Status Indicators */}
                {isViewer && !translatedText && content && (
                    <div className="absolute bottom-6 right-6 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="bg-yellow-500/10 backdrop-blur-md text-yellow-200 text-xs px-3 py-1.5 rounded-lg border border-yellow-500/20 shadow-lg flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                            Viewing Original (Waiting for Translation...)
                        </span>
                    </div>
                )}
                {isViewer && translatedText && (
                    <div className="absolute bottom-6 right-6 pointer-events-none animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="glass-bubble-me text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 shadow-lg flex items-center gap-2">
                            <div className="bg-white/20 p-1 rounded-full">
                                <FileText className="w-3 h-3" />
                            </div>
                            Reading in {user.preferredLanguage.toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    )
}
