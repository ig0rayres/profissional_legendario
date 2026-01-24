'use client'

import { useEffect, useState, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Crown, Flame, Trophy, Map } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { GamificationData, SubscriptionData, RankData, MedalData, UserMedalData } from '@/lib/profile/types'

interface RotaValenteCardProps {
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

export function RotaValenteCard({
    gamification,
    subscription,
    nextRank,
    allMedals,
    earnedMedals
}: RotaValenteCardProps) {
    const [isVisible, setIsVisible] = useState(false)
    const [trailProgress, setTrailProgress] = useState(0)
    const [markerPos, setMarkerPos] = useState({ x: 40, y: 120 })
    const [animComplete, setAnimComplete] = useState(false)
    const pathRef = useRef<SVGPathElement>(null)

    // Data Dinâmica: Janeiro 2026
    const currentDate = new Date()
    const monthYear = format(currentDate, "MMMM yyyy", { locale: ptBR })
    const formattedSeason = monthYear.charAt(0).toUpperCase() + monthYear.slice(1)

    useEffect(() => {
        setIsVisible(true)
        const timer = setTimeout(() => {
            const total = nextRank?.points_required || 200
            const current = gamification?.total_points || 0
            const progress = Math.min((current / total) * 100, 100)
            setTrailProgress(progress)

            setTimeout(() => {
                setAnimComplete(true)
            }, 2000)
        }, 500)
        return () => clearTimeout(timer)
    }, [gamification, nextRank])

    useEffect(() => {
        if (pathRef.current && trailProgress > 0) {
            try {
                const length = pathRef.current.getTotalLength()
                const point = pathRef.current.getPointAtLength(length * (trailProgress / 100))
                setMarkerPos({ x: point.x, y: point.y })
            } catch (e) { }
        }
    }, [trailProgress])

    if (!gamification) return null

    const currentPoints = gamification.total_points || 0
    const nextRankPoints = nextRank?.points_required || 200
    const earnedMedalIds = new Set(earnedMedals.map(um => um.medal_id))
    const animatedPoints = useCountUp(currentPoints, 2000)

    const sortedMedals = [...allMedals].sort((a, b) => {
        const aEarned = earnedMedalIds.has(a.id)
        const bEarned = earnedMedalIds.has(b.id)
        if (aEarned && !bEarned) return -1
        if (!aEarned && bEarned) return 1
        return 0
    })

    const pathD = "M 40,120 C 80,120 80,40 140,60 S 200,160 260,140 S 340,40 400,60 S 480,160 560,100"

    return (
        <Card className={cn(
            "overflow-hidden relative transition-all duration-1000 shadow-2xl shadow-black/30 group/card",
            "bg-[#1A2421]/60 border border-[#2D3B2D] backdrop-blur-sm",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
            <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center z-0">
                <div className="opacity-[0.03] scale-150 transform rotate-6 blur-[0.5px]">
                    <Image
                        src="/images/logo-rotabusiness.png"
                        alt=""
                        width={600}
                        height={600}
                    />
                </div>
            </div>

            <CardContent className="p-4 relative flex flex-col h-full z-10 w-full">

                {/* ========== HEADER ========== */}
                <div className="flex justify-between items-start w-full mb-3">
                    <div className="mt-1">
                        <h2 className="text-xl md:text-2xl font-black text-[#F2F4F3] uppercase tracking-widest drop-shadow-sm flex items-center gap-2">
                            <Map className="w-6 h-6 text-[#1E4D40]" />
                            ROTA DO VALENTE
                            <span className="text-[#1E4D40] hidden sm:inline-block">-</span>
                            <span className="text-[#1E4D40] text-lg md:text-xl font-bold normal-case tracking-normal">
                                {formattedSeason}
                            </span>
                        </h2>
                        <div className="h-1.5 w-16 bg-[#1E4D40] mt-1 rounded-full opacity-40"></div>
                    </div>

                    <div className="flex gap-3">
                        <div className="bg-[#1E4D40] text-white px-4 py-2 rounded-xl shadow-lg flex flex-col items-center min-w-[90px] transform hover:scale-105 transition-transform border-b-4 border-[#0F1F1A]">
                            <div className="flex items-center gap-1 mb-1 opacity-80">
                                <Flame className="w-3 h-3 text-[#D2691E] fill-[#D2691E]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Vigor</span>
                            </div>
                            <span className="text-2xl font-black leading-none tracking-tight tabular-nums">{animatedPoints}</span>
                        </div>

                        <div className="bg-[#1E4D40] text-white px-3 sm:px-4 py-2 rounded-xl shadow-lg flex flex-col items-center min-w-[100px] transform hover:scale-105 transition-transform border-b-4 border-[#0F1F1A]">
                            <div className="flex items-center gap-1 mb-1 opacity-80">
                                <Crown className="w-3 h-3 text-[#D2691E] fill-[#D2691E]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Plano</span>
                            </div>
                            <span className="text-lg sm:text-lg font-black uppercase leading-none tracking-tight break-keep whitespace-nowrap">
                                {subscription?.plan_tiers?.name || 'ELITE'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ========== TRILHA ========== */}
                <div className="relative w-full h-44 flex items-center justify-center mb-1 select-none">

                    {/* Badge START (Padronizado + Ícone Dinâmico) */}
                    <div className="absolute left-1 top-[55%] -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300">
                        <div className="relative w-16 h-16 bg-[#1E4D40] text-white rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(30,77,64,0.5)] border-2 border-[#D2691E]/30">
                            <RankInsignia
                                rankId={gamification.current_rank_id}
                                rankName={gamification.rank?.name}
                                iconName={gamification.rank?.icon}
                                size="lg"
                                variant="icon-only"
                                className="text-white drop-shadow-md pb-1"
                            />
                        </div>
                        <span className="mt-2 font-black text-[#F2F4F3] uppercase text-[10px] tracking-wide bg-[#1E4D40]/90 px-3 py-0.5 rounded-full shadow-sm border border-[#D2691E]/30">
                            {gamification.rank?.name || 'Novato'}
                        </span>
                    </div>

                    {/* Badge END (Padronizado + Ícone Dinâmico) */}
                    <div className="absolute right-1 top-[40%] -translate-y-1/2 z-20 flex flex-col items-center group cursor-pointer hover:scale-110 transition-transform duration-300">
                        <div className="relative w-16 h-16 bg-[#F2F4F3] text-[#1E4D40] rounded-2xl flex items-center justify-center shadow-[0_8px_20px_rgba(30,77,64,0.3)] border-4 border-[#1E4D40]">
                            {nextRank ? (
                                <RankInsignia
                                    rankId={nextRank.id}
                                    rankName={nextRank.name}
                                    iconName={nextRank.icon}
                                    size="lg"
                                    variant="icon-only"
                                    className="text-[#1E4D40]"
                                />
                            ) : (
                                <Trophy className="w-7 h-7 text-[#D2691E]" />
                            )}
                        </div>
                        <div className="mt-2 bg-[#1E4D40] px-3 py-0.5 rounded-full shadow-md">
                            <span className="font-black text-white uppercase text-[10px] tracking-wide block text-center min-w-[60px]">
                                {nextRank?.name || 'Lenda'}
                            </span>
                        </div>
                    </div>

                    <svg className="w-full h-full visible overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
                        <defs>
                            <filter id="innerShadow">
                                <feFlood floodColor="#0d1f16" floodOpacity="0.4" />
                                <feComposite operator="out" in2="SourceGraphic" />
                                <feGaussianBlur stdDeviation="2" />
                                <feComposite operator="atop" in2="SourceGraphic" />
                            </filter>
                        </defs>

                        <path
                            d={pathD}
                            fill="none"
                            stroke="#3D6B54"
                            strokeWidth="28"
                            strokeLinecap="round"
                            className="drop-shadow-lg opacity-90"
                        />
                        <path
                            d={pathD}
                            fill="none"
                            stroke="#4a7c62"
                            strokeWidth="22"
                            strokeLinecap="round"
                        />

                        <circle cx="140" cy="85" r="6" fill="#1a2e26" opacity="0.6" />
                        <circle cx="260" cy="115" r="8" fill="#1a2e26" opacity="0.4" />
                        <circle cx="400" cy="85" r="5" fill="#1a2e26" opacity="0.6" />

                        <path
                            ref={pathRef}
                            d={pathD}
                            fill="none"
                            stroke="#D4742C"
                            strokeWidth="16"
                            strokeLinecap="round"
                            strokeDasharray="1"
                            strokeDashoffset={1 - (trailProgress / 100)}
                            pathLength={1}
                            className="transition-all duration-[2000ms] ease-out shadow-[0_0_15px_rgba(212,116,44,0.5)]"
                        />

                        <path
                            d={pathD}
                            fill="none"
                            stroke="rgba(255,255,255,0.3)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeDasharray="6 10"
                            className="pointer-events-none"
                        />

                        <g
                            style={{ transform: `translate(${markerPos.x}px, ${markerPos.y}px)` }}
                            className="transition-transform duration-[2000ms] ease-out"
                        >
                            <g className={cn("transition-opacity duration-500", animComplete ? "opacity-100" : "opacity-0")}>
                                <circle cx="0" cy="0" r="5" fill="#1a2e26" stroke="white" strokeWidth="2" />
                                <line x1="0" y1="0" x2="0" y2="-28" stroke="#1a2e26" strokeWidth="2.5" />
                                <path d="M0,-28 L18,-20 L0,-12 Z" fill="#D4742C" stroke="#1a2e26" strokeWidth="1" />
                            </g>
                        </g>
                    </svg>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                        <div className="bg-white/95 backdrop-blur-md border border-[#2E4A3E]/20 rounded-2xl px-5 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.15)] flex flex-col items-center min-w-[160px] animate-in zoom-in fade-in duration-700 delay-300">
                            <div className="w-full h-2 bg-gray-100 rounded-full mb-1.5 overflow-hidden border border-gray-200">
                                <div
                                    className="h-full bg-[#3D6B54] transition-all duration-[2000ms] ease-out"
                                    style={{ width: `${trailProgress}%` }}
                                />
                            </div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-3xl font-black text-[#2E4A3E] tabular-nums tracking-tighter shadow-black">
                                    {animatedPoints}
                                </span>
                                <span className="text-sm font-bold text-[#D4742C] tracking-tight">/ {nextRankPoints} Pts</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========== FOOTER: Medalhas ========== */}
                <div className="w-full mt-3">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="h-[2px] bg-[#2E4A3E]/10 flex-1 rounded-full"></div>
                        <span className="text-[10px] font-black text-[#2E4A3E] uppercase tracking-widest bg-[#2E4A3E]/5 px-3 py-1 rounded-full">Quadro de Medalhas</span>
                        <div className="h-[2px] bg-[#2E4A3E]/10 flex-1 rounded-full"></div>
                    </div>

                    <div className="flex w-full justify-between items-center px-1">
                        {allMedals.map((medal, index) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            return (
                                <div
                                    key={medal.id}
                                    className={cn(
                                        "relative group/medal transition-all duration-300 z-10",
                                        isEarned ? "opacity-100" : "opacity-80 grayscale-[20%] hover:scale-105",
                                        isVisible ? "scale-100" : "scale-0"
                                    )}
                                    style={{ transitionDelay: `${index * 40}ms` }}
                                >
                                    <div className={cn(
                                        "w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 transition-all relative cursor-pointer hover:scale-110 shadow-sm",
                                        isEarned
                                            ? "bg-[#D4742C] border-[#D4742C] text-white shadow-md ring-2 ring-[#D4742C]/20"
                                            : "bg-[#9ca3af] border-transparent hover:bg-[#6b7280]" // LOCKED: Cinza Escuro (gray-400)
                                    )}>
                                        <MedalBadge
                                            medalId={medal.id}
                                            size="sm"
                                            variant={isEarned ? "icon-only" : "profile"}
                                            className={cn("w-5 h-5 sm:w-6 sm:h-6",
                                                isEarned
                                                    ? "text-white"
                                                    : "!text-white drop-shadow-md" // Forçando Branco com Sombra
                                            )}
                                        />
                                    </div>
                                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-[#2E4A4E] text-white px-3 py-2 rounded-lg opacity-0 group-hover/medal:opacity-100 transition-all duration-300 transform translate-y-2 group-hover/medal:translate-y-0 pointer-events-none z-50 shadow-xl min-w-[150px] text-center border border-white/10">
                                        <span className="block text-[10px] font-black uppercase tracking-wider mb-0.5 text-[#D4742C]">
                                            {medal.name}
                                        </span>
                                        <span className="block text-[9px] text-gray-200 leading-tight">
                                            {medal.description || 'Conquiste esta medalha!'}
                                        </span>
                                        <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#2E4A3E] border-r border-b border-white/10 rotate-45 transform"></div>
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
