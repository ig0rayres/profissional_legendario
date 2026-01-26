'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, CheckCircle, Clock, ArrowUpRight } from 'lucide-react'
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
        router.push(`/projects/create?professional=${targetUserId}`)
    }

    const canShowButton = showButton && targetUserId && user && user.id !== targetUserId
    const totalProjects = completedCount + inProgressCount

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
                    <div className="text-right transform group-hover:scale-110 transition-transform duration-300">
                        <span className="text-2xl font-bold text-[#1E4D40]">{totalProjects}</span>
                        <p className="text-[10px] text-gray-600 uppercase">Total</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-[#1E4D40]/5 border border-[#1E4D40]/10 rounded-xl text-center transform hover:scale-105 hover:shadow-md hover:border-[#1E4D40]/30 transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-4 h-4 text-[#1E4D40] group-hover/stat:animate-bounce" />
                            <span className="text-lg font-bold text-[#1E4D40]">{completedCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Concluídos</p>
                    </div>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center transform hover:scale-105 hover:shadow-md hover:border-gray-300 transition-all duration-300 cursor-pointer group/stat">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-gray-600 group-hover/stat:animate-spin" />
                            <span className="text-lg font-bold text-gray-700">{inProgressCount}</span>
                        </div>
                        <p className="text-[10px] text-gray-600 uppercase font-medium">Em Andamento</p>
                    </div>
                </div>

                {canShowButton && (
                    <Button
                        className="w-full h-11 bg-[#D2691E] hover:bg-[#B85715] text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                        onClick={handleRequestProject}
                    >
                        Solicitar Projeto
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                )}

                {showButton && (!user || user.id === targetUserId) && (
                    <div className="text-center py-2 px-3 bg-gray-50 rounded-xl border border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                        <p className="text-xs text-gray-600">
                            Seu histórico de projetos
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
