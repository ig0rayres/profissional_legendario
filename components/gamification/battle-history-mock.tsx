'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords, ChevronDown, ChevronUp, Flame, ChevronRight, Users, Award, MessageCircle, Star, Camera, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'

const MONTH_NAMES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Mock data
const mockCurrentSeason = {
    season_id: 'current',
    season_name: 'Janeiro 2026',
    season_year: 2026,
    season_month: 1,
    total_xp: 850,
    rank_id: 'veterano',
    rank_name: 'Veterano',
    badges_count: 3,
    ranking_position: 12,
    is_active: true,
    confraternities_count: 2,
    activities: [
        { id: '1', points: 50, action_type: 'rating_received', description: 'Recebeu avaliação 5 estrelas', created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '2', points: 30, action_type: 'elo_accepted', description: 'Nova conexão aceita', created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '3', points: 100, action_type: 'badge_reward', description: 'Conquistou medalha: Veterano', created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '4', points: 20, action_type: 'confraternity_participation', description: 'Participou de confraria', created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
        { id: '5', points: 10, action_type: 'daily_login', description: 'Login diário', created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
    ]
}

const mockPastSeasons = [
    {
        season_id: 'dec-2025',
        season_year: 2025,
        season_month: 12,
        total_xp: 1250,
        rank_id: 'comandante',
        ranking_position: 8,
        confraternities_count: 4,
        badges_count: 5,
        activities: [
            { id: '1', points: 150, action_type: 'badge_reward', description: 'Conquistou medalha: Comandante', created_at: '2025-12-15' },
            { id: '2', points: 50, action_type: 'rating_received', description: 'Avaliação positiva', created_at: '2025-12-20' }
        ]
    },
    {
        season_id: 'nov-2025',
        season_year: 2025,
        season_month: 11,
        total_xp: 680,
        rank_id: 'especialista',
        ranking_position: 15,
        confraternities_count: 2,
        badges_count: 2,
        activities: [
            { id: '1', points: 80, action_type: 'elo_accepted', description: 'Múltiplas conexões', created_at: '2025-11-10' }
        ]
    },
    {
        season_id: 'out-2025',
        season_year: 2025,
        season_month: 10,
        total_xp: 420,
        rank_id: 'especialista',
        ranking_position: 22,
        confraternities_count: 1,
        badges_count: 1,
        activities: []
    },
    {
        season_id: 'set-2025',
        season_year: 2025,
        season_month: 9,
        total_xp: 2100,
        rank_id: 'general',
        ranking_position: 3,
        confraternities_count: 6,
        badges_count: 8,
        activities: [
            { id: '1', points: 200, action_type: 'badge_reward', description: 'Conquistou medalha: General', created_at: '2025-09-25' }
        ]
    }
]

function getActivityIcon(actionType: string) {
    const icons: Record<string, any> = {
        badge_reward: Award,
        elo_accepted: Users,
        connection_accepted: Users,
        confraternity_participation: Users,
        confraternity_host: Star,
        confraternity_photo: Camera,
        message_sent: MessageCircle,
        rating_received: Star,
        daily_login: Flame
    }
    return icons[actionType] || TrendingUp
}

export function BattleHistoryMock() {
    const [expanded, setExpanded] = useState(false)
    const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set())

    function toggleSeasonExpand(seasonId: string) {
        setExpandedSeasons(prev => {
            const newSet = new Set(prev)
            if (newSet.has(seasonId)) {
                newSet.delete(seasonId)
            } else {
                newSet.add(seasonId)
            }
            return newSet
        })
    }

    const visibleSeasons = expanded ? mockPastSeasons : mockPastSeasons.slice(0, 3)

    return (
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#1E4D40]/30 transition-all duration-300 group overflow-hidden">
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                {/* Header com ícone animado - igual aos outros cards */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#B85715] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Swords className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Histórico de Batalha
                            </h3>
                            <p className="text-xs text-gray-600">
                                {mockPastSeasons.length} temporadas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div>
                    {/* Temporada Atual */}
                    <div className="border-b-2 border-[#D2691E]/30 mb-3">
                        <button
                            onClick={() => toggleSeasonExpand('current')}
                            className={cn(
                                "w-full px-3 py-3 text-left",
                                "transition-all duration-300 ease-out",
                                "bg-gradient-to-r from-[#D2691E]/10 to-[#1E4D40]/10",
                                "hover:from-[#D2691E]/20 hover:to-[#1E4D40]/20",
                                "cursor-pointer group/current rounded-lg"
                            )}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ChevronRight className={cn(
                                        "w-4 h-4 text-[#D2691E]",
                                        "transition-all duration-300 ease-out",
                                        expandedSeasons.has('current') && "rotate-90"
                                    )} />
                                    <Flame className="w-4 h-4 text-[#D2691E] animate-pulse" />
                                    <span className="text-sm font-bold uppercase tracking-wider text-[#2D3142]">
                                        {MONTH_NAMES[mockCurrentSeason.season_month]}/{mockCurrentSeason.season_year}
                                    </span>
                                    <span className="text-xs bg-[#D2691E]/20 text-[#D2691E] px-2 py-0.5 rounded-full font-bold">
                                        ATUAL
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RankInsignia
                                        rankId="veterano"
                                        size="xs"
                                        variant="avatar"
                                        className="w-6 h-6 !p-0.5"
                                    />
                                    <div className="flex items-center gap-1 font-bold text-xs">
                                        <span className="text-gray-600">#{mockCurrentSeason.ranking_position}</span>
                                    </div>
                                    <span className="text-sm font-bold text-[#D2691E]">
                                        🔥 {mockCurrentSeason.total_xp.toLocaleString('pt-BR')} pts
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Dropdown de atividades */}
                        <div className={cn(
                            "overflow-hidden transition-all duration-400 ease-out",
                            expandedSeasons.has('current') ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                        )}>
                            <div className="px-4 pb-3 pt-2 bg-gradient-to-b from-[#D2691E]/5 to-transparent">
                                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1.5">
                                    <TrendingUp className="w-3 h-3" />
                                    Atividades do Mês ({mockCurrentSeason.activities.length})
                                </p>
                                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                    {mockCurrentSeason.activities.map((activity) => {
                                        const IconComponent = getActivityIcon(activity.action_type)
                                        const activityDate = new Date(activity.created_at)
                                        return (
                                            <div
                                                key={activity.id}
                                                className="flex items-center gap-2 text-xs bg-background/50 rounded px-2 py-1.5"
                                            >
                                                <IconComponent className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                <span className="flex-1 truncate text-gray-600">
                                                    {activity.description}
                                                </span>
                                                <span className="text-[10px] text-gray-500 flex-shrink-0">
                                                    {activityDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                                </span>
                                                <span className="text-[#D2691E] font-bold flex-shrink-0 min-w-[45px] text-right">
                                                    +{activity.points}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Header da tabela */}
                    <div className="grid grid-cols-[65px_1fr_40px_55px_60px] gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-[8px] font-bold uppercase tracking-wider text-gray-600">
                        <div>Período</div>
                        <div className="text-center">Patente</div>
                        <div className="text-center">Rank</div>
                        <div className="text-center">Confraria</div>
                        <div className="text-right">Vigor</div>
                    </div>

                    {/* Temporadas passadas */}
                    <div className="divide-y divide-border/30">
                        {visibleSeasons.map((season) => {
                            const isOpen = expandedSeasons.has(season.season_id)
                            const hasActivities = season.activities && season.activities.length > 0

                            return (
                                <div key={season.season_id}>
                                    <button
                                        onClick={() => hasActivities && toggleSeasonExpand(season.season_id)}
                                        className={cn(
                                            "w-full grid grid-cols-[65px_1fr_40px_55px_60px] gap-1 px-3 py-2.5 text-left items-center",
                                            "transition-all duration-300 ease-out",
                                            "hover:bg-gradient-to-r hover:from-[#1E4D40]/5 hover:to-[#D2691E]/5",
                                            "hover:shadow-sm",
                                            hasActivities ? "cursor-pointer group" : "cursor-default",
                                            isOpen && "bg-gray-50"
                                        )}
                                    >
                                        <div className="flex items-center gap-1">
                                            {hasActivities && (
                                                <ChevronRight className={cn(
                                                    "w-3 h-3 text-muted-foreground flex-shrink-0",
                                                    "transition-all duration-300 ease-out",
                                                    "group-hover:text-primary",
                                                    isOpen && "rotate-90 text-primary"
                                                )} />
                                            )}
                                            {!hasActivities && <div className="w-3 flex-shrink-0" />}
                                            <span className="text-xs font-bold text-[#2D3142] group-hover:text-[#1E4D40]">
                                                {MONTH_NAMES[season.season_month]}/{String(season.season_year).slice(2)}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-center gap-1.5">
                                            <RankInsignia
                                                rankId={season.rank_id}
                                                size="xs"
                                                variant="avatar"
                                                className="w-6 h-6 !p-0.5"
                                            />
                                        </div>

                                        <div className="flex items-center justify-center">
                                            {season.ranking_position && (
                                                <div className="flex items-center gap-1 font-bold text-xs">
                                                    {season.ranking_position === 1 && <span className="text-base leading-none">🥇</span>}
                                                    {season.ranking_position === 2 && <span className="text-base leading-none">🥈</span>}
                                                    {season.ranking_position === 3 && <span className="text-base leading-none">🥉</span>}
                                                    <span className="text-gray-600">#{season.ranking_position}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center">
                                            <div className="flex items-center gap-0.5 text-gray-600 group-hover:text-[#D2691E]">
                                                <Users className="w-3 h-3" />
                                                <span className="text-xs font-medium">{season.confraternities_count || 0}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 justify-end">
                                            <Flame className={cn(
                                                "w-3 h-3",
                                                season.total_xp >= 2000 ? "text-[#D2691E]" : "text-gray-600"
                                            )} />
                                            <span className={cn(
                                                "text-xs font-bold tabular-nums",
                                                season.total_xp >= 2000 ? "text-[#D2691E]" : "text-[#2D3142]"
                                            )}>
                                                {season.total_xp.toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Dropdown de atividades */}
                                    {hasActivities && (
                                        <div className={cn(
                                            "overflow-hidden transition-all duration-400 ease-out",
                                            isOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                                        )}>
                                            <div className="px-4 pb-3 pt-2 bg-gradient-to-b from-gray-50 to-transparent border-t border-gray-200">
                                                <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2 flex items-center gap-1.5">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Atividades ({season.activities.length})
                                                </p>
                                                <div className="space-y-1.5">
                                                    {season.activities.map((activity) => {
                                                        const IconComponent = getActivityIcon(activity.action_type)
                                                        return (
                                                            <div
                                                                key={activity.id}
                                                                className="flex items-center gap-2 text-xs bg-background/50 rounded px-2 py-1.5"
                                                            >
                                                                <IconComponent className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                                <span className="flex-1 truncate text-gray-600">
                                                                    {activity.description}
                                                                </span>
                                                                <span className="text-[#D2691E] font-bold flex-shrink-0">
                                                                    +{activity.points}
                                                                </span>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Botão Ver Mais */}
                    {mockPastSeasons.length > 3 && (
                        <div className="border-t border-gray-200 p-1.5 bg-gray-50/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-7 text-[10px] text-gray-600 hover:text-[#1E4D40] uppercase tracking-wider"
                                onClick={() => setExpanded(!expanded)}
                            >
                                {expanded ? (
                                    <>
                                        <ChevronUp className="w-3 h-3 mr-1" />
                                        Ver menos
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3 h-3 mr-1" />
                                        Ver todas ({mockPastSeasons.length})
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
