'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Trophy, Crown, Medal, Star, Flame, ChevronRight,
    Clock, Users, TrendingUp, Zap, Sparkles
} from 'lucide-react'
import Link from 'next/link'

interface SeasonPrize {
    position: number
    title: string
    image_url: string | null
}

interface SeasonBannerProps {
    variant?: 'hero' | 'card' | 'sidebar' | 'compact'
    showCTA?: boolean
    showCountdown?: boolean
    className?: string
    // Novos props para injeção de dados (pelo gerador)
    customPrizes?: SeasonPrize[]
    customSeason?: any
}

export function SeasonBanner({
    variant = 'hero',
    showCTA = true,
    showCountdown = true,
    className = '',
    customPrizes,
    customSeason
}: SeasonBannerProps) {
    const [season, setSeason] = useState<any>(customSeason || null)
    const [prizes, setPrizes] = useState<SeasonPrize[]>(customPrizes || [])
    const [loading, setLoading] = useState(!customSeason)
    const [daysRemaining, setDaysRemaining] = useState(0)
    const [participants, setParticipants] = useState(0)

    useEffect(() => {
        if (!customSeason || !customPrizes) {
            loadSeasonData()
        } else {
            // Se dados foram passados, apenas calcula dias
            if (customSeason) {
                const endDate = new Date(customSeason.year, customSeason.month, 0)
                const today = new Date()
                const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                setDaysRemaining(Math.max(0, diff))
            }
        }
    }, [customSeason, customPrizes])

    const loadSeasonData = async () => {
        const supabase = createClient()

        // Buscar temporada ativa
        const { data: seasonData } = await supabase
            .from('seasons')
            .select('*')
            .eq('status', 'active')
            .single()

        if (seasonData) {
            setSeason(seasonData)

            // Calcular dias restantes
            const endDate = new Date(seasonData.year, seasonData.month, 0) // Último dia do mês
            const today = new Date()
            const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
            setDaysRemaining(Math.max(0, diff))

            // Buscar prêmios
            const { data: prizesData } = await supabase
                .from('season_prizes')
                .select('position, title, image_url')
                .eq('season_id', seasonData.id)
                .order('position')
                .limit(3)

            setPrizes(prizesData || [])

            // Contar participantes (gamification ativa)
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

    // Ordenar para layout de pódio: 2º | 1º | 3º
    const podiumOrder = [
        prizes.find(p => p.position === 2),
        prizes.find(p => p.position === 1),
        prizes.find(p => p.position === 3)
    ].filter(Boolean) as SeasonPrize[]

    const getPositionStyles = (position: number) => {
        switch (position) {
            case 1: return {
                badge: 'bg-gradient-to-br from-yellow-400 to-amber-600',
                glow: 'shadow-[0_0_60px_rgba(251,191,36,0.4)]',
                scale: 'scale-110',
                icon: <Crown className="w-6 h-6 text-yellow-900" />,
                label: '1º LUGAR'
            }
            case 2: return {
                badge: 'bg-gradient-to-br from-gray-300 to-gray-500',
                glow: 'shadow-[0_0_40px_rgba(156,163,175,0.3)]',
                scale: 'scale-100',
                icon: <Medal className="w-5 h-5 text-gray-700" />,
                label: '2º LUGAR'
            }
            case 3: return {
                badge: 'bg-gradient-to-br from-amber-600 to-amber-800',
                glow: 'shadow-[0_0_40px_rgba(217,119,6,0.3)]',
                scale: 'scale-100',
                icon: <Trophy className="w-5 h-5 text-amber-100" />,
                label: '3º LUGAR'
            }
            default: return {
                badge: 'bg-gray-600',
                glow: '',
                scale: 'scale-100',
                icon: <Star className="w-5 h-5" />,
                label: `${position}º LUGAR`
            }
        }
    }

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`relative overflow-hidden rounded-2xl ${className}`}
            aria-label="Prêmios da temporada atual"
        >
            {/* Background com gradiente da identidade visual Rota - Deep Luxury Green */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#122e26] via-[#0d211b] to-[#05120e]" />

            {/* Premium Noise Texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
                }}
            />

            {/* WATERMARK BRASÃO - Patch Texture */}
            <div className="absolute right-[-15%] bottom-[-20%] w-[680px] h-[680px] opacity-[0.52] pointer-events-none rotate-[15deg] mix-blend-multiply">
                <img
                    src="/images/brasao-patch.jpg"
                    alt="Brasão Rota Background"
                    className="w-full h-full object-contain grayscale contrast-125"
                />
            </div>

            {/* Glow effects (Laranja Queimado da marca - Mais suave) */}
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#cc5500]/10 rounded-full blur-[120px] mix-blend-screen" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#166534]/15 rounded-full blur-[100px] mix-blend-screen" />

            {/* LOGO OFICIAL - Container Branco Sólido (Esquerda) */}
            <div className="absolute top-8 left-6 md:top-10 md:left-10 z-20 bg-white rounded-lg px-4 py-2 shadow-xl border border-white/10 backdrop-blur-sm bg-opacity-95">
                <img
                    src="/images/logo-rotabusiness.png"
                    alt="Rota Business Club"
                    className="h-8 md:h-10 w-auto object-contain"
                />
            </div>

            {/* BADGE TEMPORADA - Canto Superior Direito (Equilíbrio) */}
            <div className="absolute top-8 right-6 md:top-10 md:right-10 z-20">
                <Badge className="bg-[#cc5500] text-white border-0 px-4 py-2 text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase shadow-lg shadow-orange-900/40 backdrop-blur-md">
                    <Sparkles className="w-3 h-3 mr-2 text-white/90" />
                    TEMPORADA {['', 'JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'][season.month]} | {season.year}
                </Badge>
            </div>

            <div className={`relative z-10 ${variant === 'hero' ? 'px-8 py-12 pt-32' :
                variant === 'card' ? 'px-6 py-8 pt-24' :
                    'px-4 py-6 pt-20'
                }`}>

                {/* Header (Título apenas) */}
                <div className="text-center mb-0 mt-4 md:mt-0 md:mb-8">
                    {/* Badge removido daqui pois foi para absolute right */}

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className={`font-black text-white mb-2 uppercase tracking-tighter font-montserrat ${variant === 'hero' ? 'text-4xl md:text-6xl' :
                            variant === 'card' ? 'text-2xl md:text-3xl' :
                                'text-xl'
                            }`}
                    >
                        PRÊMIOS DE <span className="text-[#cc5500] drop-shadow-sm">
                            {monthNames[season.month]}
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-400 text-sm md:text-base max-w-xl mx-auto font-medium"
                    >
                        A elite merece o melhor. Acumule <span className="text-white font-bold tracking-wide">VIGOR</span> e conquiste a glória.
                    </motion.p>
                </div>

                {/* Stats Bar */}
                {showCountdown && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex justify-center gap-6 mb-8"
                    >
                        <div className="flex items-center gap-2 text-white/80">
                            <Clock className="w-4 h-4 text-orange-400" />
                            <span className="text-sm">
                                <strong className="text-orange-400">{daysRemaining}</strong> dias restantes
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <Users className="w-4 h-4 text-green-400" />
                            <span className="text-sm">
                                <strong className="text-green-400">{participants}</strong> participantes
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-sm">Ranking ao vivo</span>
                        </div>
                    </motion.div>
                )}

                {/* Pódio de Prêmios */}
                <div className="flex justify-center items-end gap-4 md:gap-8 mb-8">
                    {podiumOrder.map((prize, index) => {
                        const styles = getPositionStyles(prize.position)
                        const delay = 0.5 + (index * 0.15)

                        return (
                            <motion.div
                                key={prize.position}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay, duration: 0.5, ease: 'easeOut' }}
                                className={`flex flex-col items-center ${prize.position === 1 ? 'order-2' :
                                    prize.position === 2 ? 'order-1' :
                                        'order-3'
                                    }`}
                            >
                                {/* Badge de posição + Label - LINHA FIXA NO TOPO */}
                                <div className="flex flex-col items-center mb-2">
                                    <motion.div
                                        whileHover={{ scale: 1.1, rotate: 5 }}
                                        className={`${styles.badge} w-10 h-10 rounded-full flex items-center justify-center`}
                                    >
                                        {styles.icon}
                                    </motion.div>
                                    <p className={`text-xs font-bold uppercase tracking-wide mt-1 ${prize.position === 1 ? 'text-yellow-400' :
                                        prize.position === 2 ? 'text-gray-300' :
                                            'text-amber-500'
                                        }`}>
                                        {styles.label}
                                    </p>
                                </div>

                                {/* Imagem do prêmio - SEM BRILHO */}
                                <motion.div
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                    className={`relative ${styles.scale} ${prize.position === 1 ? 'w-32 h-32 md:w-44 md:h-44' :
                                        'w-24 h-24 md:w-32 md:h-32'
                                        }`}
                                >
                                    {/* Container da imagem - fundo cinza */}
                                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-zinc-700/80">
                                        {prize.image_url ? (
                                            <div className="relative z-10 w-full h-full p-2 flex items-center justify-center">
                                                <img
                                                    src={prize.image_url}
                                                    alt={prize.title}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center relative z-10">
                                                <Trophy className="w-12 h-12 text-black/20" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Sparkle effect for 1st place only */}
                                    {prize.position === 1 && (
                                        <motion.div
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                                scale: [1, 1.2, 1]
                                            }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute -top-2 -right-2"
                                        >
                                            <Sparkles className="w-6 h-6 text-yellow-400" />
                                        </motion.div>
                                    )}
                                </motion.div>

                                {/* Nome do prêmio editável (embaixo) */}
                                {prize.title && prize.title !== `${prize.position}º Lugar` && (
                                    <p className="text-white/80 text-xs mt-2 font-medium max-w-[120px] line-clamp-2 text-center">
                                        {prize.title}
                                    </p>
                                )}
                            </motion.div>
                        )
                    })}
                </div>

                {/* CTA */}
                {showCTA && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1 }}
                        className="flex flex-col sm:flex-row justify-center items-center gap-4"
                    >
                        <Link href="/rota-valente">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold px-8 py-6 text-lg shadow-[0_0_30px_rgba(22,163,74,0.4)] hover:shadow-[0_0_40px_rgba(22,163,74,0.6)] transition-all"
                            >
                                <Zap className="w-5 h-5 mr-2" />
                                Participar Agora
                                <ChevronRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>

                        <Link href="/rota-valente#ranking">
                            <Button
                                variant="outline"
                                size="lg"
                                className="border-white/30 text-white hover:bg-white/10 px-6"
                            >
                                Ver Ranking Completo
                            </Button>
                        </Link>
                    </motion.div>
                )}

                {/* Engagement text */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="text-center text-gray-500 text-xs mt-6"
                >
                    💡 Complete missões diárias, ganhe medalhas e suba no ranking para aumentar suas chances!
                </motion.p>
            </div>
        </motion.section>
    )
}
