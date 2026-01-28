'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Zap, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface UpgradeCTAProps {
    variant?: 'banner' | 'card' | 'inline' | 'minimal'
    className?: string
}

export function UpgradeCTA({ variant = 'card', className = '' }: UpgradeCTAProps) {
    const [currentTier, setCurrentTier] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadSubscription()
    }, [])

    const loadSubscription = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: sub } = await supabase
                .from('subscriptions')
                .select('plan_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .maybeSingle()

            if (sub?.plan_id) {
                // Buscar slug do plano
                const { data: plan } = await supabase
                    .from('plans')
                    .select('slug')
                    .eq('id', sub.plan_id)
                    .single()

                setCurrentTier(plan?.slug || 'free')
            } else {
                setCurrentTier('free')
            }
        } catch (error) {
            console.error('Error loading subscription:', error)
            setCurrentTier('recruta')
        } finally {
            setLoading(false)
        }
    }

    // Não mostrar se já é Elite
    if (loading || currentTier === 'elite') {
        return null
    }

    // Banner (topo do dashboard)
    if (variant === 'banner') {
        return (
            <div className={`bg-gradient-to-r from-orange-500/20 via-primary/20 to-orange-500/20 border border-orange-500/30 rounded-lg p-4 ${className}`}>
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Zap className="w-5 h-5 text-orange-500" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">
                                {currentTier === 'recruta'
                                    ? 'Desbloqueie todo o potencial do Rota Business Club!'
                                    : 'Evolua para Elite e maximize seus resultados!'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Mais conexões, mais oportunidades, mais crescimento.
                            </p>
                        </div>
                    </div>
                    <Link href="/planos">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            <Crown className="w-4 h-4 mr-2" />
                            Fazer Upgrade
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    // Card (sidebar ou seção)
    if (variant === 'card') {
        return (
            <Card className={`border-orange-500/30 bg-gradient-to-br from-orange-500/10 to-primary/10 overflow-hidden ${className}`}>
                <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-orange-500" />
                        <span className="font-semibold text-orange-500">Upgrade Disponível</span>
                    </div>

                    <h3 className="text-lg font-bold mb-2">
                        {currentTier === 'recruta'
                            ? 'Torne-se Veterano ou Elite!'
                            : 'Evolua para Elite!'}
                    </h3>

                    <ul className="space-y-2 mb-4 text-sm text-muted-foreground">
                        {currentTier === 'recruta' ? (
                            <>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                    Multiplicador de XP aumentado
                                </li>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                    Mais elos e confrarias
                                </li>
                                <li className="flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-orange-500" />
                                    Destaque no marketplace
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-primary" />
                                    Elos ilimitados
                                </li>
                                <li className="flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-primary" />
                                    Multiplicador 3x de XP
                                </li>
                                <li className="flex items-center gap-2">
                                    <Crown className="w-4 h-4 text-primary" />
                                    Suporte prioritário
                                </li>
                            </>
                        )}
                    </ul>

                    <Link href="/planos" className="block">
                        <Button className="w-full bg-orange-500 hover:bg-orange-600">
                            Ver Planos
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        )
    }

    // Inline (dentro de texto ou seções)
    if (variant === 'inline') {
        return (
            <div className={`flex items-center gap-3 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg ${className}`}>
                <Zap className="w-5 h-5 text-orange-500 shrink-0" />
                <span className="text-sm">
                    <strong>Quer mais?</strong>{' '}
                    <Link href="/planos" className="text-orange-500 hover:underline">
                        Faça upgrade do seu plano →
                    </Link>
                </span>
            </div>
        )
    }

    // Minimal (apenas texto/link)
    if (variant === 'minimal') {
        return (
            <Link href="/planos" className={`text-orange-500 hover:underline text-sm flex items-center gap-1 ${className}`}>
                <Zap className="w-3 h-3" />
                Fazer upgrade
            </Link>
        )
    }

    return null
}
