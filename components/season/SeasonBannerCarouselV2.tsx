'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Trophy, Crown, Medal, Star, Clock, Users, TrendingUp, Sparkles, ChevronRight, Zap
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface SeasonPrize {
    position: number
    title: string
    image_url: string | null
}

interface SeasonBannerCarouselV2Props {
    variant?: 'hero' | 'card' | 'sidebar' | 'sidebar-lg' | 'compact'
    showCTA?: boolean
    className?: string
    customPrizes?: SeasonPrize[]
    customSeason?: any
    autoRotateInterval?: number
}

export function SeasonBannerCarouselV2({
    variant = 'hero',
    showCTA = true,
    className = '',
    customPrizes,
    customSeason,
    autoRotateInterval = 3000
}: SeasonBannerCarouselV2Props) {
    const [season, setSeason] = useState<any>(customSeason || null)
    const [prizes, setPrizes] = useState<SeasonPrize[]>(customPrizes || [])
    const [loading, setLoading] = useState(!customSeason)
    const [daysRemaining, setDaysRemaining] = useState(0)
    const [participants, setParticipants] = useState(0)
    const [currentPrizeIndex, setCurrentPrizeIndex] = useState(0)

    useEffect(() => {
        if (!customSeason || !customPrizes) {
            loadSeasonData()
        } else {
            if (customSeason) {
                const endDate = new Date(customSeason.year, customSeason.month, 0)
                const today = new Date()
                const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                setDaysRemaining(Math.max(0, diff))
            }
        }
    }, [customSeason, customPrizes])

    useEffect(() => {
        if (prizes.length === 0) return
        const interval = setInterval(() => {
            setCurrentPrizeIndex(prev => (prev + 1) % prizes.length)
        }, autoRotateInterval)
        return () => clearInterval(interval)
    }, [prizes.length, autoRotateInterval])

    const loadSeasonData = async () => {
        const supabase = createClient()
        const { data: seasonData } = await supabase.from('seasons').select('*').eq('status', 'active').single()
        if (seasonData) {
            setSeason(seasonData)
            const endDate = new Date(seasonData.year, seasonData.month, 0)
            const diff = Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
            setDaysRemaining(Math.max(0, diff))
            const { data: prizesData } = await supabase.from('season_prizes').select('position, title, image_url').eq('season_id', seasonData.id).order('position').limit(3)
            setPrizes(prizesData || [])
            // Buscar participantes - MESMA FONTE que /na-rota (user_gamification)
            const { count } = await supabase.from('user_gamification').select('*', { count: 'exact', head: true }).gt('total_points', 0)
            setParticipants(count || 0)
        }
        setLoading(false)
    }

    if (loading) {
        return <div className={`animate-pulse bg-gradient-to-br from-[#0f0f23] to-[#1a1f3a] rounded-2xl ${variant === 'hero' ? 'h-[400px]' : variant === 'card' ? 'h-[300px]' : 'h-[200px]'} ${className}`} />
    }

    if (!season || prizes.length === 0) return null

    const monthNames = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    const sortedPrizes = [...prizes].sort((a, b) => a.position - b.position)
    const currentPrize = sortedPrizes[currentPrizeIndex]

    const getPositionStyles = (position: number) => {
        switch (position) {
            case 1: return {
                badge: 'bg-transparent',
                textColor: 'text-yellow-400',
                icon: <span className="text-2xl">🥇</span>,
                label: '1º LUGAR'
            }
            case 2: return {
                badge: 'bg-transparent',
                textColor: 'text-gray-300',
                icon: <span className="text-2xl">🥈</span>,
                label: '2º LUGAR'
            }
            case 3: return {
                badge: 'bg-transparent',
                textColor: 'text-amber-500',
                icon: <span className="text-2xl">🥉</span>,
                label: '3º LUGAR'
            }
            default: return { badge: 'bg-gray-600', textColor: 'text-gray-400', icon: <span className="text-lg font-black">{position}º</span>, label: `${position}º LUGAR` }
        }
    }

    const styles = getPositionStyles(currentPrize?.position || 1)

    // ============ HERO (1400x500 - proporção ~2.8:1) ============
    if (variant === 'hero') {
        return (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className={`relative overflow-hidden rounded-2xl ${className}`}
                aria-label="Prêmios da temporada"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-[#122e26] via-[#0d211b] to-[#05120e]" />
                <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} />
                <div className="absolute right-[-15%] bottom-[-20%] w-[680px] h-[680px] opacity-[0.52] pointer-events-none rotate-[15deg] mix-blend-multiply">
                    <img src="/images/brasao-patch.jpg" alt="" className="w-full h-full object-contain grayscale contrast-125" />
                </div>
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#cc5500]/10 rounded-full blur-[120px] mix-blend-screen" />

                {/* Logo */}
                <div className="absolute top-8 left-6 md:top-10 md:left-10 z-20 bg-white rounded-lg px-4 py-2 shadow-xl">
                    <img src="/images/logo-rotabusiness.png" alt="Rota Business Club" className="h-8 md:h-10 w-auto object-contain" />
                </div>

                {/* Badge temporada */}
                <div className="absolute top-8 right-6 md:top-10 md:right-10 z-20">
                    <Badge className="bg-[#cc5500] text-white border-0 px-4 py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase shadow-lg">
                        <Sparkles className="w-3 h-3 mr-2" />
                        TEMPORADA {['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][season.month]} | {season.year}
                    </Badge>
                </div>

                <div className="relative z-10 px-8 py-12 pt-32 flex items-center justify-between">
                    {/* Lado esquerdo: Título */}
                    <div className="flex-1">
                        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            className="font-black text-white text-4xl md:text-6xl mb-2 uppercase tracking-tighter">
                            PRÊMIOS DE <span className="text-[#cc5500] drop-shadow-sm">{monthNames[season.month]}</span>
                        </motion.h2>
                        <p className="text-gray-400 text-sm md:text-base max-w-xl font-medium mb-4">
                            A elite merece o melhor. Acumule <span className="text-white font-bold">VIGOR</span> e conquiste a glória.
                        </p>

                        {/* Stats */}
                        <div className="flex gap-6 mb-6">
                            <div className="flex items-center gap-2 text-white/80">
                                <Clock className="w-4 h-4 text-orange-400" />
                                <span className="text-sm"><strong className="text-orange-400">{daysRemaining}</strong> dias restantes</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                                <Users className="w-4 h-4 text-green-400" />
                                <span className="text-sm"><strong className="text-green-400">{participants}</strong> participantes</span>
                            </div>
                        </div>

                        {showCTA && (
                            <Link href="/rota-valente">
                                <Button size="lg" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold px-8 py-6 text-lg shadow-[0_0_30px_rgba(22,163,74,0.4)]">
                                    <Zap className="w-5 h-5 mr-2" />
                                    Participar Agora
                                    <ChevronRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Lado direito: Carrossel */}
                    <div className="flex flex-col items-center">
                        <div className="flex flex-col items-center mb-3">
                            <motion.div key={currentPrize?.position} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className={`${styles.badge} w-12 h-12 rounded-full flex items-center justify-center`}>
                                {styles.icon}
                            </motion.div>
                            <p className={`text-sm font-bold uppercase mt-1 ${styles.textColor}`}>{styles.label}</p>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div key={currentPrize?.position} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
                                className="w-52 h-52 relative">
                                <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-700/80 flex items-center justify-center p-3">
                                    {currentPrize?.image_url ? (
                                        <img src={currentPrize.image_url} alt={currentPrize.title} className="max-w-full max-h-full object-contain" />
                                    ) : (
                                        <Trophy className="w-12 h-12 text-black/20" />
                                    )}
                                </div>
                                {currentPrize?.position === 1 && (
                                    <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-2 -right-2">
                                        <Sparkles className="w-6 h-6 text-yellow-400" />
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        <motion.p key={currentPrize?.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/90 text-sm font-medium mt-3 text-center">
                            {currentPrize?.title}
                        </motion.p>

                        <div className="flex gap-2 mt-3">
                            {sortedPrizes.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPrizeIndex(idx)}
                                    className={`w-2 h-2 rounded-full transition-all ${idx === currentPrizeIndex ? 'bg-[#cc5500] w-4' : 'bg-white/30 hover:bg-white/50'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>
        )
    }

    // ============ CARD (1000x350) ============
    if (variant === 'card') {
        return (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-2xl ${className}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#122e26] via-[#0d211b] to-[#05120e]" />

                {/* Brasão de fundo - mais visível e menos cortado */}
                <div className="absolute right-[5%] bottom-[5%] w-[320px] h-[320px] opacity-[0.75] pointer-events-none rotate-[8deg] mix-blend-multiply">
                    <img src="/images/brasao-patch.jpg" alt="" className="w-full h-full object-contain grayscale contrast-125" />
                </div>
                <div className="absolute top-4 left-4 z-20 bg-white rounded-md px-4 py-2.5 shadow-lg">
                    <img src="/images/logo-rotabusiness.png" alt="Rota Business Club" className="h-10 w-auto" />
                </div>
                <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-[#cc5500] text-white border-0 px-4 py-2 text-[13px] font-bold tracking-wider uppercase">
                        <Sparkles className="w-2.5 h-2.5 mr-1" />
                        {['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][season.month]}/{season.year}
                    </Badge>
                </div>

                <div className="relative z-10 px-6 py-6 pt-24 pb-8 flex items-center min-h-[200px]">
                    <div className="w-1/2">
                        <h2 className="font-black text-white text-3xl md:text-4xl mb-1 uppercase tracking-tight">
                            PRÊMIOS DE <span className="text-[#cc5500]">{monthNames[season.month]}</span>
                        </h2>
                        <p className="text-gray-400 text-sm mb-3">Acumule <span className="text-white font-bold">VIGOR</span> e conquiste</p>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 text-white/70 text-xs">
                                <Clock className="w-3 h-3 text-orange-400" />
                                <strong className="text-orange-400">{daysRemaining}</strong> dias
                            </div>
                            <div className="flex items-center gap-1.5 text-white/70 text-xs">
                                <Users className="w-3 h-3 text-green-400" />
                                <strong className="text-green-400">{participants}</strong> participantes
                            </div>
                        </div>
                    </div>

                    {/* Card de prêmio - posicionado sobre o brasão */}
                    <div className="absolute left-[69%] top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                        <div className="flex flex-col items-center mb-2">
                            <motion.div key={currentPrize?.position} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                className={`${styles.badge} w-9 h-9 rounded-full flex items-center justify-center`}>
                                {styles.icon}
                            </motion.div>
                            <p className={`text-[10px] font-bold uppercase mt-1 ${styles.textColor}`}>{styles.label}</p>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div key={currentPrize?.position} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="w-32 h-32 relative">
                                <div className="w-full h-full rounded-lg overflow-hidden bg-zinc-700/80 flex items-center justify-center p-2">
                                    {currentPrize?.image_url ? (
                                        <img src={currentPrize.image_url} alt={currentPrize.title} className="max-w-full max-h-full object-contain" />
                                    ) : <Trophy className="w-8 h-8 text-black/20" />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        <p className="text-white/80 text-xs mt-2 text-center">{currentPrize?.title}</p>
                        <div className="flex gap-1.5 mt-2">
                            {sortedPrizes.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPrizeIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all ${idx === currentPrizeIndex ? 'bg-[#cc5500] w-3' : 'bg-white/30 w-1.5'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>
        )
    }

    // ============ SIDEBAR (700x250 - 2.8:1) - FALCON ============
    if (variant === 'sidebar') {
        return (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-xl bg-gradient-to-br from-[#183d33] via-[#153629] to-[#112920] ${className}`} style={{ aspectRatio: '2.8' }}>
                {/* Fundo VERDE ESCURO */}

                {/* Brasão opaco/transparente (sem cores vivas) */}
                <div className="absolute right-[10%] bottom-[5%] w-[100px] h-[100px] opacity-[0.4] pointer-events-none rotate-[8deg] mix-blend-multiply">
                    <img src="/images/brasao-patch.jpg" alt="" className="w-full h-full object-contain grayscale contrast-125" />
                </div>

                {/* Logo - lado direito */}
                <div className="absolute top-4 right-3 z-20 bg-white rounded px-2 py-1 shadow">
                    <img src="/images/logo-rotabusiness.png" alt="Rota Business Club" className="h-[22px] w-auto" />
                </div>
                {/* Prêmios JAN/2026 - abaixo da logo, com quebra de linha */}
                <div className="absolute top-20 right-3 z-20 text-center">
                    <p className="text-white/90 text-xs font-semibold uppercase tracking-wide">Prêmios<br />
                        <Badge className="bg-[#cc5500] text-white border-0 px-2 py-1 text-[10px] font-bold uppercase mt-1 inline-block">
                            {['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][season.month]}/{season.year}
                        </Badge>
                    </p>
                </div>

                {/* Conteúdo - ROTA DO VALENTE - 7% maior */}
                <div className="relative z-10 h-full px-4 pt-4 pb-3">
                    <h2 className="font-black text-white text-xl uppercase tracking-tight mb-0.5 leading-tight">
                        ROTA DO<br /><span className="text-[#cc5500]">VALENTE</span>
                    </h2>
                    <p className="text-gray-400 text-[9px] mb-2">Acumule <span className="text-white font-bold">VIGOR</span></p>

                    {/* Stats */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-1 text-white/70 text-[8px]">
                            <Clock className="w-2.5 h-2.5 text-orange-400" />
                            <strong className="text-orange-400">{daysRemaining}</strong> dias
                        </div>
                        <div className="flex items-center gap-1 text-white/70 text-[8px]">
                            <Users className="w-2.5 h-2.5 text-green-400" />
                            <strong className="text-green-400">{participants}</strong> participantes
                        </div>
                    </div>
                </div>

                {/* Card de prêmios com troféu na lateral */}
                <div className="absolute right-[28%] top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
                    {/* Troféu/Medalha na lateral */}
                    <motion.div key={currentPrize?.position} className={`${styles.badge} w-8 h-8 rounded-full flex items-center justify-center`}>
                        {styles.icon}
                    </motion.div>

                    {/* Card do prêmio maior */}
                    <div className="flex flex-col items-center">
                        <AnimatePresence mode="wait">
                            <motion.div key={currentPrize?.position} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-[105px] h-[105px]">
                                <div className="w-full h-full rounded-lg overflow-hidden bg-zinc-700/80 flex items-center justify-center p-1">
                                    {currentPrize?.image_url ? (
                                        <img src={currentPrize.image_url} alt={currentPrize.title} className="max-w-full max-h-full object-contain" />
                                    ) : <Trophy className="w-6 h-6 text-black/20" />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        <div className="flex gap-1 mt-1">
                            {sortedPrizes.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPrizeIndex(idx)}
                                    className={`h-1 rounded-full transition-all ${idx === currentPrizeIndex ? 'bg-[#cc5500] w-2' : 'bg-white/30 w-1'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section >
        )
    }

    // ============ SIDEBAR-LG (Sidebar +25% maior) ============
    if (variant === 'sidebar-lg') {
        return (
            <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className={`relative overflow-hidden rounded-xl ${className}`} style={{ aspectRatio: '2.8' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#122e26] via-[#0d211b] to-[#05120e]" />

                {/* Brasão de fundo - pelo menos 75% visível */}
                <div className="absolute right-[-10%] bottom-[-10%] w-[200px] h-[200px] opacity-[0.45] pointer-events-none rotate-[10deg] mix-blend-multiply">
                    <img src="/images/brasao-patch.jpg" alt="" className="w-full h-full object-contain grayscale contrast-125" />
                </div>
                {/* Logo +25% (h-4 → h-5) */}
                <div className="absolute top-4 left-4 z-20 bg-white rounded px-2 py-1 shadow">
                    <img src="/images/logo-rotabusiness.png" alt="Rota Business Club" className="h-5 w-auto" />
                </div>
                {/* Badge +25% (text-[7px] → text-[9px]) */}
                <div className="absolute top-4 right-4 z-20">
                    <Badge className="bg-[#cc5500] text-white border-0 px-2 py-1 text-[9px] font-bold uppercase">
                        {['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][season.month]}/{season.year}
                    </Badge>
                </div>

                <div className="relative z-10 h-full flex items-center justify-between px-5 pt-12 pb-4">
                    <div className="flex-1">
                        {/* Título +25% (text-base → text-xl) */}
                        <h2 className="font-black text-white text-xl uppercase tracking-tight mb-1">
                            PRÊMIOS DE <span className="text-[#cc5500]">{monthNames[season.month]}</span>
                        </h2>
                        {/* Subtítulo +25% (text-[9px] → text-xs) */}
                        <p className="text-gray-400 text-xs">Acumule <span className="text-white font-bold">VIGOR</span> e conquiste</p>
                    </div>

                    <div className="flex flex-col items-center">
                        {/* Badge de posição +25% (w-6 h-6 → w-8 h-8) */}
                        <motion.div key={currentPrize?.position} className={`${styles.badge} w-8 h-8 rounded-full flex items-center justify-center mb-1`}>
                            {styles.icon}
                        </motion.div>
                        {/* Label +25% */}
                        <p className={`text-[10px] font-bold uppercase mt-0.5 ${styles.textColor}`}>{styles.label}</p>
                        <AnimatePresence mode="wait">
                            {/* Card do prêmio +25% (w-20 h-20 → w-24 h-24) */}
                            <motion.div key={currentPrize?.position} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-24 h-24">
                                <div className="w-full h-full rounded-lg overflow-hidden bg-zinc-700/80 flex items-center justify-center p-1.5">
                                    {currentPrize?.image_url ? (
                                        <img src={currentPrize.image_url} alt={currentPrize.title} className="max-w-full max-h-full object-contain" />
                                    ) : <Trophy className="w-8 h-8 text-black/20" />}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                        {/* Nome do prêmio */}
                        <p className="text-white/80 text-xs mt-1 text-center max-w-[100px] line-clamp-1">{currentPrize?.title}</p>
                        {/* Indicadores +25% */}
                        <div className="flex gap-1.5 mt-1.5">
                            {sortedPrizes.map((_, idx) => (
                                <button key={idx} onClick={() => setCurrentPrizeIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all ${idx === currentPrizeIndex ? 'bg-[#cc5500] w-3' : 'bg-white/30 w-1.5'}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </motion.section>
        )
    }

    // ============ COMPACT (500x500 - quadrado) ============
    return (
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl aspect-square ${className}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-[#122e26] via-[#0d211b] to-[#05120e]" />
            <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
                <div className="bg-white rounded-md px-2 py-1 shadow-lg">
                    <img src="/images/logo-rotabusiness.png" alt="Rota Business Club" className="h-5 w-auto" />
                </div>
                <Badge className="bg-[#cc5500] text-white border-0 px-2 py-1 text-[8px] font-bold uppercase">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    {['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][season.month]}/{season.year}
                </Badge>
            </div>

            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 pt-16 pb-4">
                <h2 className="font-black text-white text-lg uppercase tracking-tight text-center mb-0.5">
                    PRÊMIOS DE <span className="text-[#cc5500]">{monthNames[season.month]}</span>
                </h2>
                <p className="text-gray-400 text-[10px] text-center mb-3">Acumule <span className="text-white font-bold">VIGOR</span> e conquiste</p>

                <div className="flex flex-col items-center mb-2">
                    <motion.div key={currentPrize?.position} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        className={`${styles.badge} w-8 h-8 rounded-full flex items-center justify-center`}>
                        {styles.icon}
                    </motion.div>
                    <p className={`text-[10px] font-bold uppercase mt-1 ${styles.textColor}`}>{styles.label}</p>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div key={currentPrize?.position} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="w-32 h-32 relative">
                        <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-700/80 flex items-center justify-center p-2">
                            {currentPrize?.image_url ? (
                                <img src={currentPrize.image_url} alt={currentPrize.title} className="max-w-full max-h-full object-contain" />
                            ) : <Trophy className="w-10 h-10 text-black/20" />}
                        </div>
                        {currentPrize?.position === 1 && (
                            <motion.div animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-1 -right-1">
                                <Sparkles className="w-4 h-4 text-yellow-400" />
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>

                <motion.p key={currentPrize?.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/90 text-xs font-medium mt-2 text-center">
                    {currentPrize?.title}
                </motion.p>

                <div className="flex gap-1.5 mt-3">
                    {sortedPrizes.map((_, idx) => (
                        <button key={idx} onClick={() => setCurrentPrizeIndex(idx)}
                            className={`h-1.5 rounded-full transition-all ${idx === currentPrizeIndex ? 'bg-[#cc5500] w-4' : 'bg-white/30 w-1.5'}`} />
                    ))}
                </div>

                <p className="text-gray-500 text-[8px] mt-3 text-center">💡 Complete missões e suba no ranking!</p>
            </div>
        </motion.section>
    )
}
