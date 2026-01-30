'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Trophy, Crown, Medal, Star, Clock, Users, TrendingUp, Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface SeasonPrize {
    position: number
    title: string
    image_url: string | null
}

interface SeasonBannerCarouselProps {
    variant?: 'hero' | 'card' | 'sidebar' | 'compact'
    showCTA?: boolean
    className?: string
    customPrizes?: SeasonPrize[]
    customSeason?: any
    autoRotateInterval?: number // ms entre rotações (default: 3000)
}

export function SeasonBannerCarousel({
    variant = 'hero',
    showCTA = true,
    className = '',
    customPrizes,
    customSeason,
    autoRotateInterval = 3000
}: SeasonBannerCarouselProps) {
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

    // Auto-rotate prizes
    useEffect(() => {
        if (prizes.length === 0) return
        const interval = setInterval(() => {
            setCurrentPrizeIndex(prev => (prev + 1) % prizes.length)
        }, autoRotateInterval)
        return () => clearInterval(interval)
    }, [prizes.length, autoRotateInterval])

    const loadSeasonData = async () => {
        const supabase = createClient()

        const { data: seasonData } = await supabase
            .from('seasons')
            .select('*')
            .eq('status', 'active')
            .single()

        if (seasonData) {
            setSeason(seasonData)

            const endDate = new Date(seasonData.year, seasonData.month, 0)
            const today = new Date()
            const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            setDaysRemaining(Math.max(0, diff))

            const { data: prizesData } = await supabase
                .from('season_prizes')
                .select('position, title, image_url')
                .eq('season_id', seasonData.id)
                .order('position')
                .limit(3)

            setPrizes(prizesData || [])

            const { count } = await supabase
                .from('user_gamification')
                .select('*', { count: 'exact', head: true })
                .gt('monthly_vigor', 0)

            setParticipants(count || 0)
        }

        setLoading(false)
    }

    if (loading) {
        return (
            <div className={`animate-pulse bg-gradient-to-br from-[#0f0f23] to-[#1a1f3a] rounded-2xl ${variant === 'hero' ? 'h-[400px]' : variant === 'card' ? 'h-[300px]' : 'h-[200px]'
                } ${className}`} />
        )
    }

    if (!season || prizes.length === 0) {
        return null
    }

    const monthNames = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

    // Ordenar prêmios por posição (1º, 2º, 3º)
    const sortedPrizes = [...prizes].sort((a, b) => a.position - b.position)
    const currentPrize = sortedPrizes[currentPrizeIndex]

    const getPositionStyles = (position: number) => {
        switch (position) {
            case 1: return {
                badge: 'bg-gradient-to-br from-yellow-400 to-amber-600',
                textColor: 'text-yellow-400',
                icon: <Crown className="w-6 h-6 text-yellow-900" />,
                label: '1º LUGAR'
            }
            case 2: return {
                badge: 'bg-gradient-to-br from-gray-300 to-gray-500',
                textColor: 'text-gray-300',
                icon: <Medal className="w-5 h-5 text-gray-700" />,
                label: '2º LUGAR'
            }
            case 3: return {
                badge: 'bg-gradient-to-br from-amber-600 to-amber-800',
                textColor: 'text-amber-500',
                icon: <Trophy className="w-5 h-5 text-amber-100" />,
                label: '3º LUGAR'
            }
            default: return {
                badge: 'bg-gray-600',
                textColor: 'text-gray-400',
                icon: <Star className="w-5 h-5" />,
                label: `${position}º LUGAR`
            }
        }
    }

    const styles = getPositionStyles(currentPrize?.position || 1)

    // Configurações por variant
    const config = {
        hero: {
            aspectRatio: '2.8 / 1',
            prizeSize: 'w-44 h-44',
            titleSize: 'text-4xl md:text-5xl',
            badgeIconSize: 'w-12 h-12',
            showStats: true,
            showLogo: true,
            padding: 'px-8 py-8'
        },
        card: {
            aspectRatio: '2.85 / 1',
            prizeSize: 'w-36 h-36',
            titleSize: 'text-2xl md:text-3xl',
            badgeIconSize: 'w-10 h-10',
            showStats: true,
            showLogo: true,
            padding: 'px-6 py-6'
        },
        sidebar: {
            aspectRatio: '2.8 / 1',
            prizeSize: 'w-28 h-28',
            titleSize: 'text-xl',
            badgeIconSize: 'w-8 h-8',
            showStats: false,
            showLogo: true,
            padding: 'px-4 py-4'
        },
        compact: {
            aspectRatio: '4 / 5',
            prizeSize: 'w-32 h-32',
            titleSize: 'text-lg',
            badgeIconSize: 'w-8 h-8',
            showStats: false,
            showLogo: true,
            padding: 'px-4 pt-16 pb-4'
        }
    }

    const c = config[variant]

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-2xl ${className}`}
            style={{ aspectRatio: c.aspectRatio }}
            aria-label="Prêmios da temporada atual"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#122e26] via-[#0d211b] to-[#05120e]" />
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* Brasão watermark (apenas hero e card) */}
            {(variant === 'hero' || variant === 'card') && (
                <div className="absolute right-[-15%] bottom-[-20%] w-[500px] h-[500px] opacity-[0.52] pointer-events-none rotate-[15deg] mix-blend-multiply">
                    <img
                        src="/images/brasao-patch.jpg"
                        alt=""
                        className="w-full h-full object-contain grayscale contrast-125"
                    />
                </div>
            )}

            {/* Glow effects */}
            <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-[#cc5500]/10 rounded-full blur-[80px] mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#166534]/15 rounded-full blur-[80px] mix-blend-screen" />

            {/* TOPO: Logo + Badge */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
                {c.showLogo && (
                    <div className="bg-white rounded-md px-2 py-1 shadow-lg">
                        <img
                            src="/images/logo-rotabusiness.png"
                            alt="Rota Business Club"
                            className={`${variant === 'hero' ? 'h-8' : variant === 'card' ? 'h-6' : 'h-5'} w-auto object-contain`}
                        />
                    </div>
                )}
                <Badge className="bg-[#cc5500] text-white border-0 px-2 py-1 text-[8px] md:text-[10px] font-bold tracking-wider uppercase shadow-lg">
                    <Sparkles className="w-2.5 h-2.5 mr-1" />
                    {['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][season.month]}/{season.year}
                </Badge>
            </div>

            {/* Conteúdo principal */}
            <div className={`relative z-10 h-full flex ${variant === 'compact' ? 'flex-col items-center justify-center' : 'items-center justify-between'} ${c.padding}`}>

                {/* Lado esquerdo: Título e stats */}
                <div className={`${variant === 'compact' ? 'text-center mb-4' : 'flex-1'}`}>
                    {variant !== 'compact' && <div className="h-8" />} {/* Spacer para logo */}

                    <h2 className={`font-black text-white ${c.titleSize} uppercase tracking-tight ${variant === 'compact' ? 'text-center' : ''} mb-1`}>
                        PRÊMIOS DE <span className="text-[#cc5500]">{monthNames[season.month]}</span>
                    </h2>

                    <p className={`text-gray-400 ${variant === 'compact' ? 'text-[10px]' : 'text-sm'} mb-2`}>
                        Acumule <span className="text-white font-bold">VIGOR</span> e conquiste
                    </p>

                    {/* Stats (apenas hero e card) */}
                    {c.showStats && (
                        <div className="flex gap-4 mt-4">
                            <div className="flex items-center gap-1.5 text-white/70">
                                <Clock className="w-3.5 h-3.5 text-orange-400" />
                                <span className="text-xs">
                                    <strong className="text-orange-400">{daysRemaining}</strong> dias
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-white/70">
                                <Users className="w-3.5 h-3.5 text-green-400" />
                                <span className="text-xs">
                                    <strong className="text-green-400">{participants}</strong> participantes
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Centro/Direita: Carrossel de prêmio */}
                <div className={`flex flex-col items-center ${variant === 'compact' ? '' : 'mr-8'}`}>
                    {/* Badge de posição */}
                    <div className="flex flex-col items-center mb-2">
                        <motion.div
                            key={currentPrize?.position}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`${styles.badge} ${c.badgeIconSize} rounded-full flex items-center justify-center`}
                        >
                            {styles.icon}
                        </motion.div>
                        <p className={`text-xs font-bold uppercase mt-1 ${styles.textColor}`}>
                            {styles.label}
                        </p>
                    </div>

                    {/* Prêmio atual - MESMO TAMANHO PARA TODOS */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentPrize?.position}
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -30 }}
                            transition={{ duration: 0.3 }}
                            className={`${c.prizeSize} relative`}
                        >
                            <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-700/80 flex items-center justify-center p-2">
                                {currentPrize?.image_url ? (
                                    <img
                                        src={currentPrize.image_url}
                                        alt={currentPrize.title}
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <Trophy className="w-10 h-10 text-black/20" />
                                )}
                            </div>
                            {currentPrize?.position === 1 && (
                                <motion.div
                                    animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-1 -right-1"
                                >
                                    <Sparkles className="w-5 h-5 text-yellow-400" />
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Nome do prêmio */}
                    <motion.p
                        key={currentPrize?.title}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/90 text-sm font-medium mt-2 text-center max-w-[180px] line-clamp-1"
                    >
                        {currentPrize?.title}
                    </motion.p>

                    {/* Indicadores de carrossel */}
                    <div className="flex justify-center gap-1.5 mt-3">
                        {sortedPrizes.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentPrizeIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${idx === currentPrizeIndex
                                        ? 'bg-[#cc5500] w-4'
                                        : 'bg-white/30 hover:bg-white/50 w-1.5'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </motion.section>
    )
}
