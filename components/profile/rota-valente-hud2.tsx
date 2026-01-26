'use client'

import { useEffect, useState } from 'react'
import { Flame, Shield, Target, Swords } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteHUD2Props {
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
 * HUD V2: RPG HEALTH BAR STYLE
 * - Barras de vida/mana estilo RPG
 * - Avatar com moldura
 * - XP bar no estilo clássico de jogos
 */
export function RotaValenteHUD2({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteHUD2Props) {
    const [isVisible, setIsVisible] = useState(false)
    const [progress, setProgress] = useState(0)

    const currentDate = new Date()
    const monthYear = format(currentDate, "MMMM yyyy", { locale: ptBR })

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
            {/* FRAME PRINCIPAL */}
            <div className="relative bg-gradient-to-b from-[#2a1810] to-[#1a0f0a] border-4 border-[#8B4513] rounded-lg p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.5)]">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-6 h-6 border-l-4 border-t-4 border-[#FFD700] -translate-x-1 -translate-y-1" />
                <div className="absolute top-0 right-0 w-6 h-6 border-r-4 border-t-4 border-[#FFD700] translate-x-1 -translate-y-1" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-l-4 border-b-4 border-[#FFD700] -translate-x-1 translate-y-1" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-r-4 border-b-4 border-[#FFD700] translate-x-1 translate-y-1" />

                {/* HEADER */}
                <div className="flex items-center gap-4 mb-4">
                    {/* Avatar Frame */}
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#8B4513] to-[#5D2E0C] rounded-lg p-1 shadow-lg">
                            <div className="w-full h-full bg-[#1a0f0a] rounded flex items-center justify-center">
                                <RankInsignia
                                    rankId={gamification.current_rank_id}
                                    rankName={gamification.rank?.name}
                                    iconName={gamification.rank?.icon}
                                    size="lg"
                                    variant="icon-only"
                                    className="text-[#FFD700]"
                                />
                            </div>
                        </div>
                        {/* Level badge */}
                        <div className="absolute -bottom-2 -right-2 bg-[#8B4513] border-2 border-[#FFD700] rounded-full w-8 h-8 flex items-center justify-center">
                            <span className="text-xs font-black text-[#FFD700]">
                                {gamification.rank?.name?.charAt(0) || 'N'}
                            </span>
                        </div>
                    </div>

                    {/* Bars */}
                    <div className="flex-1 space-y-2">
                        {/* VIGOR (HP) */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                                <Flame className="w-4 h-4 text-[#FF4444]" />
                                <span className="text-xs font-bold text-[#FF4444] uppercase">Vigor</span>
                                <span className="text-xs text-[#FFD700] ml-auto font-mono">
                                    {animatedPoints} / {nextRankPoints}
                                </span>
                            </div>
                            <div className="h-5 bg-[#1a0f0a] rounded border-2 border-[#5D2E0C] overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-[#8B0000] via-[#FF4444] to-[#FF6B6B] transition-all duration-[2000ms] relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                </div>
                            </div>
                        </div>

                        {/* XP BAR */}
                        <div className="relative">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-4 h-4 text-[#4169E1]" />
                                <span className="text-xs font-bold text-[#4169E1] uppercase">XP</span>
                                <span className="text-xs text-[#87CEEB] ml-auto font-mono">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <div className="h-3 bg-[#1a0f0a] rounded border-2 border-[#5D2E0C] overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-[#00008B] via-[#4169E1] to-[#87CEEB] transition-all duration-[2000ms] relative"
                                    style={{ width: `${progress}%` }}
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* INFO PANEL */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#1a0f0a] rounded border border-[#5D2E0C] p-2 text-center">
                        <Shield className="w-4 h-4 text-[#FFD700] mx-auto mb-1" />
                        <span className="text-[10px] text-[#8B4513] block">PATENTE</span>
                        <span className="text-xs font-bold text-[#FFD700] uppercase">{gamification.rank?.name}</span>
                    </div>
                    <div className="bg-[#1a0f0a] rounded border border-[#5D2E0C] p-2 text-center">
                        <Swords className="w-4 h-4 text-[#FFD700] mx-auto mb-1" />
                        <span className="text-[10px] text-[#8B4513] block">PLANO</span>
                        <span className="text-xs font-bold text-[#FFD700] uppercase">
                            {subscription?.plan_tiers?.name || 'RECRUTA'}
                        </span>
                    </div>
                    <div className="bg-[#1a0f0a] rounded border border-[#5D2E0C] p-2 text-center">
                        <Target className="w-4 h-4 text-[#FFD700] mx-auto mb-1" />
                        <span className="text-[10px] text-[#8B4513] block">PRÓXIMO</span>
                        <span className="text-xs font-bold text-[#FFD700]/50 uppercase">{nextRank?.name || 'LENDA'}</span>
                    </div>
                </div>

                {/* MEDALHAS (INVENTORY) */}
                <div className="bg-[#1a0f0a] rounded border border-[#5D2E0C] p-3">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-[#8B4513] uppercase font-bold">Conquistas</span>
                        <div className="flex-1 h-px bg-[#5D2E0C]" />
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                        {allMedals.slice(0, 14).map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "aspect-square flex items-center justify-center rounded border-2 transition-all cursor-pointer hover:scale-110",
                                        isEarned
                                            ? "bg-gradient-to-br from-[#8B4513] to-[#5D2E0C] border-[#FFD700] shadow-lg"
                                            : "bg-[#0a0503] border-[#3D2E0C] opacity-40"
                                    )}
                                    style={{ transitionDelay: `${index * 40}ms` }}
                                >
                                    <MedalBadge
                                        medalId={medal.id}
                                        size="sm"
                                        variant="icon-only"
                                        className={cn("w-4 h-4", isEarned ? "text-[#FFD700]" : "text-[#5D2E0C]")}
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
