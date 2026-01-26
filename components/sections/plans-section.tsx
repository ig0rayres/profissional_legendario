'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Check, Shield, Zap, Crown, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface PlanConfig {
    id: string
    tier: string
    name: string
    price: number
    features: string[]
    is_active: boolean
    display_order: number
}

// Mapear ícones por tier
const TIER_CONFIG: Record<string, { icon: typeof Shield, popular: boolean, cta: string, href: string, variant: 'outline' | 'default' }> = {
    recruta: {
        icon: Shield,
        popular: false,
        cta: 'Alistar-se Agora',
        href: '/auth/register',
        variant: 'outline'
    },
    veterano: {
        icon: Zap,
        popular: false,
        cta: 'Tornar-se Veterano',
        href: '/planos',
        variant: 'default'
    },
    elite: {
        icon: Crown,
        popular: true,
        cta: 'Acessar a Elite',
        href: '/planos',
        variant: 'default'
    }
}

// Descrições por tier
const TIER_DESCRIPTIONS: Record<string, string> = {
    recruta: 'O início da sua jornada na guilda.',
    veterano: 'Para quem já provou seu valor no campo.',
    elite: 'A força máxima da elite de negócios.'
}

export function PlansSection() {
    const [plans, setPlans] = useState<PlanConfig[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadPlans()
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
            // Fallback para valores padrão se banco falhar
            setPlans([
                { id: '1', tier: 'recruta', name: 'Recruta', price: 0, features: ['Perfil Básico', 'Listagem na busca', '1 Especialidade', 'Acesso à comunidade'], is_active: true, display_order: 1 },
                { id: '2', tier: 'veterano', name: 'Veterano', price: 47, features: ['Perfil Completo', 'Destaque na busca', 'Até 3 Especialidades', 'Selo de Verificado'], is_active: true, display_order: 2 },
                { id: '3', tier: 'elite', name: 'Elite', price: 147, features: ['Tudo do plano Veterano', 'Destaque Premium', 'Especialidades Ilimitadas', 'Selo Elite Dourado'], is_active: true, display_order: 3 }
            ])
        } finally {
            setLoading(false)
        }
    }

    const formatPrice = (price: number): string => {
        if (price === 0) return 'Grátis'
        // Formatar com centavos se necessário
        return price % 1 === 0
            ? `R$ ${price.toFixed(0)}`
            : `R$ ${price.toFixed(2).replace('.', ',')}`
    }

    return (
        <section id="planos" className="py-20 bg-card/30 backdrop-blur-sm">
            <div className="container mx-auto px-4">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-impact text-primary mb-6">
                        ESCOLHA SUA JORNADA
                    </h2>
                    <p className="text-xl text-muted-foreground">
                        Invista na sua carreira e faça parte da elite. Escolha o plano que melhor se adapta aos seus objetivos.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto items-stretch">
                        {plans.map((plan) => {
                            const config = TIER_CONFIG[plan.tier] || TIER_CONFIG.recruta
                            const description = TIER_DESCRIPTIONS[plan.tier] || ''
                            const Icon = config.icon
                            const isElite = plan.tier === 'elite'

                            return (
                                <Card
                                    key={plan.id}
                                    className={`relative flex flex-col h-full ${isElite
                                        ? 'border-[#D2691E] shadow-2xl shadow-[#D2691E]/40 md:-mt-4 md:mb-4 z-20 bg-gradient-to-br from-[#D2691E]/10 via-card/90 to-card/90 backdrop-blur-sm ring-2 ring-[#D2691E]/30'
                                        : config.popular
                                            ? 'border-primary shadow-lg shadow-primary/20 z-10 bg-card/80 backdrop-blur-sm'
                                            : 'border-primary/20 bg-card/50 backdrop-blur-sm hover:border-primary/40'
                                        } transition-all duration-300 hover:shadow-xl`}
                                >
                                    {isElite && (
                                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 z-30">
                                            <span className="bg-gradient-to-r from-[#D2691E] to-[#FF8C42] text-white text-sm font-bold px-6 py-2 rounded-full shadow-2xl shadow-[#D2691E]/50 animate-bounce-slow flex items-center gap-2">
                                                <Crown className="w-4 h-4" />
                                                ELITE
                                                <Crown className="w-4 h-4" />
                                            </span>
                                        </div>
                                    )}
                                    {config.popular && !isElite && (
                                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                            <span className="bg-primary text-primary-foreground text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                                                MAIS POPULAR
                                            </span>
                                        </div>
                                    )}

                                    <CardHeader className="text-center pb-8">
                                        <div className={`mx-auto p-4 rounded-full mb-4 w-16 h-16 flex items-center justify-center ${isElite
                                            ? 'bg-gradient-to-br from-[#D2691E] to-[#FF8C42] shadow-lg shadow-[#D2691E]/50'
                                            : 'bg-primary/10'
                                            }`}>
                                            <Icon className={`w-8 h-8 ${isElite
                                                ? 'text-white'
                                                : config.popular ? 'text-primary' : 'text-muted-foreground'
                                                }`} />
                                        </div>
                                        <CardTitle className={`text-3xl font-bold text-impact mb-2 ${isElite ? 'text-[#D2691E]' : ''
                                            }`}>
                                            {plan.name}
                                        </CardTitle>
                                        <CardDescription className="text-base">
                                            {description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="flex-1">
                                        <div className="text-center mb-8">
                                            <span className={`text-4xl font-bold ${isElite ? 'text-[#D2691E]' : 'text-foreground'
                                                }`}>
                                                {formatPrice(plan.price)}
                                            </span>
                                            {plan.price > 0 && (
                                                <span className="text-muted-foreground ml-1">
                                                    /mês
                                                </span>
                                            )}
                                        </div>

                                        <ul className="space-y-4">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-3">
                                                    <Check className={`w-5 h-5 shrink-0 mt-0.5 ${isElite ? 'text-[#D2691E]' : 'text-primary'
                                                        }`} />
                                                    <span className="text-sm text-muted-foreground">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter className="pt-8">
                                        <Link href={config.href} className="w-full">
                                            <Button
                                                size="lg"
                                                className={`w-full text-lg h-12 font-bold transition-all ${isElite
                                                    ? 'bg-gradient-to-r from-[#D2691E] to-[#FF8C42] hover:from-[#FF8C42] hover:to-[#D2691E] text-white shadow-lg shadow-[#D2691E]/50 hover:shadow-xl hover:shadow-[#D2691E]/70 hover:scale-105'
                                                    : config.popular
                                                        ? 'glow-orange-strong'
                                                        : ''
                                                    }`}
                                                variant={isElite || config.popular ? 'default' : 'outline'}
                                            >
                                                {config.cta}
                                            </Button>
                                        </Link>
                                    </CardFooter>
                                </Card>
                            )
                        })}
                    </div>
                )}

                <div className="mt-20 text-center">
                    <p className="text-muted-foreground mb-4">
                        Dúvidas sobre qual plano escolher?
                    </p>
                    <Link href="/contact">
                        <Button variant="ghost" className="text-primary text-lg hover:bg-transparent hover:underline p-0">
                            Fale com nossa equipe
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    )
}
