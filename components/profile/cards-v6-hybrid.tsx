'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Briefcase, CheckCircle, Clock,
    Link2, Users, Bell, ChevronRight, ArrowUpRight,
    Swords, Calendar, MapPin,
    Star, Heart, MessageCircle, Share2, MoreHorizontal,
    Camera
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

/**
 * V6 - EXECUTIVO ELEGANTE (HYBRID)
 * Combina o profissionalismo do V4 com a elegância do V5
 * Design limpo e corporativo com toques minimalistas sofisticados
 * Ideal para empreendedores 25-60 anos
 */

// ======== PROJECTS COUNTER V6 ========
interface ProjectsCounterV6Props {
    completedCount: number
    inProgressCount?: number
    showButton?: boolean
    canShowButton?: boolean
    onRequestProject?: () => void
}

export function ProjectsCounterV6({
    completedCount,
    inProgressCount = 0,
    showButton = true,
    canShowButton = false,
    onRequestProject
}: ProjectsCounterV6Props) {
    const totalProjects = completedCount + inProgressCount

    return (
        <Card className="bg-white border border-[#E8EDE8] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                {/* Header limpo e elegante */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#1E4D40] flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Projetos
                            </h3>
                            <p className="text-xs text-[#6B7280]">
                                Histórico profissional
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-[#1E4D40]">{totalProjects}</span>
                        <p className="text-[10px] text-[#6B7280] uppercase">Total</p>
                    </div>
                </div>

                {/* Stats elegantes em grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-[#F0F5F0] rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-4 h-4 text-[#1E4D40]" />
                            <span className="text-lg font-bold text-[#1E4D40]">{completedCount}</span>
                        </div>
                        <p className="text-[10px] text-[#6B7280] uppercase font-medium">Concluídos</p>
                    </div>
                    <div className="p-3 bg-[#FFF5EB] rounded-xl text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="w-4 h-4 text-[#D2691E]" />
                            <span className="text-lg font-bold text-[#D2691E]">{inProgressCount}</span>
                        </div>
                        <p className="text-[10px] text-[#6B7280] uppercase font-medium">Em Andamento</p>
                    </div>
                </div>

                {/* Botão elegante */}
                {canShowButton && (
                    <Button
                        className="w-full h-11 bg-[#D2691E] hover:bg-[#B85715] text-white font-semibold rounded-xl transition-all"
                        onClick={onRequestProject}
                    >
                        Solicitar Projeto
                        <ArrowUpRight className="w-4 h-4 ml-2" />
                    </Button>
                )}

                {showButton && !canShowButton && (
                    <div className="text-center py-2 px-3 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB]">
                        <p className="text-xs text-[#9CA3AF]">
                            Seu histórico de projetos
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== ELOS DA ROTA V6 - HYBRID ========
interface ElosDaRotaV6Props {
    connections: Array<{
        id: string
        full_name: string
        avatar_url: string | null
        rank_name?: string
    }>
    pendingCount?: number
    userId: string
}

export function ElosDaRotaV6({ connections, pendingCount = 0, userId }: ElosDaRotaV6Props) {
    return (
        <Card className="bg-white border border-[#E8EDE8] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                {/* Header profissional */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-[#1E4D40] flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Elos da Rota
                            </h3>
                            <p className="text-xs text-[#6B7280]">
                                {connections.length} conexões
                            </p>
                        </div>
                    </div>

                    {pendingCount > 0 && (
                        <button className="relative p-2 rounded-xl hover:bg-[#FFF5EB] transition-colors">
                            <Bell className="w-5 h-5 text-[#D2691E]" />
                            <span className="absolute top-0 right-0 w-5 h-5 bg-[#D2691E] rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                {pendingCount}
                            </span>
                        </button>
                    )}
                </div>

                {/* Avatares sobrepostos (estilo V5) com info profissional (estilo V4) */}
                {connections.length === 0 ? (
                    <div className="text-center py-8 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB]">
                        <Users className="w-10 h-10 text-[#D1D5DB] mx-auto mb-2" />
                        <p className="text-sm text-[#6B7280]">
                            Ainda não há conexões
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1">
                            Conecte-se com outros profissionais
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Avatares sobrepostos elegantes */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex -space-x-2">
                                {connections.slice(0, 5).map((conn, idx) => (
                                    <Link
                                        key={conn.id}
                                        href={`/profile/${conn.id}`}
                                        className="relative w-10 h-10 rounded-full bg-white ring-2 ring-white overflow-hidden hover:ring-[#1E4D40] hover:z-10 transition-all shadow-sm"
                                        style={{ zIndex: 5 - idx }}
                                    >
                                        {conn.avatar_url ? (
                                            <Image
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-[#1E4D40] to-[#2A6B5A] flex items-center justify-center">
                                                <span className="text-xs font-bold text-white">
                                                    {conn.full_name.charAt(0)}
                                                </span>
                                            </div>
                                        )}
                                    </Link>
                                ))}
                                {connections.length > 5 && (
                                    <div className="relative w-10 h-10 rounded-full bg-[#1E4D40] ring-2 ring-white flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                        +{connections.length - 5}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#2D3142]">
                                    {connections.slice(0, 2).map(c => c.full_name.split(' ')[0]).join(', ')}
                                    {connections.length > 2 && ` e mais ${connections.length - 2}`}
                                </p>
                                <p className="text-xs text-[#6B7280]">
                                    Sua rede profissional
                                </p>
                            </div>
                        </div>

                        {/* Lista resumida das últimas conexões */}
                        <div className="space-y-2 mb-3">
                            {connections.slice(0, 3).map((conn) => (
                                <Link
                                    key={conn.id}
                                    href={`/profile/${conn.id}`}
                                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F0F5F0] transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-full bg-[#E8EDE8] flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {conn.avatar_url ? (
                                            <Image
                                                src={conn.avatar_url}
                                                alt={conn.full_name}
                                                width={36}
                                                height={36}
                                                className="rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-[#1E4D40]">
                                                {conn.full_name.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[#2D3142] truncate">
                                            {conn.full_name}
                                        </p>
                                        {conn.rank_name && (
                                            <p className="text-xs text-[#6B7280]">{conn.rank_name}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-[#D1D5DB] flex-shrink-0" />
                                </Link>
                            ))}
                        </div>

                        {connections.length > 3 && (
                            <Link
                                href={`/profile/${userId}/connections`}
                                className="flex items-center justify-center gap-2 py-2 text-sm font-medium text-[#1E4D40] hover:text-[#D2691E] transition-colors"
                            >
                                Ver todas as conexões
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}

// ======== CONFRARIAS V6 ========
interface ConfraternityV6Props {
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

export function ConfraternityStatsV6({ confraternities }: ConfraternityV6Props) {
    const formatDate = (date: string) => {
        const d = new Date(date)
        return {
            day: d.getDate(),
            month: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
            weekday: d.toLocaleDateString('pt-BR', { weekday: 'short' }),
            time: d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
    }

    return (
        <Card className="bg-white border border-[#E8EDE8] shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-xl bg-[#D2691E] flex items-center justify-center">
                        <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-[#2D3142]">
                            Confrarias
                        </h3>
                        <p className="text-xs text-[#6B7280]">
                            Próximos encontros
                        </p>
                    </div>
                </div>

                {confraternities.length === 0 ? (
                    <div className="text-center py-8 bg-[#FFF5EB] rounded-xl border border-dashed border-[#F5D0B0]">
                        <Calendar className="w-10 h-10 text-[#E8B894] mx-auto mb-2" />
                        <p className="text-sm text-[#8B5A2B]">
                            Nenhuma confraria agendada
                        </p>
                        <p className="text-xs text-[#B8956F] mt-1">
                            Agende um encontro com sua rede
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {confraternities.slice(0, 3).map((conf) => {
                            const date = formatDate(conf.proposed_date)
                            return (
                                <div
                                    key={conf.id}
                                    className="flex items-center gap-3 p-3 bg-[#FFFBF7] rounded-xl border border-[#F5E6D8] hover:border-[#D2691E]/30 transition-colors"
                                >
                                    {/* Calendário visual elegante */}
                                    <div className="w-14 h-14 flex-shrink-0 rounded-xl bg-white border border-[#E8EDE8] flex flex-col items-center justify-center shadow-sm">
                                        <span className="text-lg font-bold text-[#D2691E]">{date.day}</span>
                                        <span className="text-[10px] uppercase text-[#6B7280] font-medium">{date.month}</span>
                                    </div>

                                    {/* Avatar do parceiro */}
                                    <div className="w-12 h-12 rounded-xl bg-white border border-[#E8EDE8] flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {conf.partner?.avatar_url ? (
                                            <Image
                                                src={conf.partner.avatar_url}
                                                alt={conf.partner.full_name}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-lg font-bold text-[#D2691E]">
                                                {conf.partner?.full_name?.charAt(0) || '?'}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-[#2D3142] truncate">
                                            {conf.partner?.full_name}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs text-[#6B7280] mt-0.5">
                                            <span className="capitalize">{date.weekday}</span>
                                            <span>•</span>
                                            <span>{date.time}</span>
                                        </div>
                                        {conf.location && (
                                            <div className="flex items-center gap-1 text-xs text-[#9CA3AF] mt-0.5">
                                                <MapPin className="w-3 h-3" />
                                                <span className="truncate">{conf.location}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ======== NA ROTA FEED V6 - PROFISSIONAL COM TOQUE ELEGANTE ========
interface NaRotaFeedV6Props {
    userId: string
    userName: string
    userAvatar?: string | null
    ratings: Array<{
        id: string
        rating: number
        comment?: string
        created_at: string
        reviewer?: { full_name: string; avatar_url?: string }
    }>
    portfolio: any[]
    posts?: Array<{
        id: string
        image_url: string
        caption?: string
        likes: number
        comments: number
        created_at: string
    }>
}

export function NaRotaFeedV6({ userId, userName, userAvatar, ratings, portfolio, posts = [] }: NaRotaFeedV6Props) {
    const allItems = [
        ...ratings.map(r => ({ type: 'rating' as const, date: r.created_at, data: r })),
        ...portfolio.map(p => ({ type: 'portfolio' as const, date: p.created_at, data: p })),
        ...posts.map(p => ({ type: 'post' as const, date: p.created_at, data: p }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const formatRelativeTime = (date: string) => {
        const now = new Date()
        const d = new Date(date)
        const diffMs = now.getTime() - d.getTime()
        const diffMins = Math.floor(diffMs / 60000)
        const diffHours = Math.floor(diffMins / 60)
        const diffDays = Math.floor(diffHours / 24)

        if (diffMins < 1) return 'agora'
        if (diffMins < 60) return `${diffMins}min`
        if (diffHours < 24) return `${diffHours}h`
        if (diffDays < 7) return `${diffDays}d`
        return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    }

    const getFirstName = (name: string) => name.split(' ')[0]

    return (
        <Card className="bg-white border border-[#E8EDE8] shadow-sm">
            {/* Header elegante */}
            <div className="px-5 py-4 border-b border-[#E8EDE8]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1E4D40] to-[#D2691E] flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-[#2D3142]">
                                Na Rota
                            </h3>
                            <p className="text-xs text-[#6B7280]">
                                {allItems.length} publicações
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feed */}
            <div className="divide-y divide-[#E8EDE8]">
                {allItems.length === 0 ? (
                    <div className="text-center py-12 px-5">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#F0F5F0] flex items-center justify-center">
                            <Camera className="w-10 h-10 text-[#D1D5DB]" />
                        </div>
                        <p className="text-sm font-medium text-[#6B7280]">
                            Nenhuma publicação ainda
                        </p>
                        <p className="text-xs text-[#9CA3AF] mt-1 max-w-[200px] mx-auto">
                            As atividades e fotos de {getFirstName(userName)} aparecerão aqui
                        </p>
                    </div>
                ) : (
                    allItems.slice(0, 5).map((item, idx) => (
                        <div key={idx} className="p-4">
                            {/* Header do post */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-[#E8EDE8] flex items-center justify-center overflow-hidden">
                                        {userAvatar ? (
                                            <Image
                                                src={userAvatar}
                                                alt={userName}
                                                width={40}
                                                height={40}
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-sm font-bold text-[#1E4D40]">
                                                {userName.charAt(0)}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#2D3142]">
                                            {getFirstName(userName)}
                                        </p>
                                        <p className="text-xs text-[#9CA3AF]">
                                            {formatRelativeTime(item.date)}
                                        </p>
                                    </div>
                                </div>
                                <button className="p-1 rounded-full hover:bg-[#F0F5F0] transition-colors">
                                    <MoreHorizontal className="w-5 h-5 text-[#9CA3AF]" />
                                </button>
                            </div>

                            {/* Conteúdo */}
                            {item.type === 'rating' && (
                                <div className="mb-3">
                                    <div className="p-4 bg-[#FFFBF7] rounded-xl border border-[#F5E6D8]">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-5 h-5 text-[#D2691E] fill-[#D2691E]" />
                                            <span className="text-sm text-[#2D3142]">
                                                Recebeu uma avaliação de <strong>{item.data.reviewer?.full_name || 'Alguém'}</strong>
                                            </span>
                                        </div>
                                        <div className="flex gap-0.5 mb-2">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={cn(
                                                        "w-5 h-5",
                                                        i < item.data.rating
                                                            ? "text-yellow-400 fill-yellow-400"
                                                            : "text-gray-200"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                        {item.data.comment && (
                                            <p className="text-sm text-[#4B5563] italic">
                                                "{item.data.comment}"
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {item.type === 'portfolio' && item.data.image_url && (
                                <div className="mb-3">
                                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F0F5F0]">
                                        <Image
                                            src={item.data.image_url}
                                            alt={item.data.title || 'Projeto'}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    {item.data.title && (
                                        <p className="text-sm text-[#2D3142] mt-2 font-medium">
                                            {item.data.title}
                                        </p>
                                    )}
                                    {item.data.description && (
                                        <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">
                                            {item.data.description}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Ações elegantes */}
                            <div className="flex items-center gap-6 pt-2">
                                <button className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#D2691E] transition-colors">
                                    <Heart className="w-5 h-5" />
                                    <span className="text-sm font-medium">Curtir</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#1E4D40] transition-colors">
                                    <MessageCircle className="w-5 h-5" />
                                    <span className="text-sm font-medium">Comentar</span>
                                </button>
                                <button className="flex items-center gap-1.5 text-[#6B7280] hover:text-[#1E4D40] transition-colors">
                                    <Share2 className="w-5 h-5" />
                                    <span className="text-sm font-medium">Compartilhar</span>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </Card>
    )
}
