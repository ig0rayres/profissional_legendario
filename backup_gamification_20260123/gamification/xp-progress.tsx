'use client'

import { Star, Shield, Award, Medal, Crown, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface XPProgressProps {
    xp: number
    rank: {
        id: string
        name: string
        min_xp: number
        max_xp: number | null
    }
    nextRank?: {
        name: string
        min_xp: number
    }
    className?: string
}

const rankIcons: Record<string, any> = {
    recruta: Shield,
    especialista: Star,
    veterano: Award,
    comandante: Medal,
    general: Crown,
    lenda: Flame,
}

export function XPProgress({ xp, rank, nextRank, className }: XPProgressProps) {
    const minXp = rank.min_xp
    const maxXp = rank.max_xp || rank.min_xp + 1000 // Fallback for last rank
    const progress = Math.min(Math.max(((xp - minXp) / (maxXp - minXp)) * 100, 0), 100)

    const RankIcon = rankIcons[rank.id] || Shield

    return (
        <Card className={cn("overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm", className)}>
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Patente Atual
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <RankIcon className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-impact text-primary">
                                {rank.name}
                            </h3>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-3xl font-black text-secondary">
                            {xp} <span className="text-sm font-medium text-muted-foreground">Vigor</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                        <span className="text-muted-foreground">{rank.name}</span>
                        {nextRank ? (
                            <span className="text-primary">{nextRank.name} ({nextRank.min_xp} Vigor)</span>
                        ) : (
                            <span className="text-secondary">Nível Máximo</span>
                        )}
                    </div>

                    {/* Progress Bar */}
                    <div className="h-4 w-full bg-primary/10 rounded-full overflow-hidden border border-primary/20">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            {/* Animated Shine Effect */}
                            <div className="absolute inset-0 bg-white/20 skew-x-12 animate-pulse" />
                        </div>
                    </div>

                    {nextRank && (
                        <p className="text-xs text-muted-foreground italic text-center">
                            Faltam {nextRank.min_xp - xp} de Vigor para {nextRank.name}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
