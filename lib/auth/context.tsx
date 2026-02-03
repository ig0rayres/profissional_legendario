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
    signIn: (email: string, password: string) => Promise<{ id: string; email: string | undefined; role: string; full_name: string } | null>
    signUp: (email: string, password: string, fullName: string, cpf: string, pista: string, plan: string, rotaNumber?: string) => Promise<{ user: any; needsCheckout: boolean; planId: string }>
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

                // Define usuário básico IMEDIATAMENTE (sem role para aguardar enriquecimento)
                const basicUser = {
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: formattedName,
                    is_professional: false,
                    role: undefined as 'admin' | 'user' | 'professional' | undefined
                }

                setUser(basicUser as any)
                // NÃO setamos loading como false aqui para admins - aguarda o role

                // FASE 2: Enriquecimento NÃO-BLOQUEANTE (com timeout)
                supabase.from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle()
                    .then(({ data, error }) => {
                        console.log('[Auth] Profile fetch result:', { data, error })

                        if (error) {
                            console.warn('[Auth] Profile fetch error:', error.message)
                            setLoading(false) // Libera mesmo com erro
                            return
                        }

                        // FALLBACK: Se não existe perfil, criar automaticamente
                        if (!data) {
                            console.log('[Auth] 🚨 Perfil não existe! Criando via fallback...')
                            const meta = session.user.user_metadata || {}
                            fetch('/api/profile/ensure', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: session.user.id,
                                    email: session.user.email,
                                    fullName: meta.full_name,
                                    cpf: meta.cpf,
                                    role: meta.role,
                                    rotaNumber: meta.rota_number,
                                    pistaId: meta.pista,
                                    plan: meta.plan
                                })
                            })
                                .then(res => res.json())
                                .then(async result => {
                                    console.log('[Auth] ✅ Perfil criado via fallback:', result)
                                    // Registrar indicação - tenta localStorage primeiro, depois cookie
                                    const refCode = localStorage.getItem('referral_code')
                                    await fetch('/api/referral/register', {
                                        method: 'POST',
                                        credentials: 'include',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ referralCode: refCode })
                                    }).then(() => {
                                        if (refCode) localStorage.removeItem('referral_code')
                                    }).catch(() => { })
                                    // Recarregar a página para buscar o perfil criado
                                    window.location.reload()
                                })
                                .catch(err => {
                                    console.error('[Auth] ❌ Erro no fallback:', err)
                                    setLoading(false)
                                })
                            return
                        }

                        if (data) {
                            console.log('[Auth] Enriching user with profile:', data.full_name, 'role:', data.role)
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

                            // Registrar indicação - tenta localStorage primeiro, depois cookie
                            const refCode = localStorage.getItem('referral_code')
                            fetch('/api/referral/register', {
                                method: 'POST',
                                credentials: 'include',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ referralCode: refCode })
                            })
                                .then(res => res.json())
                                .then(result => {
                                    if (result.success) {
                                        console.log('[Auth] Indicação registrada:', result.message)
                                        if (refCode) localStorage.removeItem('referral_code')
                                    }
                                })
                                .catch(err => console.warn('[Auth] Erro ao registrar indicação:', err))
                        }
                        setLoading(false) // Libera após enriquecer
                    })
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            console.log('[Auth] onAuthStateChange:', event)

            if (session?.user) {
                const basicUser = {
                    id: session.user.id,
                    email: session.user.email!,
                    full_name: session.user.email!.split('@')[0],
                    is_professional: false,
                    role: undefined as 'admin' | 'user' | 'professional' | undefined
                }
                setUser(basicUser as any)

                // Enriquecimento - AGUARDA para pegar o role real
                supabase.from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .maybeSingle()
                    .then(({ data, error }) => {
                        if (data) {
                            console.log('[Auth] onAuthStateChange - enriched with role:', data.role)
                            setUser({
                                ...basicUser,
                                full_name: data.full_name || basicUser.full_name,
                                role: data.role || 'user',
                                is_professional: data.role === 'professional',
                                pista: data.pista,
                                rota_number: data.rota_number,
                                avatar_url: data.avatar_url
                            })

                            // Registrar indicação se houver cookie de referral (SIGNED_IN = novo login)
                            if (event === 'SIGNED_IN') {
                                fetch('/api/referral/register', { method: 'POST' })
                                    .then(res => res.json())
                                    .then(result => {
                                        if (result.success) {
                                            console.log('[Auth] Indicação registrada:', result.message)
                                        }
                                    })
                                    .catch(err => console.warn('[Auth] Erro ao registrar indicação:', err))
                            }
                        }
                        setLoading(false)
                    })
            } else {
                setUser(null)
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    const signIn = async (email: string, password: string) => {
        console.log('🔑 signIn() chamado')
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })
        console.log('🔑 signInWithPassword retornou:', { error })
        if (error) {
            console.error('🔑 ERRO no Supabase:', error)
            throw new Error(error.message || 'Email ou senha incorretos')
        }
        console.log('🔑 Login bem-sucedido no Supabase!')

        // Buscar dados do perfil para retornar role
        if (authData.user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name')
                .eq('id', authData.user.id)
                .single()

            return {
                id: authData.user.id,
                email: authData.user.email,
                role: profile?.role || 'user',
                full_name: profile?.full_name
            }
        }

        return null
    }

    const signUp = async (email: string, password: string, fullName: string, cpf: string, pista: string, plan: string, rotaNumber?: string, referralCode?: string) => {
        // 1. Criar usuário no Auth
        const { data: authData, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    cpf: cpf,
                    pista: pista,
                    plan: plan,
                    rota_number: rotaNumber,
                    role: rotaNumber ? 'professional' : 'user',
                    referral_code: referralCode // Código de indicação para processamento pelo trigger
                }
            }
        })
        if (error) throw new Error(error.message)

        // 2. Se usuário foi criado com sucesso e plano é Recruta (gratuito)
        if (authData.user && plan === 'recruta') {
            try {
                // Criar subscription grátis automaticamente
                const { error: subError } = await supabase
                    .from('subscriptions')
                    .insert({
                        user_id: authData.user.id,
                        plan_id: plan,
                        status: 'active',
                        started_at: new Date().toISOString()
                    })

                if (subError) {
                    console.error('[SignUp] Erro ao criar subscription grátis:', subError)
                    // Não falha o cadastro se subscription falhar
                }
            } catch (err) {
                console.error('[SignUp] Exceção ao criar subscription:', err)
            }
        }

        // 3. Retornar informações para redirecionamento
        return {
            user: authData.user,
            needsCheckout: plan !== 'recruta',
            planId: plan
        }
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
