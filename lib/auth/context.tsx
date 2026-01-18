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
        // ============================================================
        // 🔥 ARQUITETURA HÍBRIDA - 2 FASES
        // FASE 1: Auth Rápido (NUNCA FALHA)
        // FASE 2: Enriquecimento (NÃO-BLOQUEANTE)
        // ============================================================

        // FASE 1: Get initial session - SIMPLE & FAST (always works)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
                // Extrair primeiro nome do email como fallback
                const emailName = session.user.email!.split('@')[0]
                const formattedName = emailName.charAt(0).toUpperCase() + emailName.slice(1)

                // Define usuário básico IMEDIATAMENTE
                const basicUser = {
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: formattedName,
                    is_professional: false,
                    role: 'user' as const
                }

                setUser(basicUser)
                setLoading(false) // ✅ UI já liberada - login não trava

                // FASE 2: Enriquecimento NÃO-BLOQUEANTE (com timeout)
                supabase.from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle()
                    .then(({ data, error }) => {
                        console.log('[Auth] Profile fetch result:', { data, error })

                        if (error) {
                            console.warn('[Auth] Profile fetch error:', error.message)
                            return
                        }

                        if (data) {
                            console.log('[Auth] Enriching user with profile:', data.full_name)
                            // Enriquecer com dados do banco
                            setUser({
                                ...basicUser,
                                full_name: data.full_name || basicUser.full_name,
                                role: data.role || 'user',
                                is_professional: data.role === 'professional',
                                pista: data.pista,
                                rota_number: data.rota_number,
                                avatar_url: data.avatar_url
                            })
                        }
                    })
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        // Listen for auth changes - SIMPLE VERSION (no profile fetch here)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (session?.user) {
                const basicUser = {
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.email!.split('@')[0],
                    is_professional: false,
                    role: 'user' as const
                }
                setUser(basicUser)

                // Enriquecimento assíncrono (não-bloqueante)
                Promise.race([
                    supabase.from('profiles')
                        .select('*')
                        .eq('id', session.user.id)
                        .maybeSingle(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 3000))
                ])
                    .then((result: any) => {
                        if (result?.data) {
                            setUser({
                                ...basicUser,
                                full_name: result.data.full_name || basicUser.full_name,
                                role: result.data.role || 'user',
                                is_professional: result.data.role === 'professional',
                                pista: result.data.pista,
                                rota_number: result.data.rota_number,
                                avatar_url: result.data.avatar_url
                            })
                        }
                    })
                    .catch(() => {
                        // Silently fail - basic user already set
                    })
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        console.log('🔑 signIn() chamado')
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        console.log('🔑 signInWithPassword retornou:', { error })
        if (error) {
            console.error('🔑 ERRO no Supabase:', error)
            throw new Error(error.message || 'Email ou senha incorretos')
        }
        console.log('🔑 Login bem-sucedido no Supabase!')
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
