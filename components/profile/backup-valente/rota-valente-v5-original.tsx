'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Zap, TrendingUp, Trophy } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteV5Props {
    gamification: GamificationData | null
    subscription: SubscriptionData | null
    nextRank?: RankData | null
    allMedals: MedalData[]
    earnedMedals: UserMedalData[]
}

function useCountUp(end: number, duration: number = 2000) {
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
 * VERSÃO 5: GAMING STATS CARD
 * - Estilo gamer/esports
 * - Gradientes neon
 * - Stats proeminentes
 */
export function RotaValenteV5({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteV5Props) {
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
    const animatedPoints = useCountUp(currentPoints, 2000)
    const earnedCount = earnedMedals.length
    const totalMedals = allMedals.length

    return (
        <Card className={cn(
            "overflow-hidden relative transition-all duration-700",
            "bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]",
            "border border-[#2a2a2a]",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* Glow effect no topo */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4742C] to-transparent" />

            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-[0.02]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
            }} />

            <div className="p-4 relative">
                {/* HEADER GAMING */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-[#D4742C] to-[#F59E0B] rounded-lg flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-white uppercase tracking-wider">
                                ROTA DO VALENTE
                            </h2>
                            <span className="text-[10px] text-[#666] uppercase">{formattedSeason}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-gradient-to-r from-[#D4742C]/20 to-transparent px-3 py-1 rounded-full border border-[#D4742C]/30">
                        <Trophy className="w-3 h-3 text-[#D4742C]" />
                        <span className="text-xs font-bold text-[#D4742C] uppercase">
                            {subscription?.plan_tiers?.name || 'RECRUTA'}
                        </span>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                    {/* Patente */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a] relative overflow-hidden group hover:border-[#D4742C]/50 transition-colors">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#D4742C]/10 to-transparent rounded-bl-full" />
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-2">Patente</span>
                        <div className="w-10 h-10 bg-gradient-to-br from-[#D4742C] to-[#B85A1C] rounded-lg flex items-center justify-center mb-1">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="sm"
                                variant="icon-only"
                                className="text-white"
                            />
                        </div>
                        <span className="text-xs font-bold text-white uppercase">{gamification.rank?.name}</span>
                    </div>

                    {/* Vigor */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a] relative overflow-hidden group hover:border-[#10B981]/50 transition-colors">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-bl-full" />
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-1">Vigor</span>
                        <div className="text-2xl font-black text-white">{animatedPoints}</div>
                        <div className="flex items-center gap-1 text-[#10B981]">
                            <TrendingUp className="w-3 h-3" />
                            <span className="text-[10px] font-bold">+{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Progresso */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a] relative overflow-hidden">
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-1">Meta</span>
                        <div className="text-2xl font-black text-white">{nextRankPoints}</div>
                        <div className="mt-1 h-1 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#D4742C] to-[#F59E0B] transition-all duration-[2000ms] ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Medalhas */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a] relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-colors">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-bl-full" />
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-1">Medalhas</span>
                        <div className="text-2xl font-black text-white">{earnedCount}</div>
                        <span className="text-[10px] text-[#666]">/ {totalMedals}</span>
                    </div>
                </div>

                {/* BARRA DE PROGRESSO GRANDE */}
                <div className="mb-4 bg-[#1a1a1a] rounded-xl p-3 border border-[#2a2a2a]">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-[#666] uppercase tracking-wider">Progresso para {nextRank?.name || 'Próxima Patente'}</span>
                        <span className="text-xs font-bold text-[#D4742C]">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-3 bg-[#2a2a2a] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-[#1E4D40] via-[#D4742C] to-[#F59E0B] transition-all duration-[2000ms] ease-out rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-lg shadow-white/50" />
                        </div>
                    </div>
                </div>

                {/* MEDALHAS GRID */}
                <div className="grid grid-cols-7 gap-2">
                    {allMedals.slice(0, 14).map((medal, index) => {
                        const isEarned = earnedMedalIds.has(medal.id)
                        return (
                            <div
                                key={medal.id}
                                className={cn(
                                    "aspect-square rounded-lg flex items-center justify-center transition-all cursor-pointer hover:scale-110",
                                    isEarned
                                        ? "bg-gradient-to-br from-[#D4742C] to-[#B85A1C] shadow-lg shadow-[#D4742C]/20"
                                        : "bg-[#1a1a1a] border border-[#2a2a2a] opacity-40"
                                )}
                                style={{ transitionDelay: `${index * 30}ms` }}
                            >
                                <MedalBadge
                                    medalId={medal.id}
                                    size="sm"
                                    variant="icon-only"
                                    className={cn("w-4 h-4", isEarned ? "text-white" : "text-[#444]")}
                                />
                            </div>
                        )
                    })}
                </div>
            </div>
        </Card>
    )
}
