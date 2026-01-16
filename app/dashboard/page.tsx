'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Star, Briefcase, TrendingUp, LogOut, Flame, Award, Shield } from 'lucide-react'
import Link from 'next/link'
import { MOCK_PROFESSIONALS, MOCK_PROJECTS } from '@/lib/data/mock'

export default function DashboardPage() {
    const router = useRouter()
    const { user, signOut } = useAuth()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) {
            router.push('/auth/login')
        } else {
            setLoading(false)
        }
    }, [user, router])

    const handleSignOut = async () => {
        await signOut()
        router.push('/auth/login')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-adventure">
                <div className="text-primary text-xl font-bold animate-pulse">Carregando...</div>
            </div>
        )
    }

    const stats = [
        {
            title: 'Profissionais',
            value: MOCK_PROFESSIONALS.length,
            icon: Users,
            description: 'Profissional Legendário ativo',
            color: 'text-primary'
        },
        {
            title: 'Projetos',
            value: MOCK_PROJECTS.length,
            icon: Briefcase,
            description: 'Oportunidades abertas',
            color: 'text-accent'
        },
        {
            title: 'Avaliação Média',
            value: '4.9',
            icon: Star,
            description: 'De 5.0 estrelas',
            color: 'text-secondary'
        },
        {
            title: 'Sua Patente',
            value: 'Veterano',
            icon: Award,
            description: '850/1000 XP',
            color: 'text-secondary'
        },
        {
            title: 'Crescimento',
            value: '+25%',
            icon: TrendingUp,
            description: 'Este mês',
            color: 'text-primary'
        }
    ]

    return (
        <div className="min-h-screen bg-adventure">
            {/* Header */}
            {/* Header removed - now global */}

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 pt-24">
                {/* Welcome Section */}
                <div className="mb-8 text-center">
                    <h2 className="text-4xl font-bold text-impact text-primary mb-2">
                        Bem-vindo à Comunidade
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Transformação • Força • Excelência
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
                    {stats.map((stat, index) => (
                        <Card
                            key={index}
                            className="glass-strong border-primary/20 hover:border-primary/40 transition-all hover:glow-orange"
                        >
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {stat.title}
                                </CardTitle>
                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold text-impact ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {stat.description}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card className="glass-strong border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-impact text-primary">Explore Profissionais</CardTitle>
                            <CardDescription>
                                Conecte-se com os melhores
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/professionals">
                                <Button className="w-full glow-orange">
                                    <Users className="w-4 h-4 mr-2" />
                                    Ver Profissionais
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="glass-strong border-secondary/20">
                        <CardHeader>
                            <CardTitle className="text-impact text-secondary">Rota do Valente</CardTitle>
                            <CardDescription>
                                Seu progresso e conquistas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/dashboard/rota-do-valente">
                                <Button className="w-full glow-orange bg-secondary hover:bg-secondary/90 text-white">
                                    <Shield className="w-4 h-4 mr-2" />
                                    Subir de Nível
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="glass-strong border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-impact text-primary">Projetos</CardTitle>
                            <CardDescription>
                                Oportunidades abertas
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/projects">
                                <Button className="w-full glow-orange" variant="outline">
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Ver Projetos
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="glass-strong border-primary/20">
                        <CardHeader>
                            <CardTitle className="text-impact text-primary">Lançar Projeto</CardTitle>
                            <CardDescription>
                                Divulgue sua necessidade
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/projects/create">
                                <Button className="w-full glow-orange-strong">
                                    <Flame className="w-4 h-4 mr-2" />
                                    Criar Novo Projeto
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card className="glass-strong border-primary/20">
                    <CardHeader>
                        <CardTitle className="text-impact text-primary">Atividade Recente</CardTitle>
                        <CardDescription>
                            Últimas movimentações da comunidade
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {MOCK_PROFESSIONALS.slice(0, 3).map((prof) => (
                                <div
                                    key={prof.id}
                                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors"
                                >
                                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-foreground">{prof.full_name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {prof.specialties.join(', ')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-accent fill-accent" />
                                        <span className="text-sm font-bold text-accent">{prof.rating}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    )
}
