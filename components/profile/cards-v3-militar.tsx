'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Briefcase, CheckCircle, Clock, TrendingUp, ArrowRight,
    Link2, Users, Bell, ChevronRight,
    Swords, Calendar, MapPin,
    Star, Award, Flame, MapPinned
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * V3 - CLÁSSICO MILITAR
 * Design sóbrio e robusto, inspirado em patentes militares
 * Verde escuro predominante com detalhes sutis em laranja
 */

// ======== PROJECTS COUNTER V3 ========
interface ProjectsCounterV3Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    targetUserId?: string
    targetUserName?: string
    canShowButton?: boolean
    onRequestProject?: () => void
}

export function ProjectsCounterV3({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    canShowButton = false,
    onRequestProject
}: ProjectsCounterV3Props) {
    return (
        <Card className="border-2 border-[#1E4D40] bg-gradient-to-b from-[#1A2421] to-[#0D1512] shadow-xl">
            {/* Header com barra superior */}
            <div className="h-1 bg-gradient-to-r from-[#1E4D40] via-[#2A6B5A] to-[#1E4D40]" />

            <CardContent className="p-5">
                {/* Título estilo militar */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-lg bg-[#1E4D40] flex items-center justify-center border border-[#2A6B5A]">
                        <Briefcase className="w-6 h-6 text-[#C5D4C0]" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C5D4C0]">
                            PROJETOS
                        </h3>
                        <p className="text-[10px] text-[#6B8068] uppercase tracking-wider">
                            Missões Concluídas
                        </p>
                    </div>
                </div>

                {/* Stats em formato de relatório */}
                <div className="space-y-3 mb-5">
                    <div className="flex items-center justify-between p-3 bg-[#0D1512] rounded border border-[#1E4D40]/50">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-[#2A6B5A]" />
                            <span className="text-sm font-medium text-[#8B9A8B] uppercase tracking-wide">
                                Entregues
                            </span>
                        </div>
                        <span className="text-2xl font-black text-[#C5D4C0] tabular-nums">
                            {completedCount}
                        </span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#0D1512] rounded border border-[#D2691E]/30">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-[#D2691E]" />
                            <span className="text-sm font-medium text-[#8B9A8B] uppercase tracking-wide">
                                Em Curso
                            </span>
                        </div>
                        <span className="text-2xl font-black text-[#D2691E] tabular-nums">
                            {inProgressCount}
                        </span>
                    </div>
                </div>

                {/* Botão militar */}
                {canShowButton && (
                    <Button
                        className={cn(
                            "w-full h-12",
                            "bg-[#D2691E] hover:bg-[#B85715]",
                            "text-white font-black uppercase tracking-wider text-sm",
                            "border-2 border-[#E07530]",
                            "shadow-lg"
                        )}
                        onClick={onRequestProject}
                    >
                        <Briefcase className="w-5 h-5 mr-2" />
                        SOLICITAR MISSÃO
                    </Button>
                )}

                {showButton && !canShowButton && (
                    <div className="text-center p-3 border border-dashed border-[#1E4D40]/50 rounded bg-[#0D1512]/50">
                        <p className="text-xs text-[#6B8068] uppercase tracking-wide">
                            Seu Histórico de Operações
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== ELOS DA ROTA V3 ========
interface ElosDaRotaV3Props {
    connections: Array<{
        id: string
        full_name: string
        avatar_url: string | null
        rank_name?: string
    }>
    pendingCount?: number
    userId: string
}

export function ElosDaRotaV3({ connections, pendingCount = 0, userId }: ElosDaRotaV3Props) {
    const getFirstName = (name: string) => name.split(' ')[0]

    return (
        <Card className="border-2 border-[#1E4D40] bg-gradient-to-b from-[#1A2421] to-[#0D1512] shadow-xl">
            <div className="h-1 bg-gradient-to-r from-[#1E4D40] via-[#2A6B5A] to-[#1E4D40]" />

            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-[#1E4D40] flex items-center justify-center border border-[#2A6B5A]">
                            <Link2 className="w-6 h-6 text-[#C5D4C0]" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C5D4C0]">
                                ELOS DA ROTA
                            </h3>
                            <p className="text-[10px] text-[#6B8068] uppercase tracking-wider">
                                {connections.length} Aliados
                            </p>
                        </div>
                    </div>

                    {pendingCount > 0 && (
                        <div className="relative">
                            <Bell className="w-6 h-6 text-[#D2691E]" />
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#D2691E] rounded-full text-[10px] font-black text-white flex items-center justify-center">
                                {pendingCount}
                            </span>
                        </div>
                    )}
                </div>

                {/* Grid de conexões */}
                {connections.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#1E4D40]/50 rounded bg-[#0D1512]/50">
                        <Users className="w-10 h-10 text-[#1E4D40]/50 mx-auto mb-2" />
                        <p className="text-xs text-[#6B8068] uppercase tracking-wide">
                            Nenhum Aliado Ainda
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-3 gap-2">
                            {connections.slice(0, 6).map((conn) => (
                                <div
                                    key={conn.id}
                                    className="p-2 bg-[#0D1512] rounded border border-[#1E4D40]/30 hover:border-[#1E4D40] transition-colors text-center"
                                >
                                    <div className="w-10 h-10 mx-auto rounded-full bg-[#1E4D40]/30 border border-[#2A6B5A] flex items-center justify-center mb-1">
                                        {conn.avatar_url ? (
                                            <Image
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-[#C5D4C0]">
                                                {conn.full_name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-semibold text-[#C5D4C0] truncate">
                                        {getFirstName(conn.full_name)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {connections.length > 6 && (
                            <Link
                                href={`/profile/${userId}/connections`}
                                className="flex items-center justify-center gap-2 mt-4 py-2 border border-[#1E4D40] rounded text-xs font-bold text-[#C5D4C0] uppercase tracking-wide hover:bg-[#1E4D40]/20 transition-colors"
                            >
                                Ver Todos ({connections.length})
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// ======== CONFRARIAS V3 ========
interface ConfraternityV3Props {
    confraternities: Array<{
        id: string
        proposed_date: string
        location: string
        partner: {
            full_name: string
            avatar_url?: string | null
        }
    }>
}

export function ConfraternityStatsV3({ confraternities }: ConfraternityV3Props) {
    return (
        <Card className="border-2 border-[#1E4D40] bg-gradient-to-b from-[#1A2421] to-[#0D1512] shadow-xl">
            <div className="h-1 bg-gradient-to-r from-[#D2691E] via-[#E07530] to-[#D2691E]" />

            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-lg bg-[#D2691E] flex items-center justify-center border border-[#E07530]">
                        <Swords className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C5D4C0]">
                            CONFRARIAS
                        </h3>
                        <p className="text-[10px] text-[#6B8068] uppercase tracking-wider">
                            Operações Agendadas
                        </p>
                    </div>
                </div>

                {confraternities.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-[#D2691E]/30 rounded bg-[#0D1512]/50">
                        <Swords className="w-10 h-10 text-[#D2691E]/30 mx-auto mb-2" />
                        <p className="text-xs text-[#6B8068] uppercase tracking-wide">
                            Nenhuma Operação Pendente
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {confraternities.slice(0, 3).map((conf) => (
                            <div
                                key={conf.id}
                                className="p-3 bg-[#0D1512] rounded border border-[#D2691E]/20 hover:border-[#D2691E]/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#D2691E]/20 border border-[#D2691E]/30 flex items-center justify-center">
                                        <span className="text-sm font-bold text-[#D2691E]">
                                            {conf.partner?.full_name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[#C5D4C0] truncate">
                                            {conf.partner?.full_name?.split(' ')[0]}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px] text-[#6B8068]">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(conf.proposed_date).toLocaleDateString('pt-BR')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== NA ROTA FEED V3 ========
interface NaRotaFeedV3Props {
    userName: string
    ratings: Array<{
        id: string
        rating: number
        comment?: string
        created_at: string
        reviewer?: { full_name: string }
    }>
    portfolio: any[]
}

export function NaRotaFeedV3({ userName, ratings, portfolio }: NaRotaFeedV3Props) {
    const allItems = [
        ...ratings.map(r => ({ type: 'rating', date: r.created_at, data: r })),
        ...portfolio.map(p => ({ type: 'portfolio', date: p.created_at, data: p }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <Card className="border-2 border-[#1E4D40] bg-gradient-to-b from-[#1A2421] to-[#0D1512] shadow-xl">
            <div className="h-1 bg-gradient-to-r from-[#1E4D40] via-[#D2691E] to-[#1E4D40]" />

            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[#1E4D40]/50">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#1E4D40] to-[#D2691E] flex items-center justify-center">
                        <MapPinned className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#C5D4C0]">
                            NA ROTA
                        </h3>
                        <p className="text-[10px] text-[#6B8068] uppercase tracking-wider">
                            Registro de Atividades
                        </p>
                    </div>
                </div>

                {allItems.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-[#1E4D40]/50 rounded bg-[#0D1512]/50">
                        <MapPinned className="w-12 h-12 text-[#1E4D40]/30 mx-auto mb-3" />
                        <p className="text-sm font-bold text-[#6B8068] uppercase tracking-wide">
                            Nenhum Registro
                        </p>
                        <p className="text-xs text-[#4A5A48] mt-1">
                            Atividades de {userName.split(' ')[0]} aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {allItems.slice(0, 5).map((item, idx) => (
                            <div
                                key={idx}
                                className="p-4 bg-[#0D1512] rounded border-l-4 border-[#1E4D40] hover:border-[#D2691E] transition-colors"
                            >
                                {item.type === 'rating' && (
                                    <>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="text-xs text-[#C5D4C0]">
                                                <strong>{userName.split(' ')[0]}</strong> recebeu avaliação
                                            </span>
                                        </div>
                                        <div className="flex gap-1 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-4 h-4",
                                                        i < item.data.rating
                                                            ? "text-yellow-500 fill-yellow-500"
                                                            : "text-[#2D3B2D]"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        {item.data.comment && (
                                            <p className="text-xs italic text-[#8B9A8B]">
                                                "{item.data.comment}"
                                            </p>
                                        )}
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
