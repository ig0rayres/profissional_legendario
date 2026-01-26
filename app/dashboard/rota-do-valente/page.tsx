'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Flag, Target, Shield, Award, Users, Flame,
    ArrowRight, History, Info, AlertTriangle, Zap,
    Trophy, Medal, CheckCircle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { DynamicIcon } from '@/components/rota-valente/dynamic-icon'
import { cn } from '@/lib/utils'
import { getCurrentSeasonMonth } from '@/lib/api/rota-valente'

interface UserGamification {
    total_points: number
    current_rank_id: string
    monthly_vigor: number
}

interface Rank {
    id: string
    name: string
    icon: string
    points_required: number
    rank_level: number
    description: string
}

interface Proeza {
    id: string
    name: string
    icon: string
    points_base: number
    description: string
    category: string
}

interface UserProeza {
    proeza_id: string
    points_earned: number
    earned_at: string
    proezas: Proeza
}

interface PointHistory {
    id: string
    points: number
    action_type: string
    description: string
    created_at: string
}

export default function RotaDoValenteDashboardPage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(true)
    const [gamification, setGamification] = useState<UserGamification | null>(null)
    const [currentRank, setCurrentRank] = useState<Rank | null>(null)
    const [nextRank, setNextRank] = useState<Rank | null>(null)
    const [allRanks, setAllRanks] = useState<Rank[]>([])
    const [proezas, setProezas] = useState<Proeza[]>([])
    const [userProezas, setUserProezas] = useState<UserProeza[]>([])
    const [history, setHistory] = useState<PointHistory[]>([])
    const [multiplier, setMultiplier] = useState(1)
    const [planName, setPlanName] = useState('Recruta')

    const supabase = createClient()
    const seasonMonth = getCurrentSeasonMonth()

    useEffect(() => {
        if (user?.id) {
            loadData()
        }
    }, [user?.id])

    async function loadData() {
        setLoading(true)

        const userId = user?.id

        // Buscar todos os dados em paralelo
        const [
            gamifResult,
            ranksResult,
            proezasResult,
            userProezasResult,
            historyResult,
            subscriptionResult
        ] = await Promise.all([
            supabase.from('user_gamification').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('ranks').select('*').order('rank_level'),
            supabase.from('proezas').select('*').eq('is_active', true).order('display_order'),
            supabase.from('user_proezas').select('*, proezas(*)').eq('user_id', userId).eq('season_month', seasonMonth),
            supabase.from('points_history').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
            supabase.from('subscriptions').select('plan_id').eq('user_id', userId).eq('status', 'active').maybeSingle()
        ])

        // Gamification
        const gamif = gamifResult.data || { total_points: 0, current_rank_id: 'novato', monthly_vigor: 0 }
        setGamification(gamif)

        // Ranks
        const ranks = ranksResult.data || []
        setAllRanks(ranks)

        // Determinar rank atual e próximo
        const current = ranks.find((r: Rank) => r.id === gamif.current_rank_id) || ranks[0]
        setCurrentRank(current)
        const next = ranks.find((r: Rank) => r.rank_level === (current?.rank_level || 0) + 1)
        setNextRank(next || null)

        // Proezas
        setProezas(proezasResult.data || [])
        setUserProezas(userProezasResult.data || [])

        // Histórico
        setHistory(historyResult.data || [])

        // Multiplicador
        const planId = subscriptionResult.data?.plan_id || 'recruta'
        const multipliers: Record<string, number> = { recruta: 1, veterano: 1.5, elite: 3 }
        setMultiplier(multipliers[planId] || 1)
        setPlanName(planId === 'elite' ? 'Elite' : planId === 'veterano' ? 'Veterano' : 'Recruta')

        setLoading(false)
    }

    // Calcular progresso para próxima patente
    const totalXP = gamification?.total_points || 0
    const currentRequired = currentRank?.points_required || 0
    const nextRequired = nextRank?.points_required || totalXP + 1000
    const progressPercent = Math.min(100, ((totalXP - currentRequired) / (nextRequired - currentRequired)) * 100)

    // Proezas conquistadas vs total
    const earnedProezaIds = userProezas.map(up => up.proeza_id)
    const proezasEarnedCount = userProezas.length
    const proezasTotalCount = proezas.length

    if (loading) {
        return (
            <div className="min-h-screen bg-adventure flex items-center justify-center">
                <div className="text-primary animate-pulse font-bold">Carregando Rota do Valente...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-adventure pb-20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-impact text-primary mb-2">
                            ROTA DO VALENTE
                        </h1>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <Shield className="w-4 h-4 text-secondary" />
                            Honra, Vigor e Progresso. Bem-vindo à sua jornada de ascensão.
                        </p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <Badge variant="outline" className="text-sm px-3 py-1">
                            Plano {planName} • {multiplier}x Vigor
                        </Badge>
                        <Button className="glow-orange bg-secondary hover:bg-secondary/90 text-white">
                            <Flag className="w-4 h-4 mr-2" />
                            {seasonMonth}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* XP and Rank Card */}
                        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-6 mb-6">
                                    {/* Rank Icon */}
                                    <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                        <DynamicIcon name={currentRank?.icon || 'Shield'} size="xl" className="text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-black uppercase text-muted-foreground mb-1">Patente Atual</div>
                                        <h2 className="text-3xl font-black text-primary">{currentRank?.name || 'Recruta'}</h2>
                                        <div className="flex items-center gap-3 mt-2">
                                            <div className="text-sm">
                                                <span className="font-black text-secondary">{totalXP.toLocaleString()}</span>
                                                <span className="text-muted-foreground"> Vigor Total</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-black text-green-500">{(gamification?.monthly_vigor || 0).toLocaleString()}</span>
                                                <span className="text-muted-foreground"> este mês</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Progress to Next Rank */}
                                {nextRank && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span className="text-muted-foreground">Próxima Patente: {nextRank.name}</span>
                                            <span className="text-primary">{totalXP}/{nextRequired} Vigor</span>
                                        </div>
                                        <div className="h-3 w-full bg-primary/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                                                style={{ width: `${progressPercent}%` }}
                                            />
                                        </div>
                                        <div className="text-xs text-muted-foreground text-right">
                                            Faltam {(nextRequired - totalXP).toLocaleString()} Vigor
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
                            <CardHeader className="pb-2 border-b border-primary/10">
                                <CardTitle className="text-lg font-bold text-impact text-primary flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    Atividades Recentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-primary/5">
                                    {history.length === 0 ? (
                                        <div className="p-4 text-center text-muted-foreground text-sm">
                                            Nenhuma atividade ainda. Comece a conquistar Vigor!
                                        </div>
                                    ) : (
                                        history.slice(0, 5).map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors">
                                                <div>
                                                    <p className="font-bold text-sm text-foreground">{item.description || item.action_type}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="font-black text-secondary">+{item.points} Vigor</span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Proezas Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-impact text-primary flex items-center gap-2">
                                    <Flame className="w-6 h-6 text-secondary" />
                                    Proezas do Mês
                                </h3>
                                <span className="text-xs font-bold text-muted-foreground uppercase px-3 py-1 bg-primary/10 rounded-full">
                                    {proezasEarnedCount} de {proezasTotalCount} Conquistadas
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {proezas.slice(0, 8).map((proeza) => {
                                    const isEarned = earnedProezaIds.includes(proeza.id)
                                    return (
                                        <Card
                                            key={proeza.id}
                                            className={cn(
                                                "border transition-all",
                                                isEarned
                                                    ? "border-secondary/50 bg-secondary/10"
                                                    : "border-primary/10 bg-card/30 opacity-60"
                                            )}
                                        >
                                            <CardContent className="p-4 text-center">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                                                    isEarned ? "bg-secondary" : "bg-muted"
                                                )}>
                                                    <DynamicIcon name={proeza.icon} size="md" className="text-white" />
                                                </div>
                                                <h4 className="text-xs font-bold uppercase mb-1">{proeza.name}</h4>
                                                <p className="text-[10px] text-muted-foreground">{proeza.description}</p>
                                                {isEarned && (
                                                    <Badge variant="secondary" className="mt-2 text-[10px]">
                                                        <CheckCircle className="w-3 h-3 mr-1" />
                                                        +{proeza.points_base} pts
                                                    </Badge>
                                                )}
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Ranking & Info */}
                    <div className="space-y-8">
                        {/* Multiplicador Card */}
                        <Card className="border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5">
                            <CardContent className="p-6 text-center">
                                <Zap className="w-12 h-12 text-secondary mx-auto mb-4" />
                                <h3 className="text-2xl font-black text-secondary mb-2">{multiplier}x MULTIPLICADOR</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Seu plano {planName} multiplica todo Vigor conquistado!
                                </p>
                                {multiplier < 3 && (
                                    <Button variant="outline" className="w-full border-secondary text-secondary hover:bg-secondary hover:text-white">
                                        Upgrade para Elite (3x)
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        {/* Patentes Hierarchy */}
                        <Card className="border-primary/20 bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-secondary" />
                                    Hierarquia de Patentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {allRanks.map((rank) => {
                                    const isCurrent = rank.id === currentRank?.id
                                    const isAchieved = totalXP >= rank.points_required
                                    return (
                                        <div
                                            key={rank.id}
                                            className={cn(
                                                "flex items-center gap-3 p-3 rounded-lg transition-all",
                                                isCurrent && "bg-primary/10 border border-primary/20",
                                                !isCurrent && isAchieved && "opacity-50",
                                                !isAchieved && !isCurrent && "opacity-30"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-full flex items-center justify-center",
                                                isAchieved ? "bg-secondary" : "bg-muted"
                                            )}>
                                                <DynamicIcon name={rank.icon || 'Shield'} size="sm" className="text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-sm">{rank.name}</div>
                                                <div className="text-xs text-muted-foreground">{rank.points_required.toLocaleString()} Vigor</div>
                                            </div>
                                            {isCurrent && (
                                                <Badge className="bg-primary text-white text-[10px]">ATUAL</Badge>
                                            )}
                                        </div>
                                    )
                                })}
                            </CardContent>
                        </Card>

                        {/* Anti-Fraud Notice */}
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardContent className="p-4 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-amber-500 uppercase">Aviso de Moderação</p>
                                    <p className="text-[11px] text-muted-foreground leading-tight">
                                        Para manter a honra do sistema, ações repetitivas têm limite diário.
                                        Contratos e serviços concluídos não entram no teto.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
