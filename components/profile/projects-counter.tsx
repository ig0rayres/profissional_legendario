'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'

interface ProjectsCounterProps {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    targetUserId?: string
    targetUserName?: string
}

export function ProjectsCounter({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    targetUserId,
    targetUserName
}: ProjectsCounterProps) {
    const { user } = useAuth()
    const router = useRouter()

    function handleRequestProject() {
        if (!targetUserId) return

        // Redirecionar para página de lançar projeto com o profissional pré-selecionado
        router.push(`/projects/create?professional=${targetUserId}`)
    }

    const canShowButton = showButton && targetUserId && user && user.id !== targetUserId

    return (
        <Card className="border-primary/20 shadow-lg shadow-black/10 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-primary" />
                    PROJETOS
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">Entregues</span>
                        </div>
                        <span className="text-2xl font-black text-green-500">{completedCount}</span>
                    </div>

                    {inProgressCount > 0 && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-secondary" />
                                <span className="text-sm text-muted-foreground">Em andamento</span>
                            </div>
                            <span className="text-xl font-bold text-secondary">{inProgressCount}</span>
                        </div>
                    )}
                </div>

                {canShowButton && (
                    <Button
                        className="w-full bg-secondary hover:bg-secondary/90 font-bold uppercase tracking-wide"
                        size="sm"
                        onClick={handleRequestProject}
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        SOLICITAR PROJETO
                    </Button>
                )}

                {showButton && (!user || user.id === targetUserId) && (
                    <Button
                        className="w-full bg-secondary/50 font-bold uppercase tracking-wide"
                        size="sm"
                        disabled
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        SOLICITAR PROJETO
                    </Button>
                )}
            </CardContent>
        </Card>
    )
}
