'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Crown, Flame, Map, ChevronRight } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteV3Props {
    gamification: GamificationData | null
    subscription: SubscriptionData | null
    nextRank?: RankData | null
    allMedals: MedalData[]
    earnedMedals: UserMedalData[]
}

function useCountUp(end: number, duration: number = 2700) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let startTime: number | null = null
        let animationFrame: number
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 4)
            setCount(Math.floor(end * eased))
            if (progress < 1) animationFrame = requestAnimationFrame(animate)
        }
        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration])
    return count
}

/**
 * VERSÃO 3: GLASSMORPHISM HORIZONTAL
 * - Layout horizontal mais compacto
 * - Glassmorphism elegante
 * - Barra de progresso sutil
 */
export function RotaValenteV3({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteV3Props) {
    const [isVisible, setIsVisible] = useState(false)
    const [progress, setProgress] = useState(0)

    const currentDate = new Date()
    const monthYear = format(currentDate, "MMMM yyyy", { locale: ptBR })
    const formattedSeason = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

    useEffect(() => {
        setIsVisible(true)
        const timer = setTimeout(() => {
            const total = nextRank?.points_required || 200
            const current = gamification?.total_points || 0
            setProgress(Math.min((current / total) * 100, 100))
        }, 300)
        return () => clearTimeout(timer)
    }, [gamification, nextRank])

    if (!gamification) return null

    const currentPoints = gamification.total_points || 0
    const nextRankPoints = nextRank?.points_required || 200
    const earnedMedalIds = new Set(earnedMedals.map(um => um.medal_id))
    const animatedPoints = useCountUp(currentPoints, 2700)

    return (
        <Card className={cn(
            "overflow-hidden relative transition-all duration-700",
            "bg-white/5 backdrop-blur-xl border border-white/10",
            "shadow-2xl shadow-black/20",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* PROGRESS BAR NO TOPO */}
            <div className="h-1 bg-black/20 w-full">
                <div
                    className="h-full bg-gradient-to-r from-[#1E4D40] via-[#2E8B60] to-[#D4742C] transition-all duration-[2700ms] ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-4">
                {/* HEADER */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1E4D40] rounded-xl flex items-center justify-center">
                            <Map className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-wider">
                                ROTA DO VALENTE
                            </h2>
                            <span className="text-xs text-white/40">{formattedSeason}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                            <Flame className="w-4 h-4 text-[#D4742C]" />
                            <span className="text-lg font-black text-white">{animatedPoints}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                            <Crown className="w-4 h-4 text-[#D4742C]" />
                            <span className="text-xs font-bold text-white uppercase">
                                {subscription?.plan_tiers?.name || 'RECRUTA'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* PATENTES + PROGRESSO */}
                <div className="flex items-center gap-4 mb-4">
                    {/* Patente Atual */}
                    <div className="flex items-center gap-3 bg-[#1E4D40]/30 backdrop-blur px-4 py-3 rounded-xl flex-shrink-0">
                        <div className="w-12 h-12 bg-[#D4742C] rounded-xl flex items-center justify-center shadow-lg">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="md"
                                variant="icon-only"
                                className="text-white"
                            />
                        </div>
                        <div>
                            <span className="text-[10px] text-white/50 uppercase font-medium block">Patente</span>
                            <span className="text-sm font-black text-white uppercase">
                                {gamification.rank?.name}
                            </span>
                        </div>
                    </div>

                    {/* Barra Central */}
                    <div className="flex-1 flex items-center gap-3">
                        <div className="flex-1">
                            <div className="h-4 bg-black/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[#1E4D40] to-[#D4742C] transition-all duration-[2700ms] ease-out rounded-full relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                </div>
                            </div>
                            <div className="flex justify-between mt-1">
                                <span className="text-xs text-white/50">{animatedPoints} pts</span>
                                <span className="text-xs text-white/30">{nextRankPoints} pts</span>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-white/30" />
                    </div>

                    {/* Próxima Patente */}
                    <div className="flex items-center gap-3 bg-white/5 backdrop-blur px-4 py-3 rounded-xl flex-shrink-0 border border-dashed border-white/10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                            {nextRank && (
                                <RankInsignia
                                    rankId={nextRank.id}
                                    rankName={nextRank.name}
                                    iconName={nextRank.icon}
                                    size="md"
                                    variant="icon-only"
                                    className="text-white/50"
                                />
                            )}
                        </div>
                        <div>
                            <span className="text-[10px] text-white/30 uppercase font-medium block">Próxima</span>
                            <span className="text-sm font-black text-white/50 uppercase">
                                {nextRank?.name || 'Lenda'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* MEDALHAS EM LINHA */}
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mr-2">Medalhas</span>
                    <div className="flex gap-1.5 flex-wrap">
                        {allMedals.slice(0, 14).map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "w-7 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer hover:scale-110",
                                        isEarned
                                            ? "bg-[#D4742C] shadow-md"
                                            : "bg-white/5 opacity-30"
                                    )}
                                    style={{ transitionDelay: `${index * 30}ms` }}
                                >
                                    <MedalBadge
                                        medalId={medal.id}
                                        size="sm"
                                        variant="icon-only"
                                        className={cn("w-4 h-4", isEarned ? "text-white" : "text-white/30")}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </Card>
    )
}
