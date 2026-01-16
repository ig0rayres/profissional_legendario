'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSubscriptionStats, formatCurrency, getPlanDistribution } from '@/lib/api/financial'
import { TrendingUp, Users, DollarSign, PieChart } from 'lucide-react'

interface Stats {
    totalActive: number
    byPlan: {
        recruta: number
        veterano: number
        elite: number
    }
    mrr: number
}

export function FinancialMetrics() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadStats()
    }, [])

    const loadStats = async () => {
        try {
            const data = await getSubscriptionStats()
            setStats(data)
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

    const metrics = [
        {
            title: 'MRR (Receita Mensal)',
            value: formatCurrency(stats.mrr),
            icon: DollarSign,
            description: 'Receita recorrente mensal',
            trend: '+12%',
            color: 'text-green-500'
        },
        {
            title: 'Assinaturas Ativas',
            value: stats.totalActive.toString(),
            icon: Users,
            description: 'Total de usuários pagantes',
            trend: '+5%',
            color: 'text-blue-500'
        },
        {
            title: 'Plano Veterano',
            value: stats.byPlan.veterano.toString(),
            icon: TrendingUp,
            description: 'Assinantes do plano',
            trend: `${Math.round((stats.byPlan.veterano / stats.totalActive) * 100)}%`,
            color: 'text-orange-500'
        },
        {
            title: 'Plano Elite',
            value: stats.byPlan.elite.toString(),
            icon: PieChart,
            description: 'Assinantes premium',
            trend: `${Math.round((stats.byPlan.elite / stats.totalActive) * 100)}%`,
            color: 'text-purple-500'
        }
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
                        {/* Recruta */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Recruta (Gratuito)
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {stats.byPlan.recruta} usuários
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-gray-500 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${(stats.byPlan.recruta / stats.totalActive) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Veterano */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Veterano (R$ 47/mês)
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {stats.byPlan.veterano} usuários
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-orange-500 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${(stats.byPlan.veterano / stats.totalActive) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Elite */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-muted-foreground">
                                    Elite (R$ 147/mês)
                                </span>
                                <span className="text-sm font-bold text-primary">
                                    {stats.byPlan.elite} usuários
                                </span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                                <div
                                    className="bg-purple-500 h-2 rounded-full transition-all"
                                    style={{
                                        width: `${(stats.byPlan.elite / stats.totalActive) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
