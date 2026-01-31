'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, CheckCircle, Clock, Bell } from 'lucide-react'
import Link from 'next/link'

interface ProjectsCardProps {
    userId: string
}

interface ProjectStats {
    total: number
    completed: number
    inProgress: number
    newProjects: number
}

export function ProjectsCard({ userId }: ProjectsCardProps) {
    const [stats, setStats] = useState<ProjectStats>({
        total: 0,
        completed: 0,
        inProgress: 0,
        newProjects: 0
    })
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadStats()

        // Subscrição em tempo real
        const channel = supabase
            .channel('project-updates')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'project_notifications',
                filter: `user_id=eq.${userId}`
            }, () => {
                // Incrementar contador
                setStats(prev => ({
                    ...prev,
                    total: prev.total + 1,
                    newProjects: prev.newProjects + 1
                }))

                // Som de notificação (opcional)
                playNotificationSound()
            })
            .subscribe()

        return () => {
            channel.unsubscribe()
        }
    }, [userId])

    async function loadStats() {
        setLoading(true)

        // Buscar estatísticas
        const { data: projects } = await supabase
            .from('projects')
            .select('status')
            .or(`accepted_by.eq.${userId},requester_id.eq.${userId}`)

        const completed = projects?.filter(p => p.status === 'completed').length || 0
        const inProgress = projects?.filter(p =>
            p.status === 'accepted' || p.status === 'in_progress' || p.status === 'awaiting_confirmation'
        ).length || 0
        const total = projects?.length || 0

        // Contar não visualizados
        const { count: newCount } = await supabase
            .from('project_notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('viewed', false)

        setStats({
            total,
            completed,
            inProgress,
            newProjects: newCount || 0
        })

        setLoading(false)
    }

    function playNotificationSound() {
        try {
            const audio = new Audio('/sounds/notification.mp3')
            audio.volume = 0.3
            audio.play().catch(() => {
                // Ignore se não conseguir tocar
            })
        } catch (error) {
            // Ignore
        }
    }

    return (
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                    <div className="bg-[#2E4A3E] p-2.5 rounded-lg">
                        <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-900">
                            PROJETOS
                        </CardTitle>
                        <p className="text-sm text-gray-600">Histórico profissional</p>
                    </div>
                </div>

                {/* Contador de Novos Projetos */}
                <div className="relative">
                    <Bell className="h-6 w-6 text-gray-600" />
                    {stats.newProjects > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold animate-pulse"
                        >
                            {stats.newProjects}
                        </Badge>
                    )}
                </div>

                {/* Total */}
                <div className="text-right">
                    <div className="text-3xl font-bold text-[#2E4A3E]">
                        {loading ? '-' : stats.total}
                    </div>
                    <p className="text-xs text-gray-600 font-medium">TOTAL</p>
                </div>
            </CardHeader>

            <CardContent className="space-y-3">
                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                            {loading ? '-' : stats.completed}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">CONCLUÍDOS</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <Clock className="h-5 w-5 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                            {loading ? '-' : stats.inProgress}
                        </div>
                        <p className="text-xs text-gray-600 font-medium">EM ANDAMENTO</p>
                    </div>
                </div>

                {/* Botão para ver histórico */}
                <Button
                    asChild
                    variant="outline"
                    className="w-full bg-white hover:bg-gray-50 border-gray-300 text-gray-900 font-medium"
                >
                    <Link href="/dashboard/projects">
                        📋 Seu histórico de projetos
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
