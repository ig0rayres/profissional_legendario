'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Briefcase, CheckCircle, Clock, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProjectsCounterV2Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    targetUserId?: string
    targetUserName?: string
}

export function ProjectsCounterV2({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    targetUserId,
    targetUserName
}: ProjectsCounterV2Props) {
    const { user } = useAuth()
    const router = useRouter()

    function handleRequestProject() {
        if (!targetUserId) return
        router.push(`/projects/create?professional=${targetUserId}`)
    }

    const canShowButton = showButton && targetUserId && user && user.id !== targetUserId
    const totalProjects = completedCount + inProgressCount

    return (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0F1B1A] via-[#1A2421] to-[#0F1B1A] shadow-2xl">
            {/* Efeito de borda luminosa */}
            <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-br from-[#1E4D40]/50 via-transparent to-[#D2691E]/30" />

            {/* Partículas decorativas */}
            <div className="absolute top-2 right-3 w-2 h-2 bg-[#1E4D40]/30 rounded-full animate-pulse" />
            <div className="absolute top-6 right-6 w-1 h-1 bg-[#D2691E]/40 rounded-full animate-ping" style={{ animationDuration: '2s' }} />

            <CardContent className="relative p-5">
                {/* Header Premium */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#143832] flex items-center justify-center shadow-lg shadow-[#1E4D40]/20">
                                <Briefcase className="w-5 h-5 text-white" />
                            </div>
                            {/* Glow effect */}
                            <div className="absolute inset-0 w-10 h-10 rounded-xl bg-[#1E4D40]/20 blur-xl" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-[#F2F4F3]">
                                PROJETOS
                            </h3>
                            <p className="text-[10px] text-[#8B9A8B] uppercase tracking-wide">
                                Histórico Profissional
                            </p>
                        </div>
                    </div>

                    {/* Badge Total */}
                    <div className="flex items-center gap-1.5 bg-[#1E4D40]/10 px-3 py-1.5 rounded-full border border-[#1E4D40]/20">
                        <TrendingUp className="w-3.5 h-3.5 text-[#1E4D40]" />
                        <span className="text-sm font-bold text-[#1E4D40]">{totalProjects}</span>
                    </div>
                </div>

                {/* Stats Grid Premium */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {/* Entregues */}
                    <div className={cn(
                        "relative group",
                        "bg-gradient-to-br from-[#1E4D40]/10 to-[#1E4D40]/5",
                        "border border-[#1E4D40]/20 rounded-xl p-4",
                        "hover:border-[#1E4D40]/40 hover:from-[#1E4D40]/15",
                        "transition-all duration-300 ease-out"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-[#1E4D40]" />
                            <span className="text-xs font-medium text-[#8B9A8B] uppercase tracking-wide">
                                Entregues
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#1E4D40] leading-none">
                                {completedCount}
                            </span>
                            <span className="text-xs text-[#1E4D40]/60">projetos</span>
                        </div>
                        {/* Glow no hover */}
                        <div className="absolute inset-0 rounded-xl bg-[#1E4D40]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                    </div>

                    {/* Em Andamento */}
                    <div className={cn(
                        "relative group",
                        "bg-gradient-to-br from-[#D2691E]/10 to-[#D2691E]/5",
                        "border border-[#D2691E]/20 rounded-xl p-4",
                        "hover:border-[#D2691E]/40 hover:from-[#D2691E]/15",
                        "transition-all duration-300 ease-out"
                    )}>
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-[#D2691E]" />
                            <span className="text-xs font-medium text-[#8B9A8B] uppercase tracking-wide">
                                Ativos
                            </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-[#D2691E] leading-none">
                                {inProgressCount}
                            </span>
                            <span className="text-xs text-[#D2691E]/60">projetos</span>
                        </div>
                        {/* Glow no hover */}
                        <div className="absolute inset-0 rounded-xl bg-[#D2691E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                    </div>
                </div>

                {/* Botão Premium */}
                {canShowButton && (
                    <Button
                        className={cn(
                            "w-full relative overflow-hidden",
                            "bg-gradient-to-r from-[#D2691E] via-[#E07530] to-[#D2691E]",
                            "hover:from-[#E07530] hover:via-[#F08540] hover:to-[#E07530]",
                            "text-white font-bold uppercase tracking-wider",
                            "shadow-lg shadow-[#D2691E]/30",
                            "border-0 h-11",
                            "group transition-all duration-300"
                        )}
                        onClick={handleRequestProject}
                    >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                        <Sparkles className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        SOLICITAR PROJETO
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                )}

                {showButton && (!user || user.id === targetUserId) && (
                    <div className="bg-[#2D3B2D]/30 rounded-lg p-3 text-center border border-dashed border-[#2D3B2D]">
                        <p className="text-xs text-[#8B9A8B]">
                            Seu histórico de projetos
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
