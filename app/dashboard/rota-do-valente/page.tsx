'use client'

import { useState } from 'react'
import { XPProgress } from '@/components/gamification/xp-progress'
import { BadgeCard } from '@/components/gamification/badge-card'
import { RankingsBoard } from '@/components/gamification/rankings-board'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Flag, Target, Shield, Award, Users,
    ArrowRight, History, Info, AlertTriangle
} from 'lucide-react'

import {
    MOCK_BADGES,
    MOCK_USER_GAMIFICATION,
    MOCK_RANKS,
    MOCK_PROFESSIONALS
} from '@/lib/data/mock'

export default function RotaDoValentePage() {
    // In a real app, we'd get the current user's ID from auth
    const currentUserId = '5' // Paulo Júnior for this demo

    const userGamification = MOCK_USER_GAMIFICATION.find(g => g.user_id === currentUserId) || {
        user_id: currentUserId,
        total_xp: 0,
        current_rank_id: 'recruta',
        badges_earned: []
    }

    const currentRank = MOCK_RANKS.find(r => r.id === userGamification.current_rank_id) || MOCK_RANKS[0]
    const nextRank = MOCK_RANKS.find(r => r.display_order === currentRank.display_order + 1)

    const userBadges = MOCK_BADGES.map(badge => {
        const earnedInfo = userGamification.badges_earned?.find(eb => eb.badge_id === badge.id)
        return {
            ...badge,
            earned: !!earnedInfo,
            earnedAt: earnedInfo?.earned_at
        }
    })

    const nationalRankings = MOCK_PROFESSIONALS.map(prof => {
        const gamif = MOCK_USER_GAMIFICATION.find(g => g.user_id === prof.user_id)
        return {
            id: prof.id,
            name: prof.full_name,
            xp: gamif?.total_xp || 0,
            rank: MOCK_RANKS.find(r => r.id === gamif?.current_rank_id)?.name || 'Recruta',
            location: prof.location,
            avatar_url: prof.avatar_url,
            position: 0
        }
    }).sort((a, b) => b.xp - a.xp).map((item, idx) => ({ ...item, position: idx + 1 }))

    const rankingData = {
        local: nationalRankings.filter(r => r.location.includes('Ribeirão Preto')),
        regional: nationalRankings.filter(r => r.location.includes('SP')),
        national: nationalRankings
    }

    const MOCK_HISTORY = [
        { id: '1', action: 'Avaliação 5 Estrelas', xp: 50, date: 'Hoje, 10:30' },
        { id: '2', action: 'Badge Desbloqueada: Irmandade', xp: 75, date: '14 Jan' },
        { id: '3', action: 'Atualização de Perfil', xp: 100, date: '10 Jan' },
    ]

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
                    <div className="flex gap-3">
                        <Button variant="outline" className="border-primary/20 bg-card/50">
                            <Info className="w-4 h-4 mr-2" />
                            Como Funciona
                        </Button>
                        <Button className="glow-orange bg-secondary hover:bg-secondary/90 text-white">
                            <Flag className="w-4 h-4 mr-2" />
                            Temporada Atual
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Progress */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* XP and Rank Card */}
                        <XPProgress
                            xp={userGamification.total_xp}
                            rank={currentRank as any}
                            nextRank={nextRank as any}
                        />

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
                                    {MOCK_HISTORY.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between p-4 hover:bg-primary/5 transition-colors">
                                            <div>
                                                <p className="font-bold text-sm text-foreground">{item.action}</p>
                                                <p className="text-xs text-muted-foreground">{item.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="font-black text-secondary">+{item.xp} Vigor</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full h-10 text-xs font-bold uppercase text-muted-foreground hover:text-primary">
                                    Ver Histórico Completo
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Badges Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-impact text-primary flex items-center gap-2">
                                    <Award className="w-6 h-6 text-secondary" />
                                    Conquistas (Badges)
                                </h3>
                                <span className="text-xs font-bold text-muted-foreground uppercase px-3 py-1 bg-primary/10 rounded-full">
                                    {userGamification.badges_earned?.length || 0} de {MOCK_BADGES.length} Desbloqueadas
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {userBadges.map((badge) => (
                                    <BadgeCard
                                        key={badge.id}
                                        badge={badge as any}
                                        isEarned={badge.earned}
                                        earnedAt={badge.earnedAt}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Challenges & Rankings */}
                    <div className="space-y-8">
                        {/* Monthly Challenge */}
                        <Card className="border-secondary/30 bg-secondary/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target className="w-20 h-20" />
                            </div>
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-impact text-secondary flex items-center gap-2">
                                    <Target className="w-5 h-5 animate-pulse" />
                                    Desafio do Mês
                                </CardTitle>
                                <CardDescription className="text-secondary/80">
                                    Missão: Infiltrado de Elite
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-sm font-medium text-foreground">
                                    Responda a 5 demandas em menos de 2 horas cada para provar sua prontidão.
                                </p>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span>Progresso</span>
                                        <span>2 / 5</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-secondary w-[40%]" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 pt-2">
                                    <div className="p-2 rounded bg-secondary/10 text-secondary text-xs font-black">
                                        +500 Vigor
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase">
                                        + Badge Sentinela
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Rankings Board */}
                        <RankingsBoard data={rankingData as any} />

                        {/* Anti-Fraud Notice */}
                        <Card className="border-amber-500/20 bg-amber-500/5">
                            <CardContent className="p-4 flex gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-amber-500 uppercase">Aviso de Moderação</p>
                                    <p className="text-[11px] text-muted-foreground leading-tight">
                                        Para manter a honra da guilda, o ganho diário de vigor por ações repetitivas é limitado a 500. Contratos e serviços não entram no teto.
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
