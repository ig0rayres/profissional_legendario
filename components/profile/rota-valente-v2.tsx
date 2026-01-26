'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Flame, Map, Zap, Waves } from 'lucide-react'
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
 * VERSÃO 2 MELHORADA: PROGRESS FILL PRO
 * - Animação 15% mais lenta
 * - Efeito de "líquido" mais orgânico
 * - Bolhas animadas
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
        }, 400)
        return () => clearTimeout(timer)
    }, [gamification, nextRank])

    if (!gamification) return null

    const currentPoints = gamification.total_points || 0
    const nextRankPoints = nextRank?.points_required || 200
    const earnedMedalIds = new Set(earnedMedals.map(um => um.medal_id))
    const animatedPoints = useCountUp(currentPoints, 2300)

    return (
        <Card className={cn(
            "overflow-hidden relative transition-all duration-1000",
            "bg-[#0A1512] border border-[#1E4D40]/40 shadow-2xl shadow-black/50",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}>
            {/* PROGRESSO COMO FILL NO FUNDO - Sobe de baixo para cima */}
            <div
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#1E4D40] via-[#2E6B54] to-[#3D8B6B]/80 transition-all duration-[2800ms] ease-out"
                style={{ height: `${progress}%` }}
            />

            {/* Wave effect no topo do líquido */}
            <div
                className="absolute left-0 right-0 transition-all duration-[2800ms] ease-out"
                style={{ bottom: `${progress}%` }}
            >
                <svg className="w-full h-4 -mb-1" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path
                        d="M0,5 Q25,0 50,5 T100,5 V10 H0 Z"
                        fill="rgba(62, 139, 107, 0.6)"
                        className="animate-pulse"
                    />
                </svg>
            </div>

            {/* Glow no topo do líquido */}
            <div
                className="absolute left-0 right-0 h-8 bg-gradient-to-b from-white/10 to-transparent transition-all duration-[2800ms] blur-sm"
                style={{ bottom: `${progress}%` }}
            />

            {/* Bolhas animadas */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(10)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "absolute rounded-full bg-white/20 animate-bounce",
                            i % 3 === 0 ? "w-2 h-2" : i % 3 === 1 ? "w-1.5 h-1.5" : "w-1 h-1"
                        )}
                        style={{
                            left: `${10 + i * 8}%`,
                            bottom: `${Math.min(progress - 15, 0) + 5 + (i % 5) * 4}%`,
                            animationDelay: `${i * 150}ms`,
                            animationDuration: `${1500 + i * 100}ms`,
                            opacity: progress > 10 ? 0.6 : 0
                        }}
                    />
                ))}
            </div>

            <CardContent className="p-5 relative z-10">
                {/* HEADER */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Map className="w-5 h-5 text-[#D4742C]" />
                            <h2 className="text-lg font-black text-white uppercase tracking-wider">
                                ROTA DO VALENTE
                            </h2>
                        </div>
                        <span className="text-xs text-white/40 font-medium flex items-center gap-1">
                            <Waves className="w-3 h-3" />
                            {formattedSeason}
                        </span>
                    </div>

                    <div className="flex gap-2">
                        <div className="bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                            <Flame className="w-5 h-5 text-[#D4742C] mx-auto mb-1" />
                            <span className="text-2xl font-black text-white block text-center tabular-nums">{animatedPoints}</span>
                        </div>
                        <div className="bg-black/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                            <Crown className="w-5 h-5 text-[#D4742C] mx-auto mb-1" />
                            <span className="text-xs font-bold text-white block text-center uppercase">
                                {subscription?.plan_tiers?.name || 'RECRUTA'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CENTRO - Patentes e Pontuação */}
                <div className="flex items-center justify-center gap-8 mb-6">
                    {/* Patente Atual */}
                    <div className="text-center group">
                        <div className="w-20 h-20 bg-gradient-to-br from-[#D4742C] to-[#B85A1C] rounded-2xl flex items-center justify-center shadow-2xl shadow-[#D4742C]/40 mb-2 mx-auto group-hover:scale-110 transition-transform duration-300">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="lg"
                                variant="icon-only"
                                className="text-white drop-shadow-lg"
                            />
                        </div>
                        <span className="text-sm font-bold text-white uppercase tracking-wide">
                            {gamification.rank?.name}
                        </span>
                    </div>

                    {/* Pontuação Grande */}
                    <div className="bg-black/60 backdrop-blur-xl px-10 py-6 rounded-3xl border border-white/10 shadow-2xl">
                        <div className="flex items-center gap-2 justify-center mb-2">
                            <Zap className="w-6 h-6 text-[#D4742C]" />
                            <span className="text-white/50 text-sm font-semibold uppercase tracking-wider">Progresso</span>
                        </div>
                        <div className="flex items-baseline justify-center gap-2 mb-3">
                            <span className="text-5xl font-black text-white tabular-nums">{animatedPoints}</span>
                            <span className="text-xl text-white/30 font-medium">/ {nextRankPoints}</span>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#D4742C] to-[#F59E0B] transition-all duration-[2300ms] rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-[#D4742C] font-black text-xl">{Math.round(progress)}%</span>
                        </div>
                    </div>

                    {/* Próxima Patente */}
                    <div className="text-center group">
                        <div className="w-20 h-20 bg-white/5 border-2 border-dashed border-white/20 rounded-2xl flex items-center justify-center mb-2 mx-auto group-hover:border-white/40 transition-colors">
                            {nextRank && (
                                <RankInsignia
                                    rankId={nextRank.id}
                                    rankName={nextRank.name}
                                    iconName={nextRank.icon}
                                    size="lg"
                                    variant="icon-only"
                                    className="text-white/30 group-hover:text-white/50 transition-colors"
                                />
                            )}
                        </div>
                        <span className="text-sm font-bold text-white/30 uppercase tracking-wide">
                            {nextRank?.name || 'Lenda'}
                        </span>
                    </div>
                </div>

                {/* MEDALHAS */}
                <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Conquistas Desbloqueadas</span>
                        <span className="text-xs text-[#D4742C] font-bold">{earnedMedals.length} / {allMedals.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        {allMedals.slice(0, 10).map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "relative group transition-all duration-500",
                                        isEarned ? "opacity-100" : "opacity-25 grayscale"
                                    )}
                                    style={{
                                        transitionDelay: `${index * 70}ms`,
                                        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(10px)'
                                    }}
                                >
                                    <div className={cn(
                                        "w-10 h-10 flex items-center justify-center rounded-xl transition-all cursor-pointer",
                                        "group-hover:scale-125 group-hover:-translate-y-2",
                                        isEarned
                                            ? "bg-gradient-to-br from-[#D4742C] to-[#B85A1C] shadow-xl shadow-[#D4742C]/40"
                                            : "bg-white/5 border border-white/10"
                                    )}>
                                        <MedalBadge
                                            medalId={medal.id}
                                            size="sm"
                                            variant="icon-only"
                                            className={cn("w-5 h-5", isEarned ? "text-white" : "text-white/20")}
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
