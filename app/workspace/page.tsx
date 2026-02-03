'use client'

import { useUser } from '@/context/UserContext'
import ChatRoom from '@/components/ChatRoom'
import DocumentEditor from '@/components/DocumentEditor'
import FileHub from '@/components/FileHub'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FileText, Folder } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function Workspace() {
    const { user, isLoading } = useUser()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'document' | 'files'>('document')
    const [onlineCount, setOnlineCount] = useState(1); // Default to 1 (Me)

    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/')
        }
    }, [user, isLoading, router])

    /* Realtime User Count */
    useEffect(() => {
        if (!user) return;

        // Use Supabase Presence to track connected users in the 'global' room
        const room = supabase.channel('global_presence', {
            config: {
                presence: {
                    key: user.name,
                },
            },
        })

        room
            .on('presence', { event: 'sync' }, () => {
                const newState = room.presenceState()
                // Simple count of unique keys (or total connections)
                const count = Object.keys(newState).length
                setOnlineCount(count > 0 ? count : 1)
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await room.track({
                        online_at: new Date().toISOString(),
                        user: user.name
                    })
                }
            })

        return () => {
            supabase.removeChannel(room)
        }
    }, [user])

    if (isLoading) return (
        <div className="h-screen w-screen bg-[#030014] flex items-center justify-center text-white">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-white rounded-full animate-spin"></div>
        </div>
    )

    if (!user) return null

    return (
        <div className="flex flex-col h-[100dvh] bg-[#030014] overflow-hidden">
            {/* Navbar - Fixed to Top */}
            <header className="fixed top-0 left-0 right-0 h-16 border-b border-gray-800 flex items-center justify-between px-6 bg-gray-950/80 backdrop-blur-md z-[100]">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🌍</span>
                    <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        LingoLive
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    {/* Live Users Badge */}
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] font-medium text-green-400 uppercase tracking-widest">
                            {onlineCount} Online
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20">
                            {user.name[0]?.toUpperCase()}
                        </div>
                        <div className="hidden sm:block text-sm">
                            <p className="text-white leading-none font-medium">{user.name}</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-wide mt-0.5 flex items-center gap-1">
                                Speaking
                                <span className="text-sm">
                                    {{
                                        'en': '🇺🇸',
                                        'es': '🇪🇸',
                                        'fr': '🇫🇷',
                                        'de': '🇩🇪',
                                        'ja': '🇯🇵',
                                        'ne': '🇳🇵'
                                    }[user.preferredLanguage]}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Grid - Added Padding for Fixed Header */}
            <main className="flex-1 pt-20 pb-4 px-6 grid grid-cols-12 gap-6 min-h-0 h-full">
                {/* Main Content Area (8 cols) */}
                <div className="col-span-12 lg:col-span-8 h-full min-h-0 flex flex-col gap-4">
                    {/* Feature Tabs */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setActiveTab('document')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'document' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                }`}
                        >
                            <FileText className="w-4 h-4" /> Document Editor
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'files' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20' : 'bg-gray-800/50 text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                                }`}
                        >
                            <Folder className="w-4 h-4" /> File Hub (Drag & Drop)
                        </button>
                    </div>

                    <div className="flex-1 min-h-0">
                        {activeTab === 'document' ? <DocumentEditor /> : <FileHub />}
                    </div>
                </div>

                {/* Chat Sidebar (4 cols) - Always visible */}
                <div className="col-span-12 lg:col-span-4 h-full min-h-0 pt-[52px]"> {/* Align with tabs */}
                    <ChatRoom />
                </div>
            </main>
        </div>
    )
}
