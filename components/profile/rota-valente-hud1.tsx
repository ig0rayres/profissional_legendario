'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Crosshair, Heart, Zap, Shield } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteHUD1Props {
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
 * HUD V1: CYBERPUNK HUD
 * - Estilo futurista cyberpunk
 * - Linhas de scan
 * - Bordas angulares cortadas
 */
export function RotaValenteHUD1({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteHUD1Props) {
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

    return (
        <div className={cn(
            "relative transition-all duration-700",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* CONTAINER PRINCIPAL - Cantos cortados estilo cyberpunk */}
            <div
                className="relative bg-black/90 p-4 overflow-hidden"
                style={{
                    clipPath: 'polygon(0 0, calc(100% - 30px) 0, 100% 30px, 100% 100%, 30px 100%, 0 calc(100% - 30px))'
                }}
            >
                {/* Scan lines effect */}
                <div className="absolute inset-0 pointer-events-none opacity-10">
                    <div className="h-full w-full" style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,255,0.03) 2px, rgba(0,255,255,0.03) 4px)'
                    }} />
                </div>

                {/* Glow borders */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

                {/* HEADER */}
                <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <Crosshair className="w-6 h-6 text-cyan-400 animate-pulse" />
                        <div>
                            <h2 className="text-sm font-mono font-bold text-cyan-400 uppercase tracking-[0.3em]">
                                ROTA::VALENTE
                            </h2>
                            <span className="text-[10px] text-cyan-400/50 font-mono">[{formattedSeason.toUpperCase()}]</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 font-mono">
                        <div className="text-right">
                            <span className="text-[10px] text-orange-400/70 block">PLANO_ID</span>
                            <span className="text-sm text-orange-400 font-bold">
                                {subscription?.plan_tiers?.name?.toUpperCase() || 'RECRUTA'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* STATS HUD */}
                <div className="grid grid-cols-3 gap-4 mb-4 relative z-10">
                    {/* PATENTE */}
                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-cyan-400" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-cyan-400" />
                        <div className="bg-cyan-400/5 border border-cyan-400/30 p-3 text-center">
                            <span className="text-[10px] text-cyan-400/50 font-mono block mb-2">RANK_ATUAL</span>
                            <div className="w-12 h-12 bg-cyan-400/20 mx-auto flex items-center justify-center mb-2 border border-cyan-400/50">
                                <RankInsignia
                                    rankId={gamification.current_rank_id}
                                    rankName={gamification.rank?.name}
                                    iconName={gamification.rank?.icon}
                                    size="md"
                                    variant="icon-only"
                                    className="text-cyan-400"
                                />
                            </div>
                            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                                {gamification.rank?.name}
                            </span>
                        </div>
                    </div>

                    {/* VIGOR - Centro */}
                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-orange-500" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-orange-500" />
                        <div className="bg-orange-500/5 border border-orange-500/30 p-3 text-center">
                            <span className="text-[10px] text-orange-400/50 font-mono block mb-1">VIGOR_PTS</span>
                            <div className="text-4xl font-mono font-black text-orange-400">
                                {animatedPoints}
                            </div>
                            <div className="mt-2 h-2 bg-black/50 border border-orange-500/30 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-[2000ms]"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-orange-400/50 font-mono mt-1 block">
                                {Math.round(progress)}% // {nextRankPoints}
                            </span>
                        </div>
                    </div>

                    {/* PRÓXIMO */}
                    <div className="relative">
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-gray-600" />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-gray-600" />
                        <div className="bg-gray-500/5 border border-gray-600/30 p-3 text-center">
                            <span className="text-[10px] text-gray-500/50 font-mono block mb-2">PRÓX_RANK</span>
                            <div className="w-12 h-12 bg-gray-600/20 mx-auto flex items-center justify-center mb-2 border border-dashed border-gray-600/50">
                                {nextRank && (
                                    <RankInsignia
                                        rankId={nextRank.id}
                                        rankName={nextRank.name}
                                        iconName={nextRank.icon}
                                        size="md"
                                        variant="icon-only"
                                        className="text-gray-500"
                                    />
                                )}
                            </div>
                            <span className="text-xs font-mono text-gray-500 font-bold uppercase">
                                {nextRank?.name || 'LENDA'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* MEDALHAS */}
                <div className="relative z-10 border-t border-cyan-400/20 pt-3">
                    <span className="text-[10px] text-cyan-400/50 font-mono mb-2 block">ACHIEVEMENTS_UNLOCKED</span>
                    <div className="flex gap-2 flex-wrap">
                        {allMedals.slice(0, 12).map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center transition-all cursor-pointer hover:scale-110 border",
                                        isEarned
                                            ? "bg-orange-500/20 border-orange-500/50"
                                            : "bg-gray-800/50 border-gray-700/30 opacity-30"
                                    )}
                                    style={{
                                        transitionDelay: `${index * 40}ms`,
                                        clipPath: 'polygon(15% 0, 100% 0, 100% 85%, 85% 100%, 0 100%, 0 15%)'
                                    }}
                                >
                                    <MedalBadge
                                        medalId={medal.id}
                                        size="sm"
                                        variant="icon-only"
                                        className={cn("w-4 h-4", isEarned ? "text-orange-400" : "text-gray-600")}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
