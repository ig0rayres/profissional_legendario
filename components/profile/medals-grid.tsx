import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Medal, Lock } from 'lucide-react'
import { MedalBadge } from '@/components/gamification/medal-badge'
import type { MedalData, UserMedalData } from '@/lib/profile/types'

interface MedalsGridProps {
    allMedals: MedalData[]
    earnedMedals: UserMedalData[]
}

export function MedalsGrid({ allMedals, earnedMedals }: MedalsGridProps) {
    const earnedMedalIds = new Set(earnedMedals.map(um => um.medal_id))
    const totalMedals = allMedals.length
    const earnedCount = earnedMedals.length

    return (
        <Card className="border-secondary/20 bg-secondary/5 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-3 opacity-10">
                <Medal className="w-24 h-24 text-secondary" />
            </div>

            <CardHeader className="pb-3 relative">
                <CardTitle className="text-sm font-black uppercase text-secondary flex items-center gap-2">
                    <Medal className="w-4 h-4" />
                    Troféus & Conquistas
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                    {earnedCount} de {totalMedals} medalhas conquistadas
                </p>
            </CardHeader>

            <CardContent className="relative">
                {allMedals.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                        {allMedals.map((medal) => {
                            const isEarned = earnedMedalIds.has(medal.id)
                            const earnedData = earnedMedals.find(um => um.medal_id === medal.id)

                            return (
                                <div
                                    key={medal.id}
                                    className="relative group"
                                >
                                    {/* Medal */}
                                    <div
                                        className={`
                                            transition-all duration-200
                                            ${isEarned
                                                ? 'hover:scale-110 cursor-help'
                                                : 'opacity-30 grayscale hover:opacity-50'
                                            }
                                        `}
                                        title={isEarned
                                            ? `${medal.name}\n${medal.description}\n+${medal.points_reward} pontos\nConquistada em ${new Date(earnedData?.earned_at || '').toLocaleDateString('pt-BR')}`
                                            : `${medal.name}\n${medal.description}\nBloqueada - Complete a missão para desbloquear!`
                                        }
                                    >
                                        <MedalBadge medalId={medal.id} size="lg" variant="icon-only" />
                                    </div>

                                    {/* Lock indicator for locked medals */}
                                    {!isEarned && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <Lock className="w-4 h-4 text-muted-foreground" />
                                        </div>
                                    )}

                                    {/* Tooltip on hover */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-popover border border-border rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 min-w-[200px] hidden group-hover:block">
                                        <p className="font-bold text-sm mb-1">{medal.name}</p>
                                        <p className="text-xs text-muted-foreground mb-2">{medal.description}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-secondary font-bold">+{medal.points_reward} pts</span>
                                            {isEarned && earnedData && (
                                                <span className="text-muted-foreground">
                                                    {new Date(earnedData.earned_at).toLocaleDateString('pt-BR')}
                                                </span>
                                            )}
                                            {!isEarned && (
                                                <span className="text-muted-foreground flex items-center gap-1">
                                                    <Lock className="w-3 h-3" />
                                                    Bloqueada
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground text-center italic py-4">
                        Nenhuma medalha disponível
                    </p>
                )}

                {/* Progress bar */}
                {totalMedals > 0 && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                        <div className="flex justify-between text-xs text-muted-foreground mb-2">
                            <span>Progresso</span>
                            <span className="font-bold text-secondary">
                                {Math.round((earnedCount / totalMedals) * 100)}%
                            </span>
                        </div>
                        <div className="h-2 bg-background/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-secondary transition-all duration-500"
                                style={{ width: `${(earnedCount / totalMedals) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
