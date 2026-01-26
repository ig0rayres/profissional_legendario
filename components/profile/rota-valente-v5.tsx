'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Zap, TrendingUp, Trophy, Target, Gamepad2, Star } from 'lucide-react'
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

function useCountUp(end: number, duration: number = 2300) {
    const [count, setCount] = useState(0)
    useEffect(() => {
        let startTime: number | null = null
        let animationFrame: number
        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp
            const elapsed = timestamp - startTime
            const progress = Math.min(elapsed / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 5)
            setCount(Math.floor(end * eased))
            if (progress < 1) animationFrame = requestAnimationFrame(animate)
        }
        animationFrame = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(animationFrame)
    }, [end, duration])
    return count
}

/**
 * VERSÃO 5 MELHORADA: GAMING STATS PRO
 * - Animação 15% mais lenta
 * - Visual gaming mais refinado
 * - Glow effects aprimorados
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
    const [glowIntensity, setGlowIntensity] = useState(0)

    const currentDate = new Date()
    const monthYear = format(currentDate, "MMMM yyyy", { locale: ptBR })
    const formattedSeason = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

    useEffect(() => {
        setIsVisible(true)
        const timer = setTimeout(() => {
            const total = nextRank?.points_required || 200
            const current = gamification?.total_points || 0
            setProgress(Math.min((current / total) * 100, 100))
        }, 400)

        // Glow pulse effect
        const glowTimer = setInterval(() => {
            setGlowIntensity(prev => prev === 0 ? 1 : 0)
        }, 2000)

        return () => {
            clearTimeout(timer)
            clearInterval(glowTimer)
        }
    }, [gamification, nextRank])

    if (!gamification) return null

    const currentPoints = gamification.total_points || 0
    const nextRankPoints = nextRank?.points_required || 200
    const earnedMedalIds = new Set(earnedMedals.map(um => um.medal_id))
    const animatedPoints = useCountUp(currentPoints, 2300)
    const earnedCount = earnedMedals.length
    const totalMedals = allMedals.length

    return (
        <Card className={cn(
            "overflow-hidden relative transition-all duration-1000",
            "bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]",
            "border border-[#2a2a2a] shadow-2xl",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}>
            {/* Glow effect no topo */}
            <div
                className="absolute top-0 left-0 right-0 h-px transition-all duration-1000"
                style={{
                    background: `linear-gradient(to right, transparent, ${glowIntensity ? '#F59E0B' : '#D4742C'}, transparent)`,
                    boxShadow: glowIntensity ? '0 0 20px #D4742C' : 'none'
                }}
            />

            {/* Background grid pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                backgroundSize: '20px 20px'
            }} />

            <div className="p-5 relative">
                {/* HEADER GAMING */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#D4742C] to-[#F59E0B] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4742C]/30">
                            <Gamepad2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-white uppercase tracking-wider">
                                ROTA DO VALENTE
                            </h2>
                            <span className="text-[10px] text-[#666] uppercase font-medium">{formattedSeason}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-[#D4742C]/20 to-transparent px-4 py-1.5 rounded-full border border-[#D4742C]/30">
                            <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-[#D4742C]" />
                                <span className="text-sm font-bold text-[#D4742C] uppercase">
                                    {subscription?.plan_tiers?.name || 'RECRUTA'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STATS GRID */}
                <div className="grid grid-cols-4 gap-4 mb-5">
                    {/* Patente */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] relative overflow-hidden group hover:border-[#D4742C]/50 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#D4742C]/10 to-transparent rounded-bl-full" />
                        <Star className="w-4 h-4 text-[#D4742C] absolute top-3 right-3 opacity-50" />
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-2 font-semibold">Patente</span>
                        <div className="w-12 h-12 bg-gradient-to-br from-[#D4742C] to-[#B85A1C] rounded-xl flex items-center justify-center mb-2 shadow-lg shadow-[#D4742C]/30 group-hover:scale-110 transition-transform">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="md"
                                variant="icon-only"
                                className="text-white"
                            />
                        </div>
                        <span className="text-sm font-bold text-white uppercase">{gamification.rank?.name}</span>
                    </div>

                    {/* Vigor */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] relative overflow-hidden group hover:border-[#10B981]/50 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#10B981]/10 to-transparent rounded-bl-full" />
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-2 font-semibold">Vigor</span>
                        <div className="text-3xl font-black text-white tabular-nums">{animatedPoints}</div>
                        <div className="flex items-center gap-1 text-[#10B981] mt-1">
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span className="text-xs font-bold">+{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Progresso */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] relative overflow-hidden group hover:border-[#D4742C]/50 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#D4742C]/10 to-transparent rounded-bl-full" />
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-2 font-semibold">Meta</span>
                        <div className="text-3xl font-black text-white tabular-nums">{nextRankPoints}</div>
                        <div className="mt-2 h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#D4742C] to-[#F59E0B] transition-all duration-[2300ms] ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Medalhas */}
                    <div className="col-span-1 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a] relative overflow-hidden group hover:border-[#8B5CF6]/50 transition-all">
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-bl-full" />
                        <span className="text-[9px] text-[#666] uppercase tracking-wider block mb-2 font-semibold">Medalhas</span>
                        <div className="text-3xl font-black text-white">{earnedCount}</div>
                        <span className="text-xs text-[#666] font-medium">/ {totalMedals}</span>
                    </div>
                </div>

                {/* BARRA DE PROGRESSO GRANDE */}
                <div className="mb-5 bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
                    <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-[#D4742C]" />
                            <span className="text-xs text-[#666] uppercase tracking-wider font-semibold">
                                Progresso para {nextRank?.name || 'Próxima Patente'}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-[#D4742C]">{Math.round(progress)}%</span>
                    </div>
                    <div className="h-4 bg-[#2a2a2a] rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-[#1E4D40] via-[#D4742C] to-[#F59E0B] transition-all duration-[2300ms] ease-out rounded-full relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent" />
                            <div
                                className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"
                                style={{ boxShadow: '0 0 10px rgba(255,255,255,0.8)' }}
                            />
                        </div>
                    </div>
                </div>

                {/* MEDALHAS GRID */}
                <div className="bg-[#1a1a1a] rounded-2xl p-4 border border-[#2a2a2a]">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-[#666] uppercase tracking-wider font-semibold">Conquistas</span>
                        <span className="text-xs text-[#D4742C] font-bold">{earnedCount}/{totalMedals}</span>
                    </div>
                    <div className="grid grid-cols-7 gap-3">
                        {allMedals.slice(0, 14).map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "aspect-square rounded-xl flex items-center justify-center transition-all cursor-pointer group",
                                        "hover:scale-110 hover:-translate-y-1",
                                        isEarned
                                            ? "bg-gradient-to-br from-[#D4742C] to-[#B85A1C] shadow-lg shadow-[#D4742C]/30"
                                            : "bg-[#252525] border border-[#2a2a2a] opacity-40"
                                    )}
                                    style={{
                                        transitionDelay: `${index * 40}ms`,
                                        transform: isVisible ? 'scale(1)' : 'scale(0)'
                                    }}
                                >
                                    <MedalBadge
                                        medalId={medal.id}
                                        size="sm"
                                        variant="icon-only"
                                        className={cn("w-5 h-5", isEarned ? "text-white" : "text-[#444]")}
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
