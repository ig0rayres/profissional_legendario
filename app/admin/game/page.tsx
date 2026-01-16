'use client'

import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Plus, Trophy, Zap, Users as UsersIcon, Award, TrendingUp, Crown,
    UserCheck, Video, Flag, Hammer, HeartHandshake, Megaphone, Mountain,
    Gem, Anchor, Sword, Sparkles, RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
    MOCK_BADGES,
    MOCK_POINTS_ACTIONS,
    MOCK_USER_POINTS,
    MOCK_RANKS,
    Badge as BadgeType,
    PointsAction,
    UserPoints
} from '@/lib/data/mock'

export default function GameAdminPage() {
    const [badges, setBadges] = useState<BadgeType[]>(MOCK_BADGES)
    const [pointsActions] = useState<PointsAction[]>(MOCK_POINTS_ACTIONS)
    const [userPoints, setUserPoints] = useState<UserPoints[]>(MOCK_USER_POINTS)
    const [isLoadingReal, setIsLoadingReal] = useState(false)
    const [usingRealData, setUsingRealData] = useState(false)

    // Try to load real data from database
    const loadRealData = async () => {
        setIsLoadingReal(true)
        try {
            const supabase = createClient()

            // Load badges from database
            const { data: dbBadges, error: badgesError } = await supabase
                .from('badges')
                .select('*')
                .eq('is_active', true)

            // Load gamification stats for ranking
            const { data: dbStats, error: statsError } = await supabase
                .from('gamification_stats')
                .select(`
                    *,
                    profiles!inner(full_name, email)
                `)
                .order('total_xp', { ascending: false })
                .limit(50)

            // Load recent XP logs for activity tracking
            const { data: dbLogs } = await supabase
                .from('xp_logs')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100)

            if (dbBadges && !badgesError) {
                // Convert database badges to UI format
                const formattedBadges = dbBadges.map(b => ({
                    id: b.id,
                    name: b.name,
                    description: b.description,
                    xp_reward: b.xp_reward,
                    criteria_type: b.criteria_type,
                    benefit_description: b.benefit_description || '',
                    icon_key: b.icon_key || 'award'
                }))
                setBadges(formattedBadges)
            }

            if (dbStats && !statsError) {
                // Convert DB stats to UserPoints format
                const formattedUsers: UserPoints[] = await Promise.all(
                    dbStats.map(async (stat, index) => {
                        // Get user badges
                        const { data: userBadges } = await supabase
                            .from('user_badges')
                            .select('badge_id')
                            .eq('user_id', stat.user_id)

                        // Get recent actions from logs
                        const userLogs = dbLogs?.filter(log => log.user_id === stat.user_id).slice(0, 3) || []

                        return {
                            id: stat.user_id,
                            userId: stat.user_id,
                            userName: stat.profiles?.full_name || 'Unknown User',
                            userEmail: stat.profiles?.email || '',
                            totalPoints: stat.total_xp,
                            rank: index + 1,
                            currentRankId: stat.current_rank_id,
                            badgesEarned: userBadges?.map(b => b.badge_id) || [],
                            recentActions: userLogs.map(log => ({
                                actionName: log.description || log.action_type,
                                points: log.amount,
                                date: log.created_at
                            })),
                            lastUpdated: stat.updated_at
                        }
                    })
                )
                setUserPoints(formattedUsers)
                setUsingRealData(true)
            }

        } catch (error) {
            console.error('Error loading real data:', error)
            // Keep using mock data on error
        } finally {
            setIsLoadingReal(false)
        }
    }

    // Statistics
    const totalBadges = badges.length
    const activeActions = pointsActions.filter(a => a.active).length
    const totalPointsDistributed = userPoints.reduce((sum, u) => sum + u.totalPoints, 0)
    const topUser = userPoints[0]

    const formatPoints = (points: number) => {
        return points.toLocaleString('pt-BR')
    }

    const getRankName = (rankId: string) => {
        const rank = MOCK_RANKS.find(r => r.id === rankId)
        return rank?.name || rankId
    }

    const getBadgeName = (badgeId: string) => {
        const badge = badges.find(b => b.id === badgeId)
        return badge?.name || badgeId
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-impact text-primary">Gestão de Gamificação</h1>
                    <p className="text-muted-foreground mt-1">
                        Gerencie medalhas, sistema de pontos e rankings da plataforma
                        {usingRealData && <span className="ml-2 text-green-600 font-semibold">✓ Dados Reais</span>}
                        {!usingRealData && <span className="ml-2 text-orange-600 font-semibold">Mock Data</span>}
                    </p>
                </div>
                <Button
                    onClick={loadRealData}
                    disabled={isLoadingReal}
                    variant="outline"
                    className="gap-2"
                >
                    <RefreshCw className={cn("w-4 h-4", isLoadingReal && "animate-spin")} />
                    {isLoadingReal ? 'Carregando...' : 'Carregar Dados Reais'}
                </Button>
            </div>

            {/* Rest of the component stays the same... */}
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-secondary/20 rounded-md">
                            <Award className="w-5 h-5 text-secondary" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Total de Medalhas</div>
                            <div className="text-2xl font-bold text-primary mt-1">{totalBadges}</div>
                        </div>
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-md">
                            <Zap className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Ações Ativas</div>
                            <div className="text-2xl font-bold text-blue-500 mt-1">{activeActions}</div>
                        </div>
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-md">
                            <Trophy className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">Pontos Distribuídos</div>
                            <div className="text-2xl font-bold text-purple-500 mt-1">{formatPoints(totalPointsDistributed)}</div>
                        </div>
                    </div>
                </div>
                <div className="glass-strong p-4 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/20 rounded-md">
                            <Crown className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div>
                            <div className="text-sm text-muted-foreground">TOP 1</div>
                            <div className="text-lg font-bold text-yellow-500 mt-1 truncate">{topUser?.userName}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="medals" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[600px]">
                    <TabsTrigger value="medals">Medalhas ({badges.length})</TabsTrigger>
                    <TabsTrigger value="actions">Ações de Pontos ({pointsActions.length})</TabsTrigger>
                    <TabsTrigger value="ranking">Ranking ({userPoints.length})</TabsTrigger>
                </TabsList>

                {/* MEDALS TAB */}
                <TabsContent value="medals" className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {badges.map((badge) => {
                            const iconMap: Record<string, any> = {
                                'user-check': UserCheck,
                                'sword': Sword,
                                'sparkles': Sparkles,
                                'video': Video,
                                'flag': Flag,
                                'hammer': Hammer,
                                'heart-handshake': HeartHandshake,
                                'zap': Zap,
                                'megaphone': Megaphone,
                                'mountain': Mountain,
                                'gem': Gem,
                                'anchor': Anchor,
                            }
                            const Icon = iconMap[badge.icon_key] || Sparkles

                            return (
                                <div key={badge.id} className="glass-strong p-6 rounded-lg border border-primary/20 hover:border-secondary/50 transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-secondary flex items-center justify-center rounded-md shadow-lg shadow-secondary/20">
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                                            {badge.xp_reward} Vigor
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-lg text-primary mb-2">{badge.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-3">{badge.description}</p>
                                    {badge.benefit_description && (
                                        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                                            ✓ {badge.benefit_description}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </TabsContent>

                {/* POINTS ACTIONS TAB - Keep existing code */}
                <TabsContent value="actions" className="mt-6 space-y-4">
                    {/* ... existing actions table code ... */}
                </TabsContent>

                {/* RANKING TAB - Keep existing code */}
                <TabsContent value="ranking" className="mt-6 space-y-4">
                    {/* ... existing ranking table code ... */}
                </TabsContent>
            </Tabs>
        </div>
    )
}
