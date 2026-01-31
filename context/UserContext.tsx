'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type User = {
    name: string
    preferredLanguage: string
}

type UserContextType = {
    user: User | null
    login: (name: string, lang: string) => void
    logout: () => void
    isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Persist mock session
        const stored = localStorage.getItem('lingo_user')
        if (stored) {
            setUser(JSON.parse(stored))
        }
        setIsLoading(false)
    }, [])

    const login = (name: string, preferredLanguage: string) => {
        const newUser = { name, preferredLanguage }
        setUser(newUser)
        localStorage.setItem('lingo_user', JSON.stringify(newUser))
    }

    const logout = () => {
        setUser(null)
        localStorage.removeItem('lingo_user')
    }

    return (
        <UserContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </UserContext.Provider>
    )
}

export const useUser = () => {
    const context = useContext(UserContext)
    if (!context) throw new Error('useUser must be used within UserProvider')
    return context
}
