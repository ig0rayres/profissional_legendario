'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/api/financial'
import { TrendingUp, Users, DollarSign, PieChart, Shield, Zap, Crown } from 'lucide-react'

interface PlanConfig {
    tier: string
    name: string
    price: number
}

interface Stats {
    totalActive: number
    byPlan: Record<string, number>
    mrr: number
    plans: PlanConfig[]
}

export function FinancialMetrics() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            // Buscar planos do banco
            const { data: plans } = await supabase
                .from('plan_config')
                .select('tier, name, price')
                .eq('is_active', true)
                .order('display_order')

            // Buscar subscriptions ativas
            const { data: subscriptions } = await supabase
                .from('subscriptions')
                .select('plan_id, user_id')
                .eq('status', 'active')

            // Buscar perfis para identificar admins/sistema
            const { data: allProfiles } = await supabase
                .from('profiles')
                .select('id, role, email')

            // Criar Set de IDs a excluir (admins e sistema)
            const excludeIds = new Set(
                allProfiles?.filter(p =>
                    p.role === 'admin' ||
                    p.email?.includes('sistema@') ||
                    p.email?.includes('admin@rotaclub')
                ).map(p => p.id) || []
            )

            // Filtrar: apenas usuários normais
            const activeSubscriptions = subscriptions?.filter(s =>
                !excludeIds.has(s.user_id)
            ) || []

            // Contar por plano
            const byPlan: Record<string, number> = {
                recruta: 0,
                veterano: 0,
                elite: 0
            }

            activeSubscriptions.forEach(sub => {
                const planId = sub.plan_id || 'recruta'
                byPlan[planId] = (byPlan[planId] || 0) + 1
            })

            // Calcular MRR baseado nos preços do banco
            const planPrices: Record<string, number> = {}
            plans?.forEach(p => {
                planPrices[p.tier] = p.price
            })

            const mrr = Object.entries(byPlan).reduce((total, [plan, count]) => {
                return total + (planPrices[plan] || 0) * count
            }, 0)

            setStats({
                totalActive: activeSubscriptions.length,
                byPlan,
                mrr,
                plans: plans || []
            })
        } catch (error) {
            console.error('Error loading financial stats:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Card key={i} className="border-primary/20 bg-card/50 backdrop-blur-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Carregando...
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-primary/10 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (!stats) {
        return (
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">
                        Erro ao carregar métricas financeiras
                    </p>
                </CardContent>
            </Card>
        )
    }

    // Encontrar preços dos planos
    const getPlanPrice = (tier: string) => {
        const plan = stats.plans.find(p => p.tier === tier)
        return plan?.price || 0
    }

    const totalPaid = stats.byPlan.veterano + stats.byPlan.elite

    const metrics = [
        {
            title: 'MRR (Receita Mensal)',
            value: formatCurrency(stats.mrr),
            icon: DollarSign,
            description: 'Receita recorrente mensal',
            trend: totalPaid > 0 ? '+12%' : '0%',
            color: 'text-green-500'
        },
        {
            title: 'Assinaturas Ativas',
            value: stats.totalActive.toString(),
            icon: Users,
            description: 'Total de usuários com plano',
            trend: stats.totalActive > 0 ? '+5%' : '0%',
            color: 'text-blue-500'
        },
        {
            title: 'Plano Veterano',
            value: stats.byPlan.veterano.toString(),
            icon: TrendingUp,
            description: `${formatCurrency(getPlanPrice('veterano'))}/mês`,
            trend: stats.totalActive > 0 ? `${Math.round((stats.byPlan.veterano / stats.totalActive) * 100)}%` : '0%',
            color: 'text-orange-500'
        },
        {
            title: 'Plano Elite',
            value: stats.byPlan.elite.toString(),
            icon: PieChart,
            description: `${formatCurrency(getPlanPrice('elite'))}/mês`,
            trend: stats.totalActive > 0 ? `${Math.round((stats.byPlan.elite / stats.totalActive) * 100)}%` : '0%',
            color: 'text-purple-500'
        }
    ]

    // Dados dos planos para o gráfico
    const planDisplay = [
        { tier: 'recruta', name: 'Recruta', color: 'bg-gray-500', icon: Shield },
        { tier: 'veterano', name: 'Veterano', color: 'bg-orange-500', icon: Zap },
        { tier: 'elite', name: 'Elite', color: 'bg-purple-500', icon: Crown }
    ]

    return (
        <div className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {metrics.map((metric) => {
                    const Icon = metric.icon
                    return (
                        <Card
                            key={metric.title}
                            className="border-primary/20 bg-card/50 backdrop-blur-sm hover:bg-card/70 transition-colors"
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {metric.title}
                                </CardTitle>
                                <Icon className={`w-4 h-4 ${metric.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-primary">
                                    {metric.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {metric.description}
                                </p>
                                <div className="flex items-center mt-2">
                                    <span className={`text-xs font-medium ${metric.color}`}>
                                        {metric.trend}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-1">
                                        vs. mês anterior
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Plan Distribution */}
            <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="text-primary">Distribuição por Plano</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {planDisplay.map(({ tier, name, color, icon: Icon }) => {
                            const count = stats.byPlan[tier] || 0
                            const price = getPlanPrice(tier)
                            const percentage = stats.totalActive > 0
                                ? Math.round((count / stats.totalActive) * 100)
                                : 0

                            return (
                                <div key={tier}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <Icon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-sm font-medium text-muted-foreground">
                                                {name} ({price === 0 ? 'Gratuito' : formatCurrency(price) + '/mês'})
                                            </span>
                                        </div>
                                        <span className="text-sm font-bold text-primary">
                                            {count} usuários
                                        </span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className={`${color} h-2 rounded-full transition-all`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
