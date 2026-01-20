'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Swords, Calendar, Loader2, ChevronDown, ChevronUp, Flame, ChevronRight, Users, Trophy } from 'lucide-react'
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

export function BattleHistory({ userId }: BattleHistoryProps) {
    const [history, setHistory] = useState<SeasonHistory[]>([])
    const [loading, setLoading] = useState(true)
    const [expanded, setExpanded] = useState(false)
    const [expandedSeasons, setExpandedSeasons] = useState<Set<string>>(new Set())
    const supabase = createClient()

    useEffect(() => {
        loadHistory()
    }, [userId])

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

                        return {
                            ...season,
                            badges,
                            confraternities_count
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

    // Filtrar temporadas passadas (não a atual)
    const pastSeasons = history.filter(h => !h.is_active)
    const visibleSeasons = expanded ? pastSeasons : pastSeasons.slice(0, 6)

    if (loading) {
        return (
            <Card className="glass-card border-primary/10 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                        <Swords className="w-4 h-4 text-accent" />
                        Histórico de Batalha
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (pastSeasons.length === 0) {
        return (
            <Card className="glass-card border-primary/10 shadow-lg">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-xs font-black uppercase tracking-widest">
                        <Swords className="w-4 h-4 text-accent" />
                        Histórico de Batalha
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-4 text-muted-foreground">
                        <Calendar className="w-6 h-6 mx-auto mb-2 opacity-30" />
                        <p className="text-[10px] uppercase tracking-wide">Nenhuma temporada anterior</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="glass-card border-primary/10 shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-2 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="flex items-center justify-between text-xs font-black uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Swords className="w-4 h-4 text-accent" />
                        Histórico de Batalha
                    </div>
                    <span className="text-[10px] font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                        {pastSeasons.length} temporadas
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {/* Header da tabela */}
                <div className="grid grid-cols-[65px_1fr_40px_55px_60px] gap-1 px-3 py-1.5 bg-muted/40 border-b border-border/50 text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div>Período</div>
                    <div className="text-center">Patente</div>
                    <div className="text-center">Rank</div>
                    <div className="text-center">Confraria</div>
                    <div className="text-right">Vigor</div>
                </div>

                <div className="divide-y divide-border/30">
                    {visibleSeasons.map((season) => {
                        const isOpen = expandedSeasons.has(season.season_id)
                        const hasBadges = season.badges && season.badges.length > 0
                        // Calcular rank correto baseado no XP
                        const correctRankId = getRankFromXP(season.total_xp)
                        const correctRankName = getRankName(correctRankId)

                        return (
                            <div key={season.season_id}>
                                {/* Linha principal - clicável */}
                                <button
                                    onClick={() => hasBadges && toggleSeasonExpand(season.season_id)}
                                    className={cn(
                                        "w-full grid grid-cols-[65px_1fr_40px_55px_60px] gap-1 px-3 py-2.5 text-left items-center",
                                        "transition-all duration-300 ease-out",
                                        "hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5",
                                        "hover:shadow-[inset_0_0_20px_rgba(var(--primary),0.05)]",
                                        hasBadges ? "cursor-pointer group" : "cursor-default",
                                        isOpen && "bg-muted/20"
                                    )}
                                >
                                    {/* Período */}
                                    <div className="flex items-center gap-1">
                                        {hasBadges && (
                                            <ChevronRight className={cn(
                                                "w-3 h-3 text-muted-foreground flex-shrink-0",
                                                "transition-all duration-300 ease-out",
                                                "group-hover:text-primary",
                                                isOpen && "rotate-90 text-primary"
                                            )} />
                                        )}
                                        {!hasBadges && <div className="w-3 flex-shrink-0" />}
                                        <span className={cn(
                                            "text-xs font-bold text-foreground",
                                            "transition-colors duration-200",
                                            "group-hover:text-primary"
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
                                                            "flex items-center gap-0.5 font-bold text-xs",
                                                            "transition-all duration-300",
                                                            // Destaque APENAS para Top 3
                                                            season.ranking_position <= 3 && "group-hover:scale-110",
                                                            season.ranking_position === 1 && "text-yellow-500 group-hover:drop-shadow-[0_0_6px_rgba(234,179,8,0.6)]",
                                                            season.ranking_position === 2 && "text-slate-400 group-hover:drop-shadow-[0_0_6px_rgba(148,163,184,0.6)]",
                                                            season.ranking_position === 3 && "text-amber-600 group-hover:drop-shadow-[0_0_6px_rgba(217,119,6,0.6)]",
                                                            season.ranking_position > 3 && "text-muted-foreground/60"
                                                        )}>
                                                            {season.ranking_position <= 3 && (
                                                                <Trophy className={cn(
                                                                    "w-3.5 h-3.5",
                                                                    season.ranking_position === 1 && "text-yellow-500 animate-pulse",
                                                                    season.ranking_position === 2 && "text-slate-400",
                                                                    season.ranking_position === 3 && "text-amber-600"
                                                                )} />
                                                            )}
                                                            <span>#{season.ranking_position}</span>
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

                                {/* Dropdown de medalhas - com animação de entrada */}
                                <div className={cn(
                                    "overflow-hidden transition-all duration-400 ease-out",
                                    isOpen && hasBadges ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                                )}>
                                    <div className="px-4 pb-3 pt-2 bg-gradient-to-b from-muted/30 to-muted/10 border-t border-border/20">
                                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2.5 flex items-center gap-1.5">
                                            <span className="w-8 h-px bg-gradient-to-r from-transparent to-border" />
                                            Medalhas conquistadas
                                            <span className="w-8 h-px bg-gradient-to-l from-transparent to-border" />
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
            </CardContent>
        </Card>
    )
}
