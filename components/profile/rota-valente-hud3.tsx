'use client'

import { useEffect, useState } from 'react'
import { Activity, Gauge, Radio, Wifi } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteHUD3Props {
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
 * HUD V3: TACTICAL OVERLAY
 * - Estilo militar/tático moderno
 * - HUD de cockpit de avião/drone
 * - Indicadores de instrumentos
 */
export function RotaValenteHUD3({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteHUD3Props) {
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
    const earnedCount = earnedMedals.length

    return (
        <div className={cn(
            "relative transition-all duration-700 font-mono",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* CONTAINER */}
            <div className="relative bg-[#0a1a0a] border border-[#1a3a1a] overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: `
                        linear-gradient(rgba(0,255,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,255,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }} />

                {/* TOP BAR */}
                <div className="bg-[#0f2a0f] border-b border-[#1a3a1a] px-4 py-2 flex items-center justify-between relative">
                    <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#00FF00] animate-pulse" />
                        <span className="text-xs text-[#00FF00] uppercase tracking-widest">ROTA::VALENTE</span>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-[#00FF00]/70">
                        <span className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            ONLINE
                        </span>
                        <span>{monthYear.toUpperCase()}</span>
                    </div>
                </div>

                <div className="p-4 relative z-10">
                    {/* MAIN DISPLAY */}
                    <div className="flex items-center gap-4 mb-4">
                        {/* GAUGE - Velocímetro circular */}
                        <div className="relative w-28 h-28">
                            {/* Fundo do gauge */}
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {/* Track */}
                                <circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="#1a3a1a"
                                    strokeWidth="8"
                                />
                                {/* Progress */}
                                <circle
                                    cx="50" cy="50" r="42"
                                    fill="none"
                                    stroke="#00FF00"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray={`${progress * 2.64} 264`}
                                    className="transition-all duration-[2000ms]"
                                    style={{ filter: 'drop-shadow(0 0 4px #00FF00)' }}
                                />
                            </svg>
                            {/* Centro */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <RankInsignia
                                    rankId={gamification.current_rank_id}
                                    rankName={gamification.rank?.name}
                                    iconName={gamification.rank?.icon}
                                    size="md"
                                    variant="icon-only"
                                    className="text-[#00FF00]"
                                />
                                <span className="text-[10px] text-[#00FF00] mt-1 uppercase">{gamification.rank?.name}</span>
                            </div>
                        </div>

                        {/* STATS */}
                        <div className="flex-1 space-y-3">
                            {/* VIGOR */}
                            <div className="bg-[#0a1a0a] border border-[#1a3a1a] p-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-[#00FF00]/70 flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        VIGOR_LEVEL
                                    </span>
                                    <span className="text-sm text-[#00FF00] font-bold">{animatedPoints}</span>
                                </div>
                                <div className="h-2 bg-[#0f1f0f] overflow-hidden">
                                    <div
                                        className="h-full bg-[#00FF00] transition-all duration-[2000ms]"
                                        style={{
                                            width: `${progress}%`,
                                            boxShadow: '0 0 10px #00FF00'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* TARGET */}
                            <div className="bg-[#0a1a0a] border border-[#1a3a1a] p-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] text-[#00FF00]/70 flex items-center gap-1">
                                        <Gauge className="w-3 h-3" />
                                        TARGET_LOCK
                                    </span>
                                    <span className="text-sm text-[#00FF00]/50">{nextRankPoints} PTS</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-[#00FF00]/50">PRÓXIMO: {nextRank?.name?.toUpperCase() || 'LENDA'}</span>
                                    <span className="text-[#00FF00]">{Math.round(progress)}%</span>
                                </div>
                            </div>

                            {/* PLANO */}
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-[#00FF00]/50">TIER:</span>
                                <span className="text-xs text-[#00FF00] bg-[#00FF00]/10 px-2 py-0.5 border border-[#00FF00]/30">
                                    {subscription?.plan_tiers?.name?.toUpperCase() || 'RECRUTA'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ACHIEVEMENTS GRID */}
                    <div className="border border-[#1a3a1a] bg-[#0a1a0a] p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] text-[#00FF00]/70">ACHIEVEMENTS [{earnedCount}/{allMedals.length}]</span>
                            <span className="text-[10px] text-[#00FF00]">{Math.round((earnedCount / allMedals.length) * 100)}% COMPLETE</span>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {allMedals.slice(0, 12).map((medal, index) => {
                                const isEarned = earnedMedalIds.has(medal.id)
                                return (
                                    <div
                                        key={medal.id}
                                        className={cn(
                                            "w-8 h-8 flex items-center justify-center transition-all cursor-pointer hover:scale-110 border",
                                            isEarned
                                                ? "bg-[#00FF00]/10 border-[#00FF00]/50"
                                                : "bg-[#0a1a0a] border-[#1a3a1a] opacity-30"
                                        )}
                                        style={{ transitionDelay: `${index * 40}ms` }}
                                    >
                                        <MedalBadge
                                            medalId={medal.id}
                                            size="sm"
                                            variant="icon-only"
                                            className={cn("w-4 h-4", isEarned ? "text-[#00FF00]" : "text-[#1a3a1a]")}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* BOTTOM STATUS BAR */}
                <div className="bg-[#0f2a0f] border-t border-[#1a3a1a] px-4 py-1 flex items-center justify-between text-[10px] text-[#00FF00]/50">
                    <span>SYS::OPERATIONAL</span>
                    <span className="text-[#00FF00] animate-pulse">● ACTIVE</span>
                </div>
            </div>
        </div>
    )
}
