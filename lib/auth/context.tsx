'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface User {
    id: string
    email: string
    full_name: string
    avatar_url?: string
    is_professional: boolean
    role?: 'admin' | 'user' | 'professional'
    pista?: string
    rota_number?: string
}

interface AuthContextType {
    user: User | null
    loading: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, fullName: string, cpf: string, pista: string, plan: string, rotaNumber?: string) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Get initial session - SIMPLE VERSION
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ? {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.email!.split('@')[0],
                is_professional: false,
                role: 'user'
            } : null)
            setLoading(false)
        })

        // Listen for auth changes - SIMPLE VERSION
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setUser(session?.user ? {
                id: session.user.id,
                email: session.user.email!,
                full_name: session.user.email!.split('@')[0],
                is_professional: false,
                role: 'user'
            } : null)
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw new Error(error.message || 'Email ou senha incorretos')
    }

    const signUp = async (email: string, password: string, fullName: string, cpf: string, pista: string, plan: string, rotaNumber?: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    cpf: cpf,
                    pista: pista,
                    plan: plan,
                    rota_number: rotaNumber,
                    role: rotaNumber ? 'professional' : 'user'
                }
            }
        })
        if (error) throw new Error(error.message)
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
