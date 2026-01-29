'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShieldCheck, CreditCard, TrendingUp } from 'lucide-react'
import { MOCK_PROFESSIONALS } from '@/lib/data/mock'

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        verifiedUsers: 0,
        activeSubscriptions: 0,
        totalRevenue: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Simulate loading mock data
        const loadStats = async () => {
            // Mock calculations based on our mock data
            const totalPros = MOCK_PROFESSIONALS.length
            // Simulate that we have 5x more regular users than professionals
            const totalUsers = totalPros * 5 + 124

            // Count verified pros (mock logic: 80% are verified)
            const verifiedUsers = Math.floor(totalPros * 0.8)

            // Mock subscriptions (approx 40% of users)
            const activeSubscriptions = Math.floor(totalUsers * 0.4)

            // Mock revenue (avg ticket R$ 49.90)
            const totalRevenue = activeSubscriptions * 49.90

            setStats({
                totalUsers,
                verifiedUsers,
                activeSubscriptions,
                totalRevenue
            })
            setLoading(false)
        }

        loadStats()
    }, [])

    if (loading) {
        return <div className="text-primary animate-pulse">Carregando estatísticas...</div>
    }

    const cards = [
        {
            title: 'Total de Usuários',
            value: stats.totalUsers,
            icon: Users,
            description: 'Membros da comunidade'
        },
        {
            title: 'Profissionais Verificados',
            value: stats.verifiedUsers,
            icon: ShieldCheck,
            description: 'Identidades confirmadas'
        },
        {
            title: 'Assinaturas Ativas',
            value: stats.activeSubscriptions,
            icon: CreditCard,
            description: 'Planos em vigência'
        },
        {
            title: 'Receita Mensal (Est.)',
            value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: TrendingUp,
            description: 'Baseado em assinaturas ativas'
        }
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-impact text-primary">Dashboard Administrativo</h2>
                <p className="text-muted-foreground">
                    Visão geral da plataforma Profissional ROTA (Modo Demo)
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => {
                    const Icon = card.icon
                    return (
                        <Card key={card.title} className="glass-strong border-primary/20 hover:border-primary/40 transition-all">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <Icon className="h-4 w-4 text-primary" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-impact text-primary">{card.value}</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {card.description}
                                </p>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
