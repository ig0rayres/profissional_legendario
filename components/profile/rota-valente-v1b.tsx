'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Crown, Flame, Map, Target, Zap } from 'lucide-react'
import { DynamicIcon } from '@/components/rota-valente/dynamic-icon'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData } from '@/lib/profile/types'

// Tipos de Proeza
interface Proeza {
    id: string
    name: string
    icon: string
    points_base: number
    description: string
    category?: string
}

interface UserProeza {
    proeza_id: string
    points_earned: number
    earned_at: string
}

interface RotaValenteV1BProps {
    gamification: GamificationData | null
    subscription: SubscriptionData | null
    nextRank?: RankData | null
    allProezas: Proeza[]
    earnedProezas: UserProeza[]
}

function useCountUp(end: number, duration: number = 4800) {
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
 * VERSÃO 1B: V1 + CARD CENTRAL + TODAS AS MEDALHAS
 * - Exatamente igual ao V1
 * - Card central com números abaixo da barra
 * - TODAS as medalhas animadas
 */
export function RotaValenteV1B({
    gamification,
    subscription,
    nextRank,
    allProezas,
    earnedProezas
}: RotaValenteV1BProps) {
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
    const earnedProezaIds = new Set(earnedProezas.map(up => up.proeza_id))
    const animatedPoints = useCountUp(currentPoints, 4800)

    // Ref para o container de proezas
    const proezasContainerRef = useRef<HTMLDivElement>(null)
    const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Ordenar proezas: conquistadas primeiro
    const sortedProezas = [...allProezas].sort((a, b) => {
        const aEarned = earnedProezaIds.has(a.id)
        const bEarned = earnedProezaIds.has(b.id)
        if (aEarned && !bEarned) return -1
        if (!aEarned && bEarned) return 1
        return 0
    })

    // Scroll automático baseado na posição do mouse
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const container = proezasContainerRef.current
        if (!container) return

        const rect = container.getBoundingClientRect()
        const mouseX = e.clientX - rect.left
        const containerWidth = rect.width
        const edgeZone = 60 // Zona de 60px nas bordas

        // Limpar intervalo anterior
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current)
            scrollIntervalRef.current = null
        }

        // Se mouse está na zona esquerda, scroll para esquerda
        if (mouseX < edgeZone) {
            const speed = Math.max(1, (edgeZone - mouseX) / 10)
            scrollIntervalRef.current = setInterval(() => {
                container.scrollLeft -= speed * 2
            }, 16)
        }
        // Se mouse está na zona direita, scroll para direita
        else if (mouseX > containerWidth - edgeZone) {
            const speed = Math.max(1, (mouseX - (containerWidth - edgeZone)) / 10)
            scrollIntervalRef.current = setInterval(() => {
                container.scrollLeft += speed * 2
            }, 16)
        }
    }, [])

    const handleMouseLeave = useCallback(() => {
        if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current)
            scrollIntervalRef.current = null
        }
    }, [])

    return (
        <Card className={cn(
            "relative transition-all duration-700",
            "bg-gradient-to-br from-[#1A2421] to-[#0F1F1A] border border-[#2D3B2D]/50",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}>
            {/* BARRA DE PROGRESSO NO FUNDO - Preenche da esquerda para direita */}
            <div
                className="absolute inset-0 bg-gradient-to-r from-[#1E4D40] to-[#2E6B54] transition-all duration-[4800ms] ease-out"
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
                        <span className={cn(
                            "text-[10px] font-bold mt-1 uppercase transition-colors duration-[4800ms]",
                            progress > 5 ? "text-white" : "text-[#1E4D40]"
                        )}>
                            {gamification.rank?.name || 'Novato'}
                        </span>
                    </div>

                    {/* Barra de Progresso Visual + Card Central Sobreposto */}
                    <div className="flex-1 relative">
                        {/* Barra de Progresso */}
                        <div className="w-full h-3 bg-black/30 rounded-full overflow-hidden border border-white/10">
                            <div
                                className="h-full bg-gradient-to-r from-[#D4742C] to-[#F97316] transition-all duration-[4800ms] ease-out rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* CARD CENTRAL QUADRADO - Sobrepondo a barra */}
                        <div className="absolute left-1/2 -translate-x-1/2 -top-12 bg-black/20 backdrop-blur-sm px-6 py-2.5 rounded-xl border border-white/20 shadow-lg">
                            <div className="flex items-center gap-1.5 justify-center mb-0.5">
                                <Zap className="w-3.5 h-3.5 text-[#D4742C]" />
                                <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">Progresso</span>
                            </div>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-[26px] font-black text-white tabular-nums">{animatedPoints}</span>
                                <span className="text-sm text-white/70 font-medium">/ {nextRankPoints}</span>
                            </div>
                            <div className="text-center">
                                <span className="text-[#D4742C] font-black text-base">{Math.round(progress)}%</span>
                            </div>
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
                        <span className={cn(
                            "text-[10px] font-bold mt-1 uppercase transition-colors duration-[4800ms]",
                            progress > 95 ? "text-white" : "text-[#1E4D40]/70"
                        )}>
                            {nextRank?.name || 'Lenda'}
                        </span>
                    </div>
                </div>

                {/* TODAS AS PROEZAS ANIMADAS COM TOOLTIP - SCROLL AUTOMÁTICO */}
                <TooltipProvider>
                    <div
                        ref={proezasContainerRef}
                        onMouseMove={handleMouseMove}
                        onMouseLeave={handleMouseLeave}
                        className="flex gap-2 overflow-x-hidden cursor-default"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {sortedProezas.map((proeza, index) => {
                            const isEarned = earnedProezaIds.has(proeza.id)
                            return (
                                <Tooltip key={proeza.id}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "relative group transition-all duration-500",
                                                isEarned ? "opacity-100" : "opacity-40 grayscale"
                                            )}
                                            style={{
                                                transitionDelay: `${index * 50}ms`,
                                                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.5) translateY(10px)'
                                            }}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 flex items-center justify-center rounded-full transition-all cursor-pointer hover:scale-125 hover:-translate-y-1",
                                                isEarned
                                                    ? "bg-[#D4742C] shadow-lg shadow-[#D4742C]/30"
                                                    : "bg-white/10"
                                            )}>
                                                <DynamicIcon
                                                    name={proeza.icon || 'Flame'}
                                                    size="sm"
                                                    className={cn("w-4 h-4", isEarned ? "text-white" : "text-white/50")}
                                                />
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent className="bg-[#1A2421] border-[#3D6B54] text-white p-3 shadow-xl">
                                        <p className="font-bold text-[#D4742C] text-xs uppercase tracking-wider mb-1">{proeza.name}</p>
                                        {proeza.description && (
                                            <p className="text-[10px] text-gray-300 leading-tight max-w-[150px]">{proeza.description}</p>
                                        )}
                                        <p className="text-[10px] text-white/50 mt-1">+{proeza.points_base} Vigor</p>
                                        {isEarned && (
                                            <p className="text-[10px] text-green-400 mt-1 font-semibold">✓ Conquistada</p>
                                        )}
                                    </TooltipContent>
                                </Tooltip>
                            )
                        })}
                    </div>
                </TooltipProvider>
            </CardContent>
        </Card>
    )
}
