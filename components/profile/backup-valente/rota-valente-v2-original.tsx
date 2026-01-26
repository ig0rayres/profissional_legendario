'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Flame, Map, Zap } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteV2Props {
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
 * VERSÃO 2: PROGRESS FILL
 * - Background que preenche conforme progresso (efeito líquido)
 * - Gradiente dinâmico
 * - Visual impactante
 */
export function RotaValenteV2({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteV2Props) {
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
        <Card className={cn(
            "overflow-hidden relative transition-all duration-700",
            "bg-[#0A1512] border border-[#1E4D40]/30",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* PROGRESSO COMO FILL NO FUNDO - Sobe de baixo para cima */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1E4D40] via-[#2E6B54] to-[#3D8B6B] transition-all duration-[2500ms] ease-out"
                style={{ height: `${progress}%` }}
            />

            {/* Efeito de brilho no topo do líquido */}
            <div
                className="absolute left-0 right-0 h-2 bg-gradient-to-b from-white/20 to-transparent transition-all duration-[2500ms] ease-out"
                style={{ bottom: `${progress}%` }}
            />

            {/* Bolhas decorativas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
                        style={{
                            left: `${15 + i * 15}%`,
                            bottom: `${Math.min(progress - 10, 0) + 5 + i * 3}%`,
                            animationDelay: `${i * 200}ms`
                        }}
                    />
                ))}
            </div>

            <CardContent className="p-4 relative z-10">
                {/* HEADER */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Map className="w-5 h-5 text-[#D4742C]" />
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">
                                ROTA DO VALENTE
                            </h2>
                        </div>
                        <span className="text-xs text-white/50 font-medium">{formattedSeason}</span>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-black/40 backdrop-blur px-3 py-2 rounded-xl border border-white/5">
                            <Flame className="w-4 h-4 text-[#D4742C] mx-auto mb-1" />
                            <span className="text-xl font-black text-white block text-center">{animatedPoints}</span>
                        </div>
                        <div className="bg-black/40 backdrop-blur px-3 py-2 rounded-xl border border-white/5">
                            <Crown className="w-4 h-4 text-[#D4742C] mx-auto mb-1" />
                            <span className="text-xs font-bold text-white block text-center uppercase">
                                {subscription?.plan_tiers?.name || 'RECRUTA'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CENTRO - Patentes e Pontuação */}
                <div className="flex items-center justify-center gap-6 mb-6">
                    {/* Patente Atual */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-[#D4742C] rounded-2xl flex items-center justify-center shadow-xl shadow-[#D4742C]/30 mb-2 mx-auto">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="lg"
                                variant="icon-only"
                                className="text-white"
                            />
                        </div>
                        <span className="text-xs font-bold text-white uppercase">
                            {gamification.rank?.name}
                        </span>
                    </div>

                    {/* Pontuação Grande */}
                    <div className="bg-black/50 backdrop-blur-md px-8 py-4 rounded-2xl border border-white/10">
                        <div className="flex items-center gap-2 justify-center mb-1">
                            <Zap className="w-5 h-5 text-[#D4742C]" />
                            <span className="text-white/60 text-sm font-medium">Progresso</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-4xl font-black text-white">{animatedPoints}</span>
                            <span className="text-lg text-white/40">/ {nextRankPoints}</span>
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[#D4742C] font-bold text-lg">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Próxima Patente */}
                    <div className="text-center">
                        <div className="w-16 h-16 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center mb-2 mx-auto">
                            {nextRank && (
                                <RankInsignia
                                    rankId={nextRank.id}
                                    rankName={nextRank.name}
                                    iconName={nextRank.icon}
                                    size="lg"
                                    variant="icon-only"
                                    className="text-white/40"
                                />
                            )}
                        </div>
                        <span className="text-xs font-bold text-white/40 uppercase">
                            {nextRank?.name || 'Lenda'}
                        </span>
                    </div>
                </div>

                {/* MEDALHAS */}
                <div className="bg-black/30 backdrop-blur rounded-xl p-3 border border-white/5">
                    <div className="flex justify-between items-center">
                        {allMedals.slice(0, 10).map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "relative group transition-all duration-300",
                                        isEarned ? "opacity-100" : "opacity-30 grayscale"
                                    )}
                                    style={{ transitionDelay: `${index * 50}ms` }}
                                >
                                    <div className={cn(
                                        "w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer hover:scale-110",
                                        isEarned
                                            ? "bg-[#D4742C] shadow-lg"
                                            : "bg-white/5"
                                    )}>
                                        <MedalBadge
                                            medalId={medal.id}
                                            size="sm"
                                            variant="icon-only"
                                            className={cn("w-5 h-5", isEarned ? "text-white" : "text-white/30")}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
