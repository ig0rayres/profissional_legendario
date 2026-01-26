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
        <Card className="border-[#2D3B2D] bg-[#1A2421]/60 backdrop-blur-sm shadow-lg shadow-black/30 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[#F2F4F3]">
                    <Briefcase className="w-4 h-4 text-[#1E4D40]" />
                    PROJETOS
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-[#1E4D40]" />
                            <span className="text-sm text-[#D1D5DB]">Entregues</span>
                        </div>
                        <span className="text-2xl font-black text-[#1E4D40]">{completedCount}</span>
                    </div>

                    {inProgressCount > 0 && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#D2691E]" />
                                <span className="text-sm text-[#D1D5DB]">Em andamento</span>
                            </div>
                            <span className="text-xl font-bold text-[#D2691E]">{inProgressCount}</span>
                        </div>
                    )}
                </div>

                {canShowButton && (
                    <Button
                        className="w-full bg-[#D2691E] hover:bg-[#C85A17] text-white font-bold uppercase tracking-wide shadow-lg"
                        size="sm"
                        onClick={handleRequestProject}
                    >
                        <Briefcase className="w-4 h-4 mr-2" />
                        SOLICITAR PROJETO
                    </Button>
                )}

                {showButton && (!user || user.id === targetUserId) && (
                    <Button
                        className="w-full bg-[#2D3B2D] text-[#D1D5DB] font-bold uppercase tracking-wide"
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
