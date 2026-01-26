'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Star, Camera, Users, Briefcase, Flame, Award, MapPin, MessageCircle, ChevronRight, Sparkles, TrendingUp } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface NaRotaFeedV2Props {
    userId: string
    userName: string
    ratings: any[]
    portfolio: any[]
    confraternityPhotos?: any[]
    activities?: any[]
}

export function NaRotaFeedV2({
    userId,
    userName,
    ratings,
    portfolio,
    confraternityPhotos = [],
    activities = []
}: NaRotaFeedV2Props) {

    // Combinar todas as atividades em um feed único
    const allItems = [
        ...ratings.map(r => ({ type: 'rating', date: r.created_at, data: r })),
        ...portfolio.map(p => ({ type: 'portfolio', date: p.created_at, data: p })),
        ...confraternityPhotos.map(c => ({ type: 'confraternity', date: c.created_at, data: c })),
        ...activities.map(a => ({ type: a.activity_type, date: a.created_at, data: a }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    const getFirstName = (name: string) => name.split(' ')[0]

    return (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#0F1B1A] via-[#1A2421] to-[#0F1B1A] shadow-2xl">
            {/* Borda luminosa sutil */}
            <div className="absolute inset-0 rounded-lg p-[1px] bg-gradient-to-br from-[#D2691E]/20 via-transparent to-[#1E4D40]/20" />

            {/* Decoração background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-[#D2691E]/5 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#1E4D40]/5 to-transparent rounded-full blur-3xl" />

            <CardContent className="relative p-0">
                {/* Header Premium */}
                <div className="p-5 pb-4 border-b border-[#2D3B2D]/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D2691E] via-[#E07530] to-[#D2691E] flex items-center justify-center shadow-lg shadow-[#D2691E]/20">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <div className="absolute inset-0 w-10 h-10 rounded-xl bg-[#D2691E]/20 blur-xl" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-wider text-[#F2F4F3]">
                                    NA ROTA
                                </h3>
                                <p className="text-[10px] text-[#8B9A8B] uppercase tracking-wide">
                                    Atividades Recentes
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5 bg-[#D2691E]/10 px-3 py-1.5 rounded-full border border-[#D2691E]/20">
                                <TrendingUp className="w-3.5 h-3.5 text-[#D2691E]" />
                                <span className="text-sm font-bold text-[#D2691E]">{allItems.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feed Content */}
                <div className="p-5 pt-4">
                    {allItems.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="relative inline-block">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#D2691E]/10 to-[#D2691E]/5 flex items-center justify-center mx-auto mb-4">
                                    <MapPin className="w-10 h-10 text-[#D2691E]/20" />
                                </div>
                                <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-[#D2691E]/30 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-[#8B9A8B] uppercase tracking-wide mb-1">
                                Nenhuma atividade ainda
                            </p>
                            <p className="text-xs text-[#6B7A6B] max-w-[200px] mx-auto">
                                As atividades de {getFirstName(userName)} aparecerão aqui
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {allItems.slice(0, 5).map((item, idx) => (
                                <FeedItemV2
                                    key={idx}
                                    item={item}
                                    userName={userName}
                                    isFirst={idx === 0}
                                    isLast={idx === Math.min(allItems.length, 5) - 1}
                                />
                            ))}

                            {allItems.length > 5 && (
                                <Link
                                    href={`/profile/${userId}/activities`}
                                    className={cn(
                                        "flex items-center justify-center gap-2",
                                        "py-3 rounded-xl",
                                        "bg-gradient-to-r from-[#D2691E]/5 to-[#1E4D40]/5",
                                        "border border-[#2D3B2D]/50",
                                        "text-xs font-bold text-[#8B9A8B] uppercase tracking-wide",
                                        "hover:border-[#D2691E]/30 hover:text-[#D2691E]",
                                        "transition-all duration-300 group"
                                    )}
                                >
                                    Ver todas as atividades
                                    <span className="bg-[#D2691E]/10 px-2 py-0.5 rounded-full text-[10px] text-[#D2691E]">
                                        +{allItems.length - 5}
                                    </span>
                                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// Componente de item do feed V2
function FeedItemV2({ item, userName, isFirst, isLast }: { item: any, userName: string, isFirst?: boolean, isLast?: boolean }) {
    const typeConfig = {
        rating: {
            icon: Star,
            label: 'recebeu uma avaliação',
            gradient: 'from-yellow-500 to-amber-600',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
            textColor: 'text-yellow-500'
        },
        portfolio: {
            icon: Briefcase,
            label: 'adicionou um projeto',
            gradient: 'from-[#1E4D40] to-[#143832]',
            bgColor: 'bg-[#1E4D40]/10',
            borderColor: 'border-[#1E4D40]/20',
            textColor: 'text-[#1E4D40]'
        },
        confraternity: {
            icon: Users,
            label: 'participou de uma confraria',
            gradient: 'from-[#D2691E] to-[#B85715]',
            bgColor: 'bg-[#D2691E]/10',
            borderColor: 'border-[#D2691E]/20',
            textColor: 'text-[#D2691E]'
        },
        medal_earned: {
            icon: Award,
            label: 'conquistou uma medalha',
            gradient: 'from-amber-500 to-orange-600',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20',
            textColor: 'text-amber-500'
        },
        rank_up: {
            icon: Flame,
            label: 'subiu de patente',
            gradient: 'from-[#D2691E] to-red-600',
            bgColor: 'bg-[#D2691E]/10',
            borderColor: 'border-[#D2691E]/20',
            textColor: 'text-[#D2691E]'
        }
    }

    const config = typeConfig[item.type as keyof typeof typeConfig] || {
        icon: TrendingUp,
        label: 'atividade',
        gradient: 'from-gray-500 to-gray-600',
        bgColor: 'bg-gray-500/10',
        borderColor: 'border-gray-500/20',
        textColor: 'text-gray-500'
    }

    const IconComponent = config.icon
    const getFirstName = (name: string) => name.split(' ')[0]

    return (
        <div className={cn(
            "relative group",
            "bg-gradient-to-br from-[#1A2421]/80 to-[#0F1B1A]/60",
            "border rounded-xl overflow-hidden",
            config.borderColor,
            "hover:shadow-lg transition-all duration-300"
        )}>
            {/* Barra colorida lateral */}
            <div className={cn(
                "absolute left-0 top-0 bottom-0 w-1",
                `bg-gradient-to-b ${config.gradient}`
            )} />

            <div className="p-4 pl-5">
                {/* Header do post */}
                <div className="flex items-center gap-3 mb-3">
                    <div className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shadow-lg",
                        `bg-gradient-to-br ${config.gradient}`
                    )}>
                        <IconComponent className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm">
                            <span className="font-bold text-[#F2F4F3]">{getFirstName(userName)}</span>{' '}
                            <span className="text-[#8B9A8B]">{config.label}</span>
                        </p>
                        <p className="text-[10px] text-[#6B7A6B]">
                            {formatRelativeTime(item.date)}
                        </p>
                    </div>

                    {/* Badge NEW para primeiro item */}
                    {isFirst && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#1E4D40]/20 border border-[#1E4D40]/30">
                            <Sparkles className="w-3 h-3 text-[#1E4D40]" />
                            <span className="text-[9px] font-bold text-[#1E4D40] uppercase">Novo</span>
                        </div>
                    )}
                </div>

                {/* Conteúdo específico do tipo */}
                <div className="ml-12">
                    {item.type === 'rating' && <RatingContentV2 rating={item.data} />}
                    {item.type === 'portfolio' && <PortfolioContentV2 portfolio={item.data} />}
                    {item.type === 'confraternity' && <ConfraternityContentV2 photo={item.data} />}
                    {item.type === 'medal_earned' && <MedalContentV2 activity={item.data} />}
                    {item.type === 'rank_up' && <RankUpContentV2 activity={item.data} />}
                </div>
            </div>
        </div>
    )
}

// Rating Content V2
function RatingContentV2({ rating }: { rating: any }) {
    return (
        <div className="bg-[#0F1B1A]/50 rounded-lg p-3 border border-[#2D3B2D]/50">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={cn(
                                "w-4 h-4 transition-all",
                                i < rating.rating
                                    ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_3px_rgba(234,179,8,0.5)]'
                                    : 'text-[#2D3B2D]'
                            )}
                        />
                    ))}
                </div>
                <span className="text-[10px] text-[#6B7A6B]">
                    por {rating.reviewer?.full_name?.split(' ')[0] || 'Usuário'}
                </span>
            </div>
            {rating.comment && (
                <p className="text-xs italic text-[#8B9A8B] leading-relaxed">
                    "{rating.comment}"
                </p>
            )}
        </div>
    )
}

// Portfolio Content V2
function PortfolioContentV2({ portfolio }: { portfolio: any }) {
    return (
        <div className="space-y-2">
            {portfolio.image_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-[#2D3B2D]/50 group/img">
                    <Image
                        src={portfolio.image_url}
                        alt={portfolio.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
            )}
            <p className="font-bold text-sm text-[#F2F4F3]">{portfolio.title}</p>
            {portfolio.description && (
                <p className="text-xs text-[#8B9A8B] line-clamp-2 leading-relaxed">
                    {portfolio.description}
                </p>
            )}
        </div>
    )
}

// Confraternity Content V2
function ConfraternityContentV2({ photo }: { photo: any }) {
    return (
        <div className="space-y-2">
            {photo.photo_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-[#D2691E]/20 group/img">
                    <Image
                        src={photo.photo_url}
                        alt={photo.title || 'Confraria'}
                        fill
                        className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity" />
                </div>
            )}
            <p className="font-bold text-sm flex items-center gap-1.5 text-[#F2F4F3]">
                <Users className="w-3.5 h-3.5 text-[#D2691E]" />
                {photo.title || 'Confraria'}
            </p>
        </div>
    )
}

// Medal Content V2
function MedalContentV2({ activity }: { activity: any }) {
    return (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 rounded-lg p-3 flex items-center gap-3 border border-amber-500/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Award className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="font-bold text-sm text-[#F2F4F3]">
                    {activity.activity_data?.medal_name || 'Nova Medalha'}
                </p>
                <p className="text-xs text-amber-400">
                    +{activity.activity_data?.xp_reward || 0} XP
                </p>
            </div>
        </div>
    )
}

// Rank Up Content V2
function RankUpContentV2({ activity }: { activity: any }) {
    return (
        <div className="bg-gradient-to-r from-[#D2691E]/10 to-red-500/5 rounded-lg p-3 flex items-center gap-3 border border-[#D2691E]/20">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D2691E] to-red-600 flex items-center justify-center shadow-lg shadow-[#D2691E]/20 animate-pulse">
                <Flame className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="font-bold text-sm text-[#F2F4F3]">
                    Subiu para {activity.activity_data?.new_rank || 'nova patente'}!
                </p>
                <p className="text-xs text-[#D2691E]">
                    Novo nível desbloqueado
                </p>
            </div>
        </div>
    )
}

// Função para formatar data relativa
function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'agora mesmo'
    if (diffMins < 60) return `há ${diffMins}min`
    if (diffHours < 24) return `há ${diffHours}h`
    if (diffDays < 7) return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`

    return date.toLocaleDateString('pt-BR')
}
