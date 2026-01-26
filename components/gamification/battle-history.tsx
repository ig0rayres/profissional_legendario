'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords, Calendar, Loader2, ChevronDown, ChevronUp, Flame, ChevronRight, Users, Trophy, Award, MessageCircle, Star, Camera, TrendingUp, Clock, Medal } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface SeasonHistory {
    season_id: string
    season_name: string
    season_year: number
    season_month: number
    total_xp: number
    rank_id: string
    rank_name: string
    badges_count: number
    ranking_position: number | null
    is_active: boolean
    badges?: { badge_id: string; badge_name: string; badge_description?: string; earned_at: string }[]
    confraternities_count?: number
    activities?: PointsActivity[]
}

interface PointsActivity {
    id: string
    points: number
    action_type: string
    description: string | null
    created_at: string
}

interface BattleHistoryProps {
    userId: string
}

// Nomes curtos dos meses
const MONTH_NAMES = ['', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

// Calcular rank baseado no XP (IDs corretos da tabela ranks)
// novato: 0-199 | especialista: 200-499 | guardiao: 500-999
// comandante: 1000-1999 | general: 2000-3499 | lenda: 3500+
function getRankFromXP(xp: number): string {
    if (xp >= 3500) return 'lenda'
    if (xp >= 2000) return 'general'
    if (xp >= 1000) return 'comandante'
    if (xp >= 500) return 'guardiao'
    if (xp >= 200) return 'especialista'
    return 'novato'
}

function getRankName(rankId: string): string {
    const names: Record<string, string> = {
        'novato': 'Novato',
        'especialista': 'Especialista',
        'guardiao': 'Guardião',
        'comandante': 'Comandante',
        'general': 'General',
        'lenda': 'Lenda'
    }
    return names[rankId] || rankId
}

// Obter ícone do rank - FONTE ÚNICA DE VERDADE
function getRankIcon(rankId: string): string {
    const icons: Record<string, string> = {
        'novato': 'Shield',
        'especialista': 'Target',
        'guardiao': 'ShieldCheck',
        'comandante': 'Medal',
        'general': 'Flame',
        'lenda': 'Crown'
    }
    return icons[rankId] || 'Shield'
}

// Mapear tipo de ação para ícone correspondente
function getActivityIcon(actionType: string) {
    const icons: Record<string, any> = {
        medal_reward: Award,
        badge_reward: Award,
        elo_accepted: Users,
        elo_sent: Users,
        connection_accepted: Users,
        connection_request: Users,
        confraternity_participation: Users,
        confraternity_host: Star,
        confraternity_photo: Camera,
        message_sent: MessageCircle,
        rating_received: Star,
        profile_complete: Award,
        daily_login: Flame
    }
    return icons[actionType] || TrendingUp
}

export function BattleHistory({ userId }: BattleHistoryProps) {
    const [history, setHistory] = useState<SeasonHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set())
    const [ranksMap, setRanksMap] = useState<Map<string, { name: string; icon: string; points_required: number }>>(new Map())
    const [userRankingPosition, setUserRankingPosition] = useState<number | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadRanks()
        loadHistory()
        loadUserRanking()
    }, [userId])

    // Carregar ranks do banco (FONTE ÚNICA - PAINEL ADMIN)
    async function loadRanks() {
        const { data: ranks } = await supabase
            .from('ranks')
            .select('id, name, icon, points_required')
            .order('points_required', { ascending: true })

        if (ranks) {
            const map = new Map(ranks.map(r => [r.id, { name: r.name, icon: r.icon, points_required: r.points_required }]))
            setRanksMap(map)
        }
    }

    // Calcular ranking atual do usuário
    async function loadUserRanking() {
        const { data } = await supabase
            .from('user_gamification')
            .select('total_points')
            .eq('user_id', userId)
            .single()

        if (data) {
            const { count } = await supabase
                .from('user_gamification')
                .select('*', { count: 'exact', head: true })
                .gt('total_points', data.total_points)

            setUserRankingPosition((count || 0) + 1)
        }
    }

    // Helper para obter ícone do rank do banco
    function getRankIconFromDB(rankId: string): string {
        return ranksMap.get(rankId)?.icon || getRankIcon(rankId)
    }

    async function loadHistory() {
        setLoading(true)

        try {
            const { data, error } = await supabase
                .rpc('get_user_season_history', {
                    p_user_id: userId,
                    p_limit: 24
                })

            if (error) {
                console.error('[BattleHistory] Erro ao buscar histórico:', error)
                setHistory([])
            } else {
                // Carregar badges e confraternities para todas as temporadas
                const historyWithData = await Promise.all(
                    (data || []).map(async (season: SeasonHistory) => {
                        let badges: any[] = []
                        let confraternities_count = 0

                        // Carregar badges
                        if (season.badges_count > 0) {
                            const { data: badgesData } = await supabase
                                .from('user_season_badges')
                                .select('badge_id, earned_at')
                                .eq('user_id', userId)
                                .eq('season_id', season.season_id)

                            if (badgesData && badgesData.length > 0) {
                                const badgeIds = badgesData.map(b => b.badge_id)
                                const { data: medals } = await supabase
                                    .from('medals')
                                    .select('id, name, description')
                                    .in('id', badgeIds)

                                const medalsMap = new Map(medals?.map(m => [m.id, { name: m.name, description: m.description }]) || [])

                                badges = badgesData.map(b => ({
                                    badge_id: b.badge_id,
                                    badge_name: medalsMap.get(b.badge_id)?.name || b.badge_id,
                                    badge_description: medalsMap.get(b.badge_id)?.description || '',
                                    earned_at: b.earned_at
                                }))
                            }
                        }

                        // Carregar contagem de confraternities do mês
                        const startDate = new Date(season.season_year, season.season_month - 1, 1)
                        const endDate = new Date(season.season_year, season.season_month, 0, 23, 59, 59)

                        const { count } = await supabase
                            .from('confraternities')
                            .select('*', { count: 'exact', head: true })
                            .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)
                            .gte('date_occurred', startDate.toISOString())
                            .lte('date_occurred', endDate.toISOString())

                        confraternities_count = count || 0

                        // Carregar histórico de pontos do mês (FONTE ÚNICA DE VERDADE)
                        let activities: PointsActivity[] = []

                        // Buscar atividades do mês para exibir (NÃO recalcular total)
                        const { data: allPointsData } = await supabase
                            .from('points_history')
                            .select('id, points, action_type, description, created_at')
                            .eq('user_id', userId)
                            .gte('created_at', startDate.toISOString())
                            .lte('created_at', endDate.toISOString())
                            .order('created_at', { ascending: false })

                        if (allPointsData && allPointsData.length > 0) {
                            // Limitar as atividades exibidas a 10
                            const limitedActivities = allPointsData.slice(0, 10)

                            // Enriquecer atividades de medalha com descrição da badge
                            for (const activity of limitedActivities) {
                                if (activity.action_type === 'badge_unlocked' && activity.description) {
                                    // Extrair nome da badge da descrição (ex: "Conquistou medalha: Presente")
                                    const badgeNameMatch = activity.description.match(/medalha:\s*(.+)/)
                                    if (badgeNameMatch) {
                                        const badgeName = badgeNameMatch[1]

                                        // Buscar descrição da badge
                                        const { data: badgeData } = await supabase
                                            .from('badges')
                                            .select('description')
                                            .eq('name', badgeName)
                                            .single()


                                        // Formato: "Nome - Descrição" (sem "Conquistou medalha:")
                                        if (badgeData?.description) {
                                            activity.description = `${badgeName} - ${badgeData.description}`
                                        } else {
                                            activity.description = badgeName
                                        }
                                    }
                                }
                            }

                            activities = limitedActivities
                        }

                        return {
                            ...season,
                            // Manter total_xp da RPC (fonte única de verdade)
                            badges,
                            confraternities_count,
                            activities
                        }
                    })
                )
                setHistory(historyWithData)
            }
        } catch (err) {
            console.error('[BattleHistory] Exceção:', err)
            setHistory([])
        } finally {
            setLoading(false)
        }
    }

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

    // Separar temporada atual das passadas
    const currentSeason = history.find(h => h.is_active)
    const pastSeasons = history.filter(h => !h.is_active)
    const visibleSeasons = expanded ? pastSeasons : pastSeasons.slice(0, 6)

    if (loading) {
        return (
            <Card className="bg-white border border-gray-200 shadow-md">
                <CardContent className="p-5">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-[#1E4D40]" />
                    </div>
                </CardContent>
            </Card>
        )
    }


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
                                {pastSeasons.length} temporadas
                            </p>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div>
                    {/* Temporada Atual - Formato Dropdown */}
                    {currentSeason && (
                        <div className="border-b-2 border-[#D2691E]/30">
                            <button
                                onClick={() => toggleSeasonExpand('current')}
                                className={cn(
                                    "w-full px-3 py-3 text-left",
                                    "transition-all duration-300 ease-out",
                                    "bg-gradient-to-r from-[#D2691E]/10 to-[#1E4D40]/10",
                                    "hover:from-[#D2691E]/20 hover:to-[#1E4D40]/20",
                                    "cursor-pointer group"
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
                                            {MONTH_NAMES[currentSeason.season_month]}/{currentSeason.season_year}
                                        </span>
                                        <span className="text-xs bg-[#D2691E]/20 text-[#D2691E] px-2 py-0.5 rounded-full font-bold">
                                            ATUAL
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <RankInsignia
                                            rankId={getRankFromXP(currentSeason.total_xp)}
                                            iconName={getRankIconFromDB(getRankFromXP(currentSeason.total_xp))}
                                            size="xs"
                                            variant="avatar"
                                            className="w-6 h-6 !p-0.5"
                                        />
                                        {(currentSeason.ranking_position || userRankingPosition) && (
                                            <div className="flex items-center gap-1 font-bold text-xs">
                                                {(currentSeason.ranking_position || userRankingPosition) === 1 && <span className="text-base leading-none">🥇</span>}
                                                {(currentSeason.ranking_position || userRankingPosition) === 2 && <span className="text-base leading-none">🥈</span>}
                                                {(currentSeason.ranking_position || userRankingPosition) === 3 && <span className="text-base leading-none">🥉</span>}
                                                <span className="text-gray-600">#{currentSeason.ranking_position || userRankingPosition}</span>
                                            </div>
                                        )}
                                        <span className="text-sm font-bold text-[#D2691E]">
                                            🔥 {currentSeason.total_xp.toLocaleString('pt-BR')} pts
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
                                    {currentSeason.activities && currentSeason.activities.length > 0 ? (
                                        <>
                                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                                <TrendingUp className="w-3 h-3" />
                                                Atividades do Mês ({currentSeason.activities.length})
                                            </p>
                                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                                {currentSeason.activities.map((activity) => {
                                                    const IconComponent = getActivityIcon(activity.action_type)
                                                    const activityDate = new Date(activity.created_at)
                                                    return (
                                                        <div
                                                            key={activity.id}
                                                            className="flex items-center gap-2 text-xs bg-background/50 rounded px-2 py-1.5"
                                                        >
                                                            <IconComponent className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                            <span className="flex-1 truncate text-gray-600">
                                                                {activity.description || activity.action_type}
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
                                        </>
                                    ) : (
                                        <p className="text-xs text-gray-600 text-center py-3">
                                            Nenhuma atividade registrada este mês
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header da tabela de temporadas passadas */}
                    {pastSeasons.length > 0 && (
                        <>
                            <div className="grid grid-cols-[65px_1fr_40px_55px_60px] gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-200 text-[8px] font-bold uppercase tracking-wider text-gray-600">
                                <div>Período</div>
                                <div className="text-center">Patente</div>
                                <div className="text-center">Rank</div>
                                <div className="text-center">Confraria</div>
                                <div className="text-right">Vigor</div>
                            </div>
                        </>
                    )}

                    <div className="divide-y divide-border/30">
                        {visibleSeasons.map((season) => {
                            const isOpen = expandedSeasons.has(season.season_id)
                            const hasBadges = season.badges && season.badges.length > 0
                            const hasActivities = season.activities && season.activities.length > 0
                            // Calcular rank correto baseado no XP
                            const correctRankId = getRankFromXP(season.total_xp)
                            const correctRankName = getRankName(correctRankId)

                            return (
                                <div key={season.season_id}>
                                    {/* Linha principal - clicável */}
                                    <button
                                        onClick={() => (hasBadges || hasActivities) && toggleSeasonExpand(season.season_id)}
                                        className={cn(
                                            "w-full grid grid-cols-[65px_1fr_40px_55px_60px] gap-1 px-3 py-2.5 text-left items-center",
                                            "transition-all duration-300 ease-out",
                                            "hover:bg-gradient-to-r hover:from-[#1E4D40]/5 hover:to-[#D2691E]/5",
                                            "hover:shadow-sm",
                                            (hasBadges || hasActivities) ? "cursor-pointer group" : "cursor-default",
                                            isOpen && "bg-gray-50"
                                        )}
                                    >
                                        {/* Período */}
                                        <div className="flex items-center gap-1">
                                            {(hasBadges || hasActivities) && (
                                                <ChevronRight className={cn(
                                                    "w-3 h-3 text-gray-400 flex-shrink-0",
                                                    "transition-all duration-300 ease-out",
                                                    "group-hover:text-[#1E4D40]",
                                                    isOpen && "rotate-90 text-[#1E4D40]"
                                                )} />
                                            )}
                                            {!(hasBadges || hasActivities) && <div className="w-3 flex-shrink-0" />}
                                            <span className={cn(
                                                "text-xs font-bold text-[#2D3142]",
                                                "transition-colors duration-200",
                                                "group-hover:text-[#1E4D40]"
                                            )}>
                                                {MONTH_NAMES[season.season_month]}/{String(season.season_year).slice(2)}
                                            </span>
                                        </div>

                                        {/* Patente */}
                                        <div className="flex items-center justify-center gap-1.5">
                                            <div className={cn(
                                                "transition-all duration-300 ease-out",
                                                "group-hover:scale-110 group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                                            )}>
                                                <RankInsignia
                                                    rankId={correctRankId}
                                                    iconName={getRankIconFromDB(correctRankId)}
                                                    size="xs"
                                                    variant="avatar"
                                                    className="w-6 h-6 !p-0.5"
                                                />
                                            </div>
                                            <span className={cn(
                                                "text-[11px] text-muted-foreground hidden sm:inline",
                                                "transition-colors duration-200",
                                                "group-hover:text-foreground"
                                            )}>
                                                {correctRankName}
                                            </span>
                                        </div>

                                        {/* Ranking */}
                                        <div className="flex items-center justify-center">
                                            {season.ranking_position ? (
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className={cn(
                                                                "flex items-center gap-1 font-bold text-xs",
                                                                "transition-all duration-300",
                                                                season.ranking_position <= 3 && "group-hover:scale-110"
                                                            )}>
                                                                {season.ranking_position === 1 && (
                                                                    <span className="text-base leading-none">🥇</span>
                                                                )}
                                                                {season.ranking_position === 2 && (
                                                                    <span className="text-base leading-none">🥈</span>
                                                                )}
                                                                {season.ranking_position === 3 && (
                                                                    <span className="text-base leading-none">🥉</span>
                                                                )}
                                                                <span className="text-muted-foreground">#{season.ranking_position}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p className="text-xs">
                                                                {season.ranking_position === 1 && "🥇 Campeão da temporada!"}
                                                                {season.ranking_position === 2 && "🥈 Vice-campeão"}
                                                                {season.ranking_position === 3 && "🥉 3º lugar no pódio"}
                                                                {season.ranking_position > 3 && `Posição #${season.ranking_position} no ranking`}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            ) : (
                                                <span className="text-[10px] text-muted-foreground/50">-</span>
                                            )}
                                        </div>

                                        {/* Confrarias */}
                                        <div className="flex items-center justify-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <div className={cn(
                                                            "flex items-center gap-0.5 text-muted-foreground",
                                                            "transition-all duration-200",
                                                            "group-hover:text-accent group-hover:scale-105"
                                                        )}>
                                                            <Users className="w-3 h-3" />
                                                            <span className="text-xs font-medium">
                                                                {season.confraternities_count || 0}
                                                            </span>
                                                        </div>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p className="text-xs">Confrarias realizadas</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>

                                        {/* Vigor */}
                                        <div className={cn(
                                            "flex items-center gap-1 justify-end",
                                            "transition-all duration-200",
                                            "group-hover:scale-105"
                                        )}>
                                            <Flame className={cn(
                                                "w-3 h-3 transition-all duration-300",
                                                season.total_xp >= 2000 ? "text-accent group-hover:animate-pulse" :
                                                    season.total_xp >= 1000 ? "text-primary" :
                                                        "text-muted-foreground"
                                            )} />
                                            <span className={cn(
                                                "text-xs font-bold tabular-nums transition-colors duration-200",
                                                season.total_xp >= 2000 ? "text-accent" :
                                                    season.total_xp >= 1000 ? "text-primary" :
                                                        "text-foreground"
                                            )}>
                                                {season.total_xp.toLocaleString('pt-BR')}
                                            </span>
                                        </div>
                                    </button>

                                    {/* Dropdown de medalhas e atividades - com animação de entrada */}
                                    <div className={cn(
                                        "overflow-hidden transition-all duration-400 ease-out",
                                        isOpen && (hasBadges || hasActivities) ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                                    )}>
                                        <div className="px-4 pb-3 pt-2 bg-gradient-to-b from-muted/30 to-muted/10 border-t border-border/20 space-y-4">
                                            {/* Medalhas */}
                                            {hasBadges && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                                                        <Award className="w-3 h-3" />
                                                        Medalhas conquistadas
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <TooltipProvider>
                                                            {season.badges!.map((badge, index) => (
                                                                <Tooltip key={badge.badge_id}>
                                                                    <TooltipTrigger asChild>
                                                                        <div
                                                                            className={cn(
                                                                                "cursor-pointer transition-all duration-300",
                                                                                "hover:scale-125 hover:-translate-y-1",
                                                                                "hover:drop-shadow-[0_4px_12px_rgba(var(--accent),0.4)]"
                                                                            )}
                                                                            style={{
                                                                                animationDelay: `${index * 50}ms`,
                                                                                animation: isOpen ? 'slideInUp 0.3s ease-out forwards' : 'none'
                                                                            }}
                                                                        >
                                                                            <MedalBadge
                                                                                medalId={badge.badge_id}
                                                                                size="sm"
                                                                                variant="icon-only"
                                                                                className="w-7 h-7 shadow-md"
                                                                            />
                                                                        </div>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent
                                                                        className="max-w-[220px] bg-background/95 backdrop-blur-sm border-primary/20"
                                                                        sideOffset={8}
                                                                    >
                                                                        <p className="font-bold text-sm text-primary">{badge.badge_name}</p>
                                                                        {badge.badge_description && (
                                                                            <p className="text-xs text-muted-foreground mt-1">{badge.badge_description}</p>
                                                                        )}
                                                                    </TooltipContent>
                                                                </Tooltip>
                                                            ))}
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Atividades/Pontos */}
                                            {hasActivities && (
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                                                        <TrendingUp className="w-3 h-3" />
                                                        Atividades ({season.activities!.length})
                                                    </p>
                                                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                                        {season.activities!.map((activity) => {
                                                            const IconComponent = getActivityIcon(activity.action_type)
                                                            return (
                                                                <div
                                                                    key={activity.id}
                                                                    className="flex items-center gap-2 text-xs bg-background/50 rounded px-2 py-1.5"
                                                                >
                                                                    <IconComponent className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                                                    <span className="flex-1 truncate text-muted-foreground">
                                                                        {activity.description || activity.action_type}
                                                                    </span>
                                                                    <span className="text-accent font-bold flex-shrink-0">
                                                                        +{activity.points}
                                                                    </span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Botão Ver Mais/Menos */}
                    {pastSeasons.length > 6 && (
                        <div className="border-t border-border/50 p-1.5 bg-muted/10">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full h-7 text-[10px] text-muted-foreground hover:text-foreground uppercase tracking-wider"
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
                                        Ver todas ({pastSeasons.length})
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
