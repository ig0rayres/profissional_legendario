// ============================================
// Component: ConfraternityLimitsIndicator
// Indicador de limites mensais de convites
// ============================================

'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Swords, Calendar, TrendingUp } from 'lucide-react'
import { canSendInvite } from '@/lib/api/confraternity'

interface ConfraternityLimitsIndicatorProps {
    userId: string
}

export function ConfraternityLimitsIndicator({ userId }: ConfraternityLimitsIndicatorProps) {
    const [limits, setLimits] = useState({
        canSend: false,
        remainingInvites: 0,
        maxInvites: 0,
        planType: 'recruta'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadLimits()
    }, [userId])

    const loadLimits = async () => {
        setLoading(true)
        try {
            const data = await canSendInvite(userId)
            setLimits(data)
        } catch (error) {
            console.error('Error loading limits:', error)
        } finally {
            setLoading(false)
        }
    }

    const usedInvites = limits.maxInvites - limits.remainingInvites
    const progressPercentage = limits.maxInvites > 0
        ? (usedInvites / limits.maxInvites) * 100
        : 0

    const planLabels = {
        recruta: 'Recruta',
        veterano: 'Veterano',
        elite: 'Elite'
    }

    const planColors = {
        recruta: 'text-gray-600',
        veterano: 'text-blue-600',
        elite: 'text-purple-600'
    }

    // Calcular dias até próximo reset (sempre dia 1 do próximo mês)
    const today = new Date()
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const daysUntilReset = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Swords className="h-5 w-5" />
                        Seus Limites de Confraria
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Swords className="h-5 w-5" />
                    Seus Limites de Confraria
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Plano Atual */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Plano:</span>
                    <span className={`font-semibold ${planColors[limits.planType as keyof typeof planColors]}`}>
                        {planLabels[limits.planType as keyof typeof planLabels]}
                    </span>
                </div>

                {/* Progresso */}
                {limits.maxInvites > 0 ? (
                    <>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                    {usedInvites} de {limits.maxInvites} convites usados
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {limits.remainingInvites} restantes
                                </span>
                            </div>
                            <Progress
                                value={progressPercentage}
                                className="h-2"
                            />
                        </div>

                        {/* Info de Reset */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Renova em {daysUntilReset} dias</span>
                        </div>

                        {/* Upgrade hint (se não for Elite) */}
                        {limits.planType !== 'elite' && (
                            <div className="bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                <p className="text-sm text-purple-900 dark:text-purple-100 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    <span>
                                        Upgrade para <strong>Elite</strong> e tenha <strong>10 convites/mês</strong>!
                                    </span>
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-sm text-yellow-900 dark:text-yellow-100">
                            ⚠️ Seu plano <strong>Recruta</strong> não permite enviar convites de confraria.
                        </p>
                        <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-2">
                            Faça upgrade para <strong>Veterano</strong> ou <strong>Elite</strong> para desbloquear!
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
