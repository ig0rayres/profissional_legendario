'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Shield, Zap, Crown, Gem, Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

interface PlanConfig {
    id: string
    tier: string
    name: string
    price: number
    features: string[]
    is_active: boolean
    display_order: number
    stripe_price_id?: string | null
}

// Mapear ícones por tier
const TIER_CONFIG: Record<string, { icon: typeof Shield, popular: boolean, gradient: string }> = {
    recruta: {
        icon: Shield,
        popular: false,
        gradient: 'from-gray-500/20 to-gray-600/20'
    },
    veterano: {
        icon: Zap,
        popular: false,
        gradient: 'from-orange-500/20 to-amber-500/20'
    },
    elite: {
        icon: Crown,
        popular: true,
        gradient: 'from-primary/20 to-emerald-500/20'
    },
    lendario: {
        icon: Gem,
        popular: false,
        gradient: 'from-yellow-500/20 to-amber-500/20'
    }
}

// Descrições por tier
const TIER_DESCRIPTIONS: Record<string, string> = {
    recruta: 'O início da sua jornada na guilda.',
    veterano: 'Para quem já provou seu valor no campo.',
    elite: 'A força máxima da elite de negócios.',
    lendario: 'O topo absoluto. Lendas nunca são esquecidas.'
}

export default function PlansPage() {
    const [plans, setPlans] = useState<PlanConfig[]>([])
    const [loading, setLoading] = useState(true)
    const [subscribing, setSubscribing] = useState<string | null>(null)
    const [currentPlan, setCurrentPlan] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadPlans()
        loadCurrentSubscription()
    }, [])

    const loadPlans = async () => {
        try {
            const { data, error } = await supabase
                .from('plan_config')
                .select('*')
                .eq('is_active', true)
                .order('display_order')

            if (error) throw error
            setPlans(data || [])
        } catch (error) {
            console.error('Error loading plans:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadCurrentSubscription = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Buscar subscription
            const { data: sub } = await supabase
                .from('subscriptions')
                .select('plan_id')
                .eq('user_id', user.id)
                .eq('status', 'active')
                .maybeSingle()

            if (sub?.plan_id) {
                // Buscar tier do plano
                const { data: plan } = await supabase
                    .from('plan_config')
                    .select('tier')
                    .eq('id', sub.plan_id)
                    .maybeSingle()

                if (plan) {
                    setCurrentPlan(plan.tier)
                }
            }
        } catch (error) {
            console.error('Error loading subscription:', error)
        }
    }

    const handleSubscribe = async (plan: PlanConfig) => {
        // Se é plano gratuito (recruta), não faz nada
        if (plan.tier === 'recruta') {
            toast.info('Você já está no plano Recruta!')
            return
        }

        // Verificar se tem stripe_price_id
        if (!plan.stripe_price_id) {
            toast.error('Este plano ainda não está disponível para assinatura.')
            return
        }

        setSubscribing(plan.id)

        try {
            const response = await fetch('/api/stripe/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId: plan.id })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Erro ao criar checkout')
            }

            // Redirecionar para o Stripe Checkout
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error: any) {
            console.error('Error subscribing:', error)
            toast.error('Erro ao processar assinatura', {
                description: error.message
            })
        } finally {
            setSubscribing(null)
        }
    }

    const formatPrice = (price: number): string => {
        if (price === 0) return 'Grátis'
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(price)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background pt-24 pb-16 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-black text-primary mb-4">
                        Escolha Seu Plano
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Evolua na jornada do Rota Business Club. Quanto maior o plano, mais benefícios e oportunidades de networking.
                    </p>
                </div>

                {/* Plans Grid - 4 colunas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan) => {
                        const config = TIER_CONFIG[plan.tier] || TIER_CONFIG.recruta
                        const Icon = config.icon
                        const isCurrentPlan = currentPlan === plan.tier
                        const isPopular = config.popular
                        const isElite = plan.tier === 'elite'

                        return (
                            <Card
                                key={plan.id}
                                className={`relative overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${isElite
                                    ? 'border-[#D2691E] shadow-2xl shadow-[#D2691E]/40 ring-2 ring-[#D2691E]/30 bg-gradient-to-br from-[#D2691E]/10 via-card to-card'
                                    : isPopular
                                        ? 'border-primary shadow-lg shadow-primary/20'
                                        : 'border-primary/20 hover:border-primary/40'
                                    }`}
                            >
                                {/* Elite Badge Premium */}
                                {isElite && (
                                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-10">
                                        <span className="bg-gradient-to-r from-[#D2691E] to-[#FF8C42] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#D2691E]/50 flex items-center gap-1">
                                            <Crown className="w-3 h-3" />
                                            RECOMENDADO
                                            <Crown className="w-3 h-3" />
                                        </span>
                                    </div>
                                )}

                                {/* Popular Badge (outros) */}
                                {isPopular && !isElite && (
                                    <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-bold rounded-bl-lg">
                                        RECOMENDADO
                                    </div>
                                )}

                                {/* Gradient Background */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-50`} />

                                <CardHeader className="relative pt-8">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-3 rounded-lg ${isElite
                                            ? 'bg-gradient-to-br from-[#D2691E] to-[#FF8C42] shadow-lg shadow-[#D2691E]/50'
                                            : isPopular ? 'bg-orange-500/20' : 'bg-primary/20'}`}>
                                            <Icon className={`w-6 h-6 ${isElite ? 'text-white' : isPopular ? 'text-orange-500' : 'text-primary'}`} />
                                        </div>
                                        <div>
                                            <CardTitle className={`text-2xl ${isElite ? 'text-[#D2691E]' : ''}`}>{plan.name}</CardTitle>
                                            <CardDescription>{TIER_DESCRIPTIONS[plan.tier]}</CardDescription>
                                        </div>
                                    </div>

                                    <div className="mt-4">
                                        <span className={`text-4xl font-black ${isElite ? 'text-[#D2691E]' : 'text-primary'}`}>
                                            {formatPrice(plan.price)}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-muted-foreground">/mês</span>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="relative">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                                                <span className="text-sm">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>

                                <CardFooter className="relative">
                                    {isCurrentPlan ? (
                                        <Button disabled className="w-full" variant="outline">
                                            Plano Atual
                                        </Button>
                                    ) : plan.tier === 'recruta' ? (
                                        <Button disabled className="w-full" variant="outline">
                                            Plano Gratuito
                                        </Button>
                                    ) : (
                                        <Button
                                            className={`w-full ${isPopular ? 'bg-primary hover:bg-primary/90' : ''}`}
                                            onClick={() => handleSubscribe(plan)}
                                            disabled={subscribing === plan.id}
                                        >
                                            {subscribing === plan.id ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Processando...
                                                </>
                                            ) : (
                                                <>
                                                    Assinar Agora
                                                    <ArrowRight className="w-4 h-4 ml-2" />
                                                </>
                                            )}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        )
                    })}
                </div>

                {/* FAQ ou Info adicional */}
                <div className="mt-16 text-center">
                    <p className="text-sm text-muted-foreground">
                        Pagamento seguro processado pelo Stripe. Cancele quando quiser.
                    </p>
                </div>
            </div>
        </div>
    )
}
