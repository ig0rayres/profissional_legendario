'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    Trophy, Crown, Medal, Award, Clock, Gift, TrendingUp, Loader2
} from 'lucide-react'

interface Season {
    season_id: string
    season_name: string
    season_year: number
    season_month: number
    start_date: string
    end_date: string
    season_status: string
    days_remaining: number
}

interface Prize {
    id: string
    position: number
    title: string
    description: string | null
    image_url: string | null
}

interface RankingUser {
    ranking_position: number
    user_id: string
    full_name: string
    avatar_url: string | null
    slug: string
    patente: string
    xp_month: number
}

interface UserPosition {
    user_position: number
    xp_month: number
    total_participants: number
}

interface SeasonBannerProps {
    userId?: string
}

export function SeasonBanner({ userId }: SeasonBannerProps) {
    const [loading, setLoading] = useState(true)
    const [season, setSeason] = useState<Season | null>(null)
    const [prizes, setPrizes] = useState<Prize[]>([])
    const [ranking, setRanking] = useState<RankingUser[]>([])
    const [userPosition, setUserPosition] = useState<UserPosition | null>(null)

    const supabase = createClient()

    useEffect(() => {
        loadData()
    }, [userId])

    const loadData = async () => {
        setLoading(true)
        try {
            // Buscar temporada ativa
            const { data: seasonData } = await supabase
                .rpc('get_active_season')

            if (seasonData && seasonData.length > 0) {
                const activeSeason = seasonData[0]
                setSeason(activeSeason)

                // Buscar prêmios
                const { data: prizesData } = await supabase
                    .from('season_prizes')
                    .select('*')
                    .eq('season_id', activeSeason.season_id)
                    .order('position')

                setPrizes(prizesData || [])

                // Buscar ranking Top 5
                const { data: rankingData } = await supabase
                    .rpc('get_season_ranking', {
                        p_season_id: activeSeason.season_id,
                        p_limit: 5
                    })

                setRanking(rankingData || [])

                // Buscar posição do usuário
                if (userId) {
                    const { data: positionData } = await supabase
                        .rpc('get_user_season_position', {
                            p_user_id: userId,
                            p_season_id: activeSeason.season_id
                        })

                    if (positionData && positionData.length > 0) {
                        setUserPosition(positionData[0])
                    }
                }
            }
        } catch (error) {
            console.error('Error loading season data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getPositionIcon = (position: number) => {
        switch (position) {
            case 1: return <Crown className="w-5 h-5 text-yellow-500" />
            case 2: return <Medal className="w-5 h-5 text-gray-400" />
            case 3: return <Award className="w-5 h-5 text-amber-600" />
            default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{position}</span>
        }
    }

    const getPositionBg = (position: number) => {
        switch (position) {
            case 1: return 'bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500/30'
            case 2: return 'bg-gradient-to-r from-gray-300/20 to-transparent border-gray-400/30'
            case 3: return 'bg-gradient-to-r from-amber-600/20 to-transparent border-amber-600/30'
            default: return 'border-primary/10'
        }
    }

    if (loading) {
        return (
            <Card className="border-primary/20">
                <CardContent className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </CardContent>
            </Card>
        )
    }

    if (!season) {
        return null
    }

    return (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-background to-background overflow-hidden">
            {/* Header */}
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                            <Trophy className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Temporada: {season.season_name}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                <span>{season.days_remaining} dias restantes</span>
                            </div>
                        </div>
                    </div>

                    {/* Posição do usuário */}
                    {userPosition && (
                        <div className="text-right">
                            <p className="text-2xl font-bold text-primary">#{userPosition.user_position}</p>
                            <p className="text-xs text-muted-foreground">
                                {userPosition.xp_month} XP • de {userPosition.total_participants}
                            </p>
                        </div>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Prêmios */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Prêmios do Mês</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {prizes.map((prize) => (
                            <div
                                key={prize.id}
                                className={`p-3 rounded-lg border ${getPositionBg(prize.position)} text-center`}
                            >
                                <div className="flex justify-center mb-1">
                                    {getPositionIcon(prize.position)}
                                </div>
                                <p className="text-xs font-medium truncate">{prize.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ranking Top 5 */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Top 5</span>
                    </div>

                    {ranking.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            Seja o primeiro a conquistar XP!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {ranking.map((user, index) => {
                                const isCurrentUser = userId && user.user_id === userId

                                return (
                                    <div
                                        key={user.user_id}
                                        className={`flex items-center justify-between p-2 rounded-lg border ${isCurrentUser
                                                ? 'border-primary bg-primary/10'
                                                : getPositionBg(index + 1)
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 flex justify-center">
                                                {getPositionIcon(index + 1)}
                                            </div>
                                            <Avatar className="w-7 h-7">
                                                <AvatarImage src={user.avatar_url || ''} />
                                                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                                                    {user.full_name?.charAt(0) || '?'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className={`text-sm font-medium ${isCurrentUser ? 'text-primary' : ''}`}>
                                                    {user.full_name}
                                                    {isCurrentUser && <span className="ml-1 text-xs">(você)</span>}
                                                </p>
                                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                    {user.patente || 'Recruta'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-primary">{user.xp_month} XP</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
