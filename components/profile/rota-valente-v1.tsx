'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Flame, Map, Target } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteV1Props {
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
 * VERSÃO 1: MINIMAL COMPACT
 * - 20% mais baixo
 * - Barra de progresso no fundo
 * - Design limpo e direto
 */
export function RotaValenteV1({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteV1Props) {
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
            "bg-gradient-to-br from-[#1A2421] to-[#0F1F1A] border border-[#2D3B2D]/50",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* BARRA DE PROGRESSO NO FUNDO - Preenche da esquerda para direita */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-[#1E4D40] to-[#2E6B54] transition-all duration-[2700ms] ease-out"
                style={{ width: `${progress}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />

            <CardContent className="p-4 relative z-10">
                {/* HEADER */}
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                            <Map className="w-5 h-5 text-[#D4742C]" />
                            ROTA DO VALENTE
                        </h2>
                        <span className="text-xs text-white/60">{formattedSeason}</span>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-1">
                                <Flame className="w-3 h-3 text-[#D4742C]" />
                                <span className="text-xs text-white/70">Vigor</span>
                            </div>
                            <span className="text-xl font-black text-white">{animatedPoints}</span>
                        </div>
                        <div className="bg-black/30 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-1">
                                <Crown className="w-3 h-3 text-[#D4742C]" />
                                <span className="text-xs text-white/70">Plano</span>
                            </div>
                            <span className="text-sm font-black text-white uppercase">
                                {subscription?.plan_tiers?.name || 'RECRUTA'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* PROGRESSO CENTRAL */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    {/* Patente Atual */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-[#D4742C] rounded-xl flex items-center justify-center shadow-lg">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="md"
                                variant="icon-only"
                                className="text-white"
                            />
                        </div>
                        <span className="text-[10px] font-bold text-white/80 mt-1 uppercase">
                            {gamification.rank?.name || 'Novato'}
                        </span>
                    </div>

                    {/* Barra de Progresso Visual */}
                    <div className="flex-1 flex flex-col items-center">
                        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-[#D4742C] to-[#F97316] transition-all duration-[2700ms] ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-2xl font-black text-white">{animatedPoints}</span>
                            <span className="text-sm text-white/50">/ {nextRankPoints} pts</span>
                        </div>
                    </div>

                    {/* Próxima Patente */}
                    <div className="flex flex-col items-center">
                        <div className="w-14 h-14 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border-2 border-dashed border-white/30">
                            {nextRank ? (
                                <RankInsignia
                                    rankId={nextRank.id}
                                    rankName={nextRank.name}
                                    iconName={nextRank.icon}
                                    size="md"
                                    variant="icon-only"
                                    className="text-white/70"
                                />
                            ) : (
                                <Target className="w-6 h-6 text-white/50" />
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-white/50 mt-1 uppercase">
                            {nextRank?.name || 'Lenda'}
                        </span>
                    </div>
                </div>

                {/* MEDALHAS */}
                <div className="flex justify-between items-center px-2">
                    {allMedals.slice(0, 12).map((medal, index) => {
                        const isEarned = earnedMedalIds.has(medal.id)
                        return (
                            <div
                                key={medal.id}
                                className={cn(
                                    "relative group transition-all duration-300",
                                    isEarned ? "opacity-100" : "opacity-40 grayscale"
                                )}
                                style={{ transitionDelay: `${index * 50}ms` }}
                            >
                                <div className={cn(
                                    "w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer hover:scale-110",
                                    isEarned
                                        ? "bg-[#D4742C] shadow-lg shadow-[#D4742C]/30"
                                        : "bg-white/10"
                                )}>
                                    <MedalBadge
                                        medalId={medal.id}
                                        size="sm"
                                        variant="icon-only"
                                        className={cn("w-4 h-4", isEarned ? "text-white" : "text-white/50")}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
