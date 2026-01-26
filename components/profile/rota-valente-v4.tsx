'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Shield, Star, Award, Target } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteV4Props {
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
 * VERSÃO 4: MILITARY BADGE STYLE
 * - Estilo militar/conquista
 * - Bordas angulares
 * - Cores mais intensas
 */
export function RotaValenteV4({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteV4Props) {
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
            "bg-gradient-to-br from-[#1a1f1c] via-[#1E2B26] to-[#0D1411]",
            "border-2 border-[#3D5A4C] shadow-2xl",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* Padrão de fundo militar */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(255,255,255,0.03) 10px,
                        rgba(255,255,255,0.03) 20px
                    )`
                }} />
            </div>

            {/* BARRA DE PROGRESSO LATERAL ESQUERDA */}
            <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#1E4D40]/30">
                <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#D4742C] to-[#F59E0B] transition-all duration-[2000ms] ease-out"
                    style={{ height: `${progress}%` }}
                />
            </div>

            <div className="p-4 pl-6">
                {/* HEADER - Estilo Militar */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#3D5A4C]/50">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-[#D4742C]" />
                        <div>
                            <h2 className="text-base font-black text-[#D4742C] uppercase tracking-[0.2em]">
                                ROTA DO VALENTE
                            </h2>
                            <span className="text-[10px] text-[#7A9B8A] uppercase tracking-widest font-mono">
                                OPERAÇÃO {formattedSeason.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="bg-[#D4742C] px-3 py-1 clip-path-chamfer">
                            <span className="text-xs font-mono font-bold text-white uppercase">
                                {subscription?.plan_tiers?.name || 'RECRUTA'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* CENTRO - Stats Militares */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                    {/* Patente Atual */}
                    <div className="bg-[#1E4D40]/20 border border-[#3D5A4C]/50 p-3 text-center">
                        <span className="text-[10px] text-[#7A9B8A] uppercase tracking-wider block mb-2 font-mono">
                            PATENTE ATUAL
                        </span>
                        <div className="w-14 h-14 bg-[#D4742C] mx-auto flex items-center justify-center mb-2 clip-path-octagon shadow-lg">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="md"
                                variant="icon-only"
                                className="text-white"
                            />
                        </div>
                        <span className="text-sm font-black text-white uppercase tracking-wide">
                            {gamification.rank?.name}
                        </span>
                    </div>

                    {/* Pontuação Central */}
                    <div className="bg-[#1E4D40]/30 border-2 border-[#D4742C]/50 p-3 text-center relative">
                        <Star className="w-4 h-4 text-[#D4742C] absolute top-2 right-2" />
                        <span className="text-[10px] text-[#7A9B8A] uppercase tracking-wider block mb-2 font-mono">
                            PONTOS DE VIGOR
                        </span>
                        <div className="text-4xl font-black text-white font-mono tracking-tight">
                            {animatedPoints}
                        </div>
                        <div className="mt-2 h-2 bg-[#1E4D40]/50 rounded">
                            <div
                                className="h-full bg-[#D4742C] transition-all duration-[2000ms] ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-[#7A9B8A] font-mono mt-1 block">
                            {Math.round(progress)}% CONCLUÍDO
                        </span>
                    </div>

                    {/* Próxima Patente */}
                    <div className="bg-[#1E4D40]/10 border border-dashed border-[#3D5A4C]/50 p-3 text-center">
                        <span className="text-[10px] text-[#7A9B8A]/50 uppercase tracking-wider block mb-2 font-mono">
                            OBJETIVO
                        </span>
                        <div className="w-14 h-14 bg-[#1E4D40]/30 mx-auto flex items-center justify-center mb-2 border-2 border-dashed border-[#3D5A4C]/50 clip-path-octagon">
                            {nextRank ? (
                                <RankInsignia
                                    rankId={nextRank.id}
                                    rankName={nextRank.name}
                                    iconName={nextRank.icon}
                                    size="md"
                                    variant="icon-only"
                                    className="text-[#7A9B8A]/50"
                                />
                            ) : (
                                <Target className="w-6 h-6 text-[#7A9B8A]/50" />
                            )}
                        </div>
                        <span className="text-sm font-black text-[#7A9B8A]/50 uppercase tracking-wide">
                            {nextRank?.name || 'LENDA'}
                        </span>
                    </div>
                </div>

                {/* MEDALHAS - Estilo Militar */}
                <div className="border-t border-[#3D5A4C]/50 pt-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="w-4 h-4 text-[#D4742C]" />
                        <span className="text-[10px] text-[#7A9B8A] uppercase tracking-widest font-mono font-bold">
                            CONDECORAÇÕES
                        </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {allMedals.slice(0, 12).map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "w-8 h-8 flex items-center justify-center transition-all cursor-pointer hover:scale-110",
                                        isEarned
                                            ? "bg-[#D4742C] shadow-lg clip-path-chamfer"
                                            : "bg-[#1E4D40]/30 opacity-40 border border-[#3D5A4C]/30"
                                    )}
                                    style={{ transitionDelay: `${index * 40}ms` }}
                                >
                                    <MedalBadge
                                        medalId={medal.id}
                                        size="sm"
                                        variant="icon-only"
                                        className={cn("w-4 h-4", isEarned ? "text-white" : "text-[#7A9B8A]/50")}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <style jsx>{`
                .clip-path-chamfer {
                    clip-path: polygon(10% 0, 90% 0, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0 90%, 0 10%);
                }
                .clip-path-octagon {
                    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
                }
            `}</style>
        </Card>
    )
}
