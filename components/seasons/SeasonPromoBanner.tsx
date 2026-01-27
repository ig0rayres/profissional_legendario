'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Crown, Medal, Award, Clock, Gift, ArrowRight, Flame, Zap, Star } from 'lucide-react'
import Link from 'next/link'

interface Season {
    season_id: string
    season_name: string
    start_date: string
    end_date: string
    days_remaining: number
    banner_url: string | null
}

interface Prize {
    id: string
    position: number
    title: string
    description: string | null
    image_url: string | null
}

interface SeasonPromoBannerProps {
    showFullVersion?: boolean
}

export function SeasonPromoBanner({ showFullVersion = false }: SeasonPromoBannerProps) {
    const [loading, setLoading] = useState(true)
    const [season, setSeason] = useState<Season | null>(null)
    const [prizes, setPrizes] = useState<Prize[]>([])

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data: seasonData } = await supabase.rpc('get_active_season')

            if (seasonData && seasonData.length > 0) {
                const activeSeason = seasonData[0]

                const { data: fullSeason } = await supabase
                    .from('seasons')
                    .select('banner_url')
                    .eq('id', activeSeason.season_id)
                    .single()

                setSeason({ ...activeSeason, banner_url: fullSeason?.banner_url || null })

                const { data: prizesData } = await supabase
                    .from('season_prizes')
                    .select('*')
                    .eq('season_id', activeSeason.season_id)
                    .order('position')

                setPrizes(prizesData || [])
            }
        } catch (error) {
            console.error('Error loading season promo:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPositionEmoji = (position: number) => {
        switch (position) {
            case 1: return '🥇'
            case 2: return '🥈'
            case 3: return '🥉'
            default: return `${position}º`
        }
    }

    if (loading || !season) {
        return null
    }

    // Versão compacta para home/sidebar (mais chamativa!)
    if (!showFullVersion) {
        return (
            <Link href="/dashboard/rota-do-valente">
                <Card className="relative border-0 overflow-hidden group cursor-pointer">
                    {/* Background gradient animado */}
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-500 to-yellow-500 opacity-90" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />

                    {/* Partículas decorativas */}
                    <div className="absolute top-4 right-4 opacity-20">
                        <Star className="w-8 h-8 text-white animate-pulse" />
                    </div>
                    <div className="absolute bottom-8 left-4 opacity-20">
                        <Flame className="w-6 h-6 text-white animate-pulse" style={{ animationDelay: '0.5s' }} />
                    </div>

                    {season.banner_url && (
                        <div className="absolute inset-0">
                            <img
                                src={season.banner_url}
                                alt="Temporada"
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
                        </div>
                    )}

                    <CardContent className="relative pt-5 pb-5">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                                    <Trophy className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-xs font-medium">TEMPORADA</p>
                                    <p className="text-white font-bold">{season.season_name}</p>
                                </div>
                            </div>
                            <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 animate-pulse">
                                <Zap className="w-3 h-3 mr-1" />
                                {season.days_remaining} dias
                            </Badge>
                        </div>

                        {/* Prêmios */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-3 mb-4">
                            <p className="text-white/70 text-xs font-medium mb-2 flex items-center gap-1">
                                <Gift className="w-3 h-3" />
                                GANHE PRÊMIOS INCRÍVEIS
                            </p>
                            <div className="flex gap-2">
                                {prizes.map((prize) => (
                                    <div key={prize.id} className="flex-1 text-center">
                                        {prize.image_url ? (
                                            <img
                                                src={prize.image_url}
                                                alt={prize.title}
                                                className="w-12 h-12 rounded-lg object-cover mx-auto mb-1 ring-2 ring-white/30"
                                            />
                                        ) : (
                                            <div className="text-2xl mb-1">{getPositionEmoji(prize.position)}</div>
                                        )}
                                        <p className="text-[10px] text-white/80 truncate font-medium">
                                            {prize.title.replace(/🥇|🥈|🥉/g, '').trim()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between">
                            <p className="text-white/90 text-xs font-medium">
                                🔥 Ganhe vigor e conquiste!
                            </p>
                            <div className="flex items-center gap-1 text-white font-bold text-sm group-hover:translate-x-1 transition-transform">
                                Participar
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        )
    }

    // Versão completa (BANNER ÉPICO!)
    return (
        <Card className="relative border-0 overflow-hidden">
            {/* Background épico */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-yellow-500" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,200,0,0.3),transparent_50%)]" />

            {/* Banner Image overlay */}
            {season.banner_url && (
                <div className="absolute inset-0">
                    <img
                        src={season.banner_url}
                        alt={`Temporada ${season.season_name}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/30" />
                </div>
            )}

            {/* Decorações animadas */}
            <div className="absolute top-6 right-6 opacity-30">
                <Trophy className="w-24 h-24 text-white animate-pulse" />
            </div>
            <div className="absolute bottom-20 left-6 opacity-20">
                <Star className="w-16 h-16 text-yellow-300 animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div className="absolute top-1/2 right-1/4 opacity-15">
                <Flame className="w-20 h-20 text-orange-300 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <CardContent className="relative py-8 md:py-12">
                {/* Header épico */}
                <div className="text-center mb-8">
                    <Badge className="bg-white/20 backdrop-blur-sm text-white border-0 text-sm px-4 py-1 mb-4">
                        <Flame className="w-4 h-4 mr-2" />
                        TEMPORADA ATIVA
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-2xl mb-2">
                        {season.season_name.toUpperCase()}
                    </h1>
                    <p className="text-white/80 text-lg">
                        Conquiste vigor, suba no ranking e ganhe prêmios épicos!
                    </p>
                </div>

                {/* Timer destacado */}
                <div className="flex justify-center mb-8">
                    <div className="bg-black/40 backdrop-blur-md rounded-2xl px-8 py-4 text-center border border-white/20">
                        <p className="text-white/60 text-sm uppercase tracking-wider mb-1">Tempo Restante</p>
                        <div className="flex items-center gap-1">
                            <span className="text-5xl md:text-6xl font-black text-white">{season.days_remaining}</span>
                            <span className="text-xl text-white/80 font-medium">dias</span>
                        </div>
                    </div>
                </div>

                {/* Prêmios DESTAQUE */}
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                            <Gift className="w-6 h-6 text-yellow-300" />
                            PRÊMIOS INCRÍVEIS
                            <Gift className="w-6 h-6 text-yellow-300" />
                        </h2>
                    </div>

                    <div className="grid grid-cols-3 gap-4 md:gap-6">
                        {prizes.map((prize) => (
                            <div
                                key={prize.id}
                                className={`relative text-center p-4 md:p-6 rounded-2xl backdrop-blur-sm transition-transform hover:scale-105 ${prize.position === 1
                                        ? 'bg-gradient-to-b from-yellow-500/40 to-yellow-600/20 border-2 border-yellow-400/50 shadow-lg shadow-yellow-500/20'
                                        : prize.position === 2
                                            ? 'bg-gradient-to-b from-gray-300/30 to-gray-400/10 border-2 border-gray-300/50'
                                            : 'bg-gradient-to-b from-amber-600/30 to-amber-700/10 border-2 border-amber-500/50'
                                    }`}
                            >
                                {prize.position === 1 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                        <Crown className="w-8 h-8 text-yellow-400 drop-shadow-lg" />
                                    </div>
                                )}

                                <div className="text-4xl md:text-5xl mb-3">{getPositionEmoji(prize.position)}</div>

                                {prize.image_url ? (
                                    <img
                                        src={prize.image_url}
                                        alt={prize.title}
                                        className={`w-20 h-20 md:w-28 md:h-28 rounded-xl object-cover mx-auto mb-3 ${prize.position === 1 ? 'ring-4 ring-yellow-400/50' : 'ring-2 ring-white/30'
                                            }`}
                                    />
                                ) : null}

                                <p className={`font-bold text-lg md:text-xl ${prize.position === 1 ? 'text-yellow-100' : 'text-white'
                                    }`}>
                                    {prize.title.replace(/🥇|🥈|🥉/g, '').trim()}
                                </p>

                                {prize.description && (
                                    <p className="text-white/60 text-sm mt-1">{prize.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* CTA épico */}
                <div className="text-center mt-10">
                    <Link href="/dashboard/rota-do-valente">
                        <Button size="lg" className="bg-white text-orange-600 hover:bg-white/90 font-bold text-lg px-8 py-6 rounded-xl shadow-2xl shadow-black/30 hover:scale-105 transition-transform">
                            <Flame className="w-5 h-5 mr-2" />
                            COMEÇAR A CONQUISTAR VIGOR
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                    <p className="text-white/60 text-sm mt-4">
                        ⚡ Cada ação na plataforma te aproxima da vitória!
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
