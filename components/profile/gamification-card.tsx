import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award, Trophy, Zap } from 'lucide-react'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { Progress } from '@/components/ui/progress'
import type { GamificationData, SubscriptionData, RankData } from '@/lib/profile/types'

interface GamificationCardProps {
    gamification: GamificationData | null
    subscription: SubscriptionData | null
    nextRank?: RankData | null
}

export function GamificationCard({ gamification, subscription, nextRank }: GamificationCardProps) {
    if (!gamification) {
        return (
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <p className="text-muted-foreground text-center">Dados de gamificação não disponíveis</p>
                </CardContent>
            </Card>
        )
    }

    const currentPoints = gamification.total_points || 0
    const nextRankPoints = nextRank?.points_required || 0
    const currentRankPoints = gamification.rank?.points_required || 0
    const pointsToNext = nextRankPoints - currentPoints
    const progressPercentage = nextRankPoints > 0
        ? ((currentPoints - currentRankPoints) / (nextRankPoints - currentRankPoints)) * 100
        : 100

    return (
        <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-4 opacity-5">
                <Award className="w-32 h-32 text-primary" />
            </div>

            <CardHeader className="relative">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Trophy className="w-5 h-5" />
                    Status Rota do Valente
                </CardTitle>
            </CardHeader>

            <CardContent className="relative space-y-4">
                {/* Patente e Progresso */}
                <div className="bg-background/50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground mb-1">Patente Atual</p>
                            <div className="flex items-center gap-2">
                                <RankInsignia rankId={gamification.current_rank_id} size="md" />
                                <div>
                                    <p className="font-bold text-lg">{gamification.rank?.name || 'Novato'}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Nível {gamification.rank?.rank_level || 1}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {nextRank && (
                            <div className="text-right">
                                <p className="text-xs text-muted-foreground mb-1">Próxima Patente</p>
                                <div className="flex items-center gap-2">
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{nextRank.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {pointsToNext} pts faltam
                                        </p>
                                    </div>
                                    <RankInsignia rankId={nextRank.id} size="sm" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Barra de progresso */}
                    {nextRank && (
                        <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>{currentRankPoints} pts</span>
                                <span className="text-primary font-bold">{currentPoints} pts</span>
                                <span>{nextRankPoints} pts</span>
                            </div>
                            <Progress value={Math.min(progressPercentage, 100)} className="h-2" />
                        </div>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {/* Plano */}
                    <div className="bg-background/50 p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Plano</p>
                        <p className="font-bold text-sm capitalize">{subscription?.plan_tiers?.name || 'Recruta'}</p>
                        <p className="text-xs text-primary mt-1">
                            {subscription?.plan_tiers?.xp_multiplier || 1.0}x XP
                        </p>
                    </div>

                    {/* Vigor */}
                    <div className="bg-background/50 p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Vigor</p>
                        <div className="flex items-center justify-center gap-1">
                            <Zap className="w-4 h-4 text-primary" />
                            <p className="font-bold text-xl text-primary">{currentPoints}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">pontos</p>
                    </div>

                    {/* Medalhas */}
                    <div className="bg-background/50 p-3 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground mb-1">Medalhas</p>
                        <div className="flex items-center justify-center gap-1">
                            <Award className="w-4 h-4 text-secondary" />
                            <p className="font-bold text-xl text-secondary">{gamification.total_medals || 0}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">de 16</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
