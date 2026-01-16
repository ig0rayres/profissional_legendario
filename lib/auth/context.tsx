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
        // Get initial session - SAFE VERSION with profile fetch
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session?.user) {
                try {
                    // Try to fetch profile but DON'T block if it fails
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle()

                    setUser(profile ? {
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: profile.full_name || session.user.email!.split('@')[0],
                        is_professional: profile.role === 'professional',
                        role: profile.role || 'user',
                        pista: profile.pista
                    } : {
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.email!.split('@')[0],
                        is_professional: false,
                        role: 'user'
                    })
                } catch (error) {
                    // Even if profile fetch fails, create basic user
                    console.warn('Profile fetch failed, using basic user:', error)
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.email!.split('@')[0],
                        is_professional: false,
                        role: 'user'
                    })
                }
                setLoading(false)
            } else {
                setLoading(false)
            }
        })

        // Listen for auth changes - SAFE VERSION with profile fetch
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                try {
                    // Try to fetch profile but DON'T block
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle()

                    setUser(profile ? {
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: profile.full_name || session.user.email!.split('@')[0],
                        is_professional: profile.role === 'professional',
                        role: profile.role || 'user',
                        pista: profile.pista
                    } : {
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.email!.split('@')[0],
                        is_professional: false,
                        role: 'user'
                    })
                } catch (error) {
                    console.warn('Profile fetch failed in auth state change:', error)
                    setUser({
                        id: session.user.id,
                        email: session.user.email!,
                        full_name: session.user.email!.split('@')[0],
                        is_professional: false,
                        role: 'user'
                    })
                }
            } else {
                setUser(null)
            }
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
