'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Flame, Award, Users, Camera, MessageCircle, Star, Trophy, Clock, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface PointsEntry {
    id: string
    points: number
    action_type: string
    description: string | null
    created_at: string
    metadata?: {
        base_amount?: number
        multiplier?: number
        plan_id?: string
    }
}

// Ícones e cores por tipo de ação
const ACTION_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    medal_reward: { icon: Award, color: 'text-yellow-500', label: 'Medalha' },
    badge_reward: { icon: Award, color: 'text-yellow-500', label: 'Medalha' },
    connection_accepted: { icon: Users, color: 'text-blue-500', label: 'Conexão' },
    connection_request: { icon: Users, color: 'text-blue-400', label: 'Conexão' },
    confraternity_participation: { icon: Users, color: 'text-green-500', label: 'Confraria' },
    confraternity_host: { icon: Star, color: 'text-orange-500', label: 'Anfitrião' },
    confraternity_photo: { icon: Camera, color: 'text-pink-500', label: 'Foto' },
    message_sent: { icon: MessageCircle, color: 'text-purple-500', label: 'Mensagem' },
    rating_received: { icon: Star, color: 'text-amber-500', label: 'Avaliação' },
    profile_complete: { icon: Trophy, color: 'text-emerald-500', label: 'Perfil' },
    daily_login: { icon: Flame, color: 'text-red-500', label: 'Login' },
    default: { icon: TrendingUp, color: 'text-gray-500', label: 'Ação' }
}

/**
 * Componente que exibe histórico de pontos da temporada atual
 */
export function PointsHistory() {
    const { user } = useAuth()
    const [entries, setEntries] = useState<PointsEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [totalPoints, setTotalPoints] = useState(0)

    useEffect(() => {
        if (!user) return

        const fetchHistory = async () => {
            const supabase = createClient()

            // Buscar início do mês atual (temporada)
            const now = new Date()
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const { data, error } = await supabase
                .from('points_history')
                .select('*')
                .eq('user_id', user.id)
                .gte('created_at', monthStart)
                .order('created_at', { ascending: false })
                .limit(50)

            if (error) {
                console.error('[PointsHistory] Erro:', error)
            } else {
                setEntries(data || [])
                // Calcular total
                const total = (data || []).reduce((sum, entry) => sum + entry.points, 0)
                setTotalPoints(total)
            }
            setLoading(false)
        }

        fetchHistory()

        // Escutar novas entradas em tempo real
        const supabase = createClient()
        const channel = supabase
            .channel('points-history')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'points_history',
                    filter: `user_id=eq.${user.id}`
                },
                (payload) => {
                    const newEntry = payload.new as PointsEntry
                    setEntries(prev => [newEntry, ...prev])
                    setTotalPoints(prev => prev + newEntry.points)
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [user])

    const getActionConfig = (actionType: string) => {
        return ACTION_CONFIG[actionType] || ACTION_CONFIG.default
    }

    // Nome do mês atual
    const currentMonth = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

    if (loading) {
        return (
            <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Histórico de Pontos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-12 bg-muted rounded-lg" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Flame className="w-5 h-5 text-orange-500" />
                        Histórico de Pontos
                    </CardTitle>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-500 font-bold">
                        +{totalPoints} pts
                    </Badge>
                </div>
                <p className="text-sm text-muted-foreground capitalize">{currentMonth}</p>
            </CardHeader>
            <CardContent>
                {entries.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhuma atividade este mês</p>
                        <p className="text-sm">Complete ações para ganhar pontos!</p>
                    </div>
                ) : (
                    <ScrollArea className="h-[300px] pr-4">
                        <div className="space-y-3">
                            {entries.map((entry) => {
                                const config = getActionConfig(entry.action_type)
                                const Icon = config.icon

                                return (
                                    <div
                                        key={entry.id}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        {/* Ícone */}
                                        <div className={`w-10 h-10 rounded-full bg-background flex items-center justify-center ${config.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>

                                        {/* Descrição */}
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">
                                                {entry.description || config.label}
                                            </p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(entry.created_at), {
                                                    addSuffix: true,
                                                    locale: ptBR
                                                })}
                                                {entry.metadata?.multiplier && entry.metadata.multiplier > 1 && (
                                                    <Badge variant="outline" className="ml-2 text-xs px-1 py-0">
                                                        x{entry.metadata.multiplier}
                                                    </Badge>
                                                )}
                                            </p>
                                        </div>

                                        {/* Pontos */}
                                        <div className="text-right">
                                            <span className="font-bold text-green-500">
                                                +{entry.points}
                                            </span>
                                            <span className="text-xs text-muted-foreground ml-1">pts</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    )
}
