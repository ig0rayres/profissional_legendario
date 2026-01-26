'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Star, Camera, Users, Briefcase, Flame, Award, MapPin } from 'lucide-react'
import Image from 'next/image'

interface NaRotaFeedProps {
    userId: string
    userName: string
    ratings: any[]
    portfolio: any[]
    confraternityPhotos?: any[]
    activities?: any[]
}

export function NaRotaFeed({
    userId,
    userName,
    ratings,
    portfolio,
    confraternityPhotos = [],
    activities = []
}: NaRotaFeedProps) {

    // Combinar todas as atividades em um feed único
    const allItems = [
        // Ratings como posts
        ...ratings.map(r => ({
            type: 'rating',
            date: r.created_at,
            data: r
        })),
        // Portfolio como posts
        ...portfolio.map(p => ({
            type: 'portfolio',
            date: p.created_at,
            data: p
        })),
        // Fotos de confraria
        ...confraternityPhotos.map(c => ({
            type: 'confraternity',
            date: c.created_at,
            data: c
        })),
        // Outras atividades
        ...activities.map(a => ({
            type: a.activity_type,
            date: a.created_at,
            data: a
        }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return (
        <Card className="border-[#2D3B2D] bg-[#1A2421]/60 backdrop-blur-sm shadow-lg shadow-black/30 hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="pb-3 border-b border-[#2D3B2D]">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2 text-[#F2F4F3]">
                    <MapPin className="w-4 h-4 text-[#D2691E]" />
                    NA ROTA
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                {allItems.length === 0 ? (
                    <div className="text-center py-12 text-[#D1D5DB]">
                        <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-bold uppercase tracking-wide">
                            Nenhuma atividade ainda
                        </p>
                        <p className="text-xs mt-1">
                            As atividades deste usuário aparecerão aqui
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {allItems.map((item, idx) => (
                            <FeedItem key={idx} item={item} userName={userName} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Componente de item do feed
function FeedItem({ item, userName }: { item: any, userName: string }) {
    const typeConfig = {
        rating: {
            icon: <Star className="w-4 h-4 text-yellow-500" />,
            label: 'recebeu uma avaliação',
            bgColor: 'bg-yellow-500/10'
        },
        portfolio: {
            icon: <Briefcase className="w-4 h-4 text-[#1E4D40]" />,
            label: 'adicionou um projeto',
            bgColor: 'bg-[#1E4D40]/10'
        },
        confraternity: {
            icon: <Users className="w-4 h-4 text-[#D2691E]" />,
            label: 'participou de uma confraria',
            bgColor: 'bg-[#D2691E]/10'
        },
        medal_earned: {
            icon: <Award className="w-4 h-4 text-amber-500" />,
            label: 'conquistou uma medalha',
            bgColor: 'bg-amber-500/10'
        },
        rank_up: {
            icon: <Flame className="w-4 h-4 text-[#D2691E]" />,
            label: 'subiu de patente',
            bgColor: 'bg-[#D2691E]/10'
        }
    }

    const config = typeConfig[item.type as keyof typeof typeConfig] || {
        icon: <Flame className="w-4 h-4" />,
        label: 'atividade',
        bgColor: 'bg-muted'
    }

    return (
        <div className="bg-[#0F1B1A]/50 p-4 rounded-lg border border-[#2D3B2D]">
            {/* Header do post */}
            <div className="flex items-center gap-3 mb-3">
                <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center`}>
                    {config.icon}
                </div>
                <div className="flex-1">
                    <p className="text-sm">
                        <span className="font-bold text-[#F2F4F3]">{userName}</span>{' '}
                        <span className="text-[#D1D5DB]">{config.label}</span>
                    </p>
                    <p className="text-[10px] text-[#D1D5DB]">
                        {formatRelativeTime(item.date)}
                    </p>
                </div>
            </div>

            {/* Conteúdo específico do tipo */}
            {item.type === 'rating' && (
                <RatingContent rating={item.data} />
            )}
            {item.type === 'portfolio' && (
                <PortfolioContent portfolio={item.data} />
            )}
            {item.type === 'confraternity' && (
                <ConfraternityContent photo={item.data} />
            )}
            {item.type === 'medal_earned' && (
                <MedalContent activity={item.data} />
            )}
            {item.type === 'rank_up' && (
                <RankUpContent activity={item.data} />
            )}
        </div>
    )
}

// Rating Content
function RatingContent({ rating }: { rating: any }) {
    return (
        <div className="bg-[#0F1B1A]/50 rounded-lg p-3 border border-[#2D3B2D]">
            <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating.rating ? 'text-yellow-500 fill-yellow-500' : 'text-[#D1D5DB]'}`}
                        />
                    ))}
                </div>
                <span className="text-xs text-[#D1D5DB]">
                    por {rating.reviewer?.full_name || 'Usuário'}
                </span>
            </div>
            {rating.comment && (
                <p className="text-sm italic text-[#D1D5DB]">
                    "{rating.comment}"
                </p>
            )}
        </div>
    )
}

// Portfolio Content
function PortfolioContent({ portfolio }: { portfolio: any }) {
    return (
        <div>
            {portfolio.image_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2 border border-[#2D3B2D]">
                    <Image
                        src={portfolio.image_url}
                        alt={portfolio.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <p className="font-bold text-sm text-[#F2F4F3]">{portfolio.title}</p>
            {portfolio.description && (
                <p className="text-xs text-[#D1D5DB] line-clamp-2">
                    {portfolio.description}
                </p>
            )}
        </div>
    )
}

// Confraternity Content
function ConfraternityContent({ photo }: { photo: any }) {
    return (
        <div>
            {photo.photo_url && (
                <div className="relative aspect-video rounded-lg overflow-hidden mb-2 border border-[#2D3B2D]">
                    <Image
                        src={photo.photo_url}
                        alt={photo.title || 'Confraria'}
                        fill
                        className="object-cover"
                    />
                </div>
            )}
            <p className="font-bold text-sm flex items-center gap-1 text-[#F2F4F3]">
                <Users className="w-3 h-3" />
                {photo.title || 'Confraria'}
            </p>
            {photo.description && (
                <p className="text-xs text-[#D1D5DB]">
                    {photo.description}
                </p>
            )}
        </div>
    )
}

// Medal Content
function MedalContent({ activity }: { activity: any }) {
    return (
        <div className="bg-amber-500/10 rounded-lg p-3 flex items-center gap-3 border border-amber-500/20">
            <Award className="w-8 h-8 text-amber-500" />
            <div>
                <p className="font-bold text-sm text-[#F2F4F3]">
                    {activity.activity_data?.medal_name || 'Nova Medalha'}
                </p>
                <p className="text-xs text-[#D1D5DB]">
                    +{activity.activity_data?.xp_reward || 0} XP
                </p>
            </div>
        </div>
    )
}

// Rank Up Content
function RankUpContent({ activity }: { activity: any }) {
    return (
        <div className="bg-[#D2691E]/10 rounded-lg p-3 flex items-center gap-3 border border-[#D2691E]/20">
            <Flame className="w-8 h-8 text-[#D2691E]" />
            <div>
                <p className="font-bold text-sm text-[#F2F4F3]">
                    Subiu para {activity.activity_data?.new_rank || 'nova patente'}!
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
