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
    banner_sidebar_url: string | null // Banner gerado automaticamente para sidebar
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
                    .select('banner_url, banner_sidebar_url')
                    .eq('id', activeSeason.season_id)
                    .single()

                console.log('[SEASON BANNER] fullSeason:', fullSeason)
                console.log('[SEASON BANNER] banner_sidebar_url:', fullSeason?.banner_sidebar_url)

                setSeason({
                    ...activeSeason,
                    banner_url: fullSeason?.banner_url || null,
                    banner_sidebar_url: fullSeason?.banner_sidebar_url || null
                })

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
        console.log('[SEASON BANNER] Returning null:', { loading, hasSeason: !!season })
        return null
    }

    // Versão compacta para home/sidebar (usa banner gerado se disponível)
    console.log('[SEASON BANNER] RENDER:', {
        showFullVersion,
        hasSidebarUrl: !!season.banner_sidebar_url,
        sidebarUrl: season.banner_sidebar_url
    })

    if (!showFullVersion) {
        // Se tem banner sidebar gerado, usa ele (proporção 700x250 = 2.8:1)
        if (season.banner_sidebar_url) {
            console.log('[SEASON BANNER] ✅ Renderizando banner gerado!')
            return (
                <Link href="/dashboard/rota-do-valente">
                    <Card className="relative border-0 overflow-hidden group cursor-pointer">
                        {/* Banner gerado automaticamente */}
                        <div className="relative w-full" style={{ aspectRatio: '2.8' }}>
                            <img
                                src={season.banner_sidebar_url}
                                alt={`Temporada ${season.season_name}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Overlay sutil para dar hover effect */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                            {/* Badge de dias restantes no canto */}
                            <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-500 text-white border-0 text-[10px] px-2 py-0.5 shadow-lg">
                                <Clock className="w-3 h-3 mr-1" />
                                {season.days_remaining} dias
                            </Badge>
                        </div>
                    </Card>
                </Link>
            )
        }

        // Fallback: Layout de pódio (quando não tem banner gerado)
        return (
            <Link href="/dashboard/rota-do-valente">
                <Card className="relative border-0 overflow-hidden group cursor-pointer">
                    {/* Background gradient premium */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-800 via-green-700 to-green-900" />
                    <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />

                    {/* Decoração sutil */}
                    <div className="absolute top-2 right-2 opacity-10">
                        <Trophy className="w-16 h-16 text-white" />
                    </div>

                    <CardContent className="relative pt-4 pb-4">
                        {/* Header com logo e badge */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                    <Trophy className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <p className="text-white/60 text-[10px] font-medium uppercase tracking-wider">Temporada</p>
                                    <p className="text-white font-bold text-sm">{season.season_name}</p>
                                </div>
                            </div>
                            <Badge className="bg-orange-500 hover:bg-orange-500 text-white border-0 text-[10px] px-2 py-0.5">
                                <Clock className="w-3 h-3 mr-1" />
                                {season.days_remaining} dias
                            </Badge>
                        </div>

                        {/* Título central */}
                        <div className="text-center mb-3">
                            <p className="text-white/60 text-[10px] flex items-center justify-center gap-1">
                                <Gift className="w-3 h-3" />
                                GANHE PRÊMIOS INCRÍVEIS
                            </p>
                        </div>

                        {/* Grid de Prêmios - Estilo Podium */}
                        <div className="flex justify-center items-end gap-2 mb-3">
                            {/* 2º Lugar (esquerda) */}
                            {prizes.find(p => p.position === 2) && (
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden ring-2 ring-gray-400/50 bg-gray-700">
                                            {prizes.find(p => p.position === 2)?.image_url ? (
                                                <img
                                                    src={prizes.find(p => p.position === 2)?.image_url!}
                                                    alt="2º Lugar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🥈</div>
                                            )}
                                        </div>
                                        <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center text-[10px] font-bold text-white shadow">
                                            2º
                                        </div>
                                    </div>
                                    <p className="text-[8px] text-white/70 mt-1 text-center truncate max-w-[50px]">
                                        {prizes.find(p => p.position === 2)?.title.replace(/🥈/g, '').trim() || '2º Lugar'}
                                    </p>
                                </div>
                            )}

                            {/* 1º Lugar (centro - maior) */}
                            {prizes.find(p => p.position === 1) && (
                                <div className="flex flex-col items-center -translate-y-2">
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden ring-2 ring-yellow-400/70 bg-yellow-900/50 shadow-lg shadow-yellow-500/20">
                                            {prizes.find(p => p.position === 1)?.image_url ? (
                                                <img
                                                    src={prizes.find(p => p.position === 1)?.image_url!}
                                                    alt="1º Lugar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-2xl">🥇</div>
                                            )}
                                        </div>
                                        <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                            <Crown className="w-5 h-5 text-yellow-400 drop-shadow" />
                                        </div>
                                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-yellow-500 rounded-full text-[8px] font-bold text-black shadow">
                                            1º LUGAR
                                        </div>
                                    </div>
                                    <p className="text-[9px] text-yellow-200 mt-2 text-center truncate max-w-[70px] font-medium">
                                        {prizes.find(p => p.position === 1)?.title.replace(/🥇/g, '').trim() || '1º Lugar'}
                                    </p>
                                </div>
                            )}

                            {/* 3º Lugar (direita) */}
                            {prizes.find(p => p.position === 3) && (
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden ring-2 ring-amber-600/50 bg-amber-900/50">
                                            {prizes.find(p => p.position === 3)?.image_url ? (
                                                <img
                                                    src={prizes.find(p => p.position === 3)?.image_url!}
                                                    alt="3º Lugar"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xl">🥉</div>
                                            )}
                                        </div>
                                        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center text-[10px] font-bold text-white shadow">
                                            3º
                                        </div>
                                    </div>
                                    <p className="text-[8px] text-white/70 mt-1 text-center truncate max-w-[50px]">
                                        {prizes.find(p => p.position === 3)?.title.replace(/🥉/g, '').trim() || '3º Lugar'}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                            <p className="text-white/70 text-[10px]">
                                🔥 Ganhe vigor e conquiste!
                            </p>
                            <div className="flex items-center gap-1 text-orange-400 font-bold text-xs group-hover:translate-x-1 transition-transform">
                                Participar
                                <ArrowRight className="w-3 h-3" />
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
