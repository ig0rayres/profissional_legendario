'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Briefcase, CheckCircle, Clock, Bell } from 'lucide-react'

interface ProjectsCounterRealtimeProps {
    userId: string
    completedCount?: number
    inProgressCount?: number
}

interface ProjectStats {
    total: number
    completed: number
    inProgress: number
    newCount: number
}

export function ProjectsCounterRealtime({
    userId,
    completedCount = 0,
    inProgressCount = 0
}: ProjectsCounterRealtimeProps) {
    const [stats, setStats] = useState<ProjectStats>({
        total: completedCount + inProgressCount,
        completed: completedCount,
        inProgress: inProgressCount,
        newCount: 0
    })
    const supabase = createClient()

    useEffect(() => {
        loadNewCount()

        // Subscrição em tempo real para notificações de projetos
        const channel = supabase
            .channel('project-notifications-counter')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'project_notifications',
                filter: `user_id=eq.${userId}`
            }, () => {
                // Incrementar contador de novos
                setStats(prev => ({
                    ...prev,
                    newCount: prev.newCount + 1
                }))
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'project_notifications',
                filter: `user_id=eq.${userId}`
            }, () => {
                // Recarregar contador (pode ter sido marcado como lido)
                loadNewCount()
            })
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [userId])

    async function loadNewCount() {
        const { count } = await supabase
            .from('project_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('viewed', false)

        setStats(prev => ({
            ...prev,
            newCount: count || 0
        }))
    }

    return (
        <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#1E4D40]/30 transition-all duration-300 group overflow-hidden">
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <CardContent className="p-5 relative">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Projetos
                            </h3>
                            <p className="text-xs text-gray-600">
                                Histórico profissional
                            </p>
                        </div>
                    </div>

                    {/* Contador de Notificações */}
                    <div className="relative">
                        {stats.newCount > 0 ? (
                            <>
                                <Bell className="w-6 h-6 text-[#1E4D40] animate-pulse" />
                                <Badge
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-bounce"
                                >
                                    {stats.newCount}
                                </Badge>
                            </>
                        ) : (
                            <div className="text-right transform group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-bold text-[#1E4D40]">{stats.total}</span>
                                <p className="text-[10px] text-gray-600 uppercase">Total</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-[#1E4D40]/5 border border-[#1E4D40]/10 rounded-xl text-center transform hover:scale-105 hover:shadow-md hover:border-[#1E4D40]/30 transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-4 h-4 text-[#1E4D40] group-hover/stat:animate-bounce" />
                            <span className="text-lg font-bold text-[#1E4D40]">{stats.completed}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Concluídos</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center transform hover:scale-105 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-gray-600 group-hover/stat:animate-spin" />
                            <span className="text-lg font-bold text-gray-700">{stats.inProgress}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Em Andamento</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
