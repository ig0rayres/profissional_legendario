import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Briefcase, MapPin, Mail, Phone, ArrowLeft } from 'lucide-react'
import { GamificationCard } from '@/components/profile/gamification-card'
import { MedalsGrid } from '@/components/profile/medals-grid'
import { ConfraternityStats } from '@/components/profile/confraternity-stats'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import type { CompleteProfileData, RankData } from '@/lib/profile/types'

interface ProfilePageTemplateProps {
    profileData: CompleteProfileData
    nextRank?: RankData | null
    backUrl?: string
}

/**
 * Template centralizado da página de perfil
 * Qualquer mudança aqui é replicada para TODOS os perfis
 */
export function ProfilePageTemplate({ profileData, nextRank, backUrl = '/professionals' }: ProfilePageTemplateProps) {
    const {
        profile,
        gamification,
        subscription,
        allMedals,
        earnedMedals,
        confraternityStats,
        portfolio,
        ratings,
        ratingStats
    } = profileData

    // Badge de plano
    const planBadgeColor = {
        'recruta': 'bg-gray-500',
        'veterano': 'bg-blue-500',
        'elite': 'bg-purple-500'
    }[subscription?.plan_id || 'recruta'] || 'bg-gray-500'

    return (
        <div className="min-h-screen bg-adventure">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <Button variant="ghost" size="sm" asChild>
                        <a href={backUrl}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </a>
                    </Button>
                </div>

                {/* Header Card */}
                <Card className="mb-6 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary/20 to-secondary/20" />
                    <CardContent className="relative -mt-16 pb-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar */}
                            <div className="relative">
                                {profile.avatar_url ? (
                                    <Image
                                        src={profile.avatar_url}
                                        alt={profile.full_name}
                                        width={128}
                                        height={128}
                                        className="rounded-full border-4 border-background shadow-xl"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-4 border-background shadow-xl bg-primary/10 flex items-center justify-center">
                                        <span className="text-4xl font-bold text-primary">
                                            {profile.full_name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                {/* Plan Badge */}
                                <div className={`absolute bottom-0 right-0 ${planBadgeColor} text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-background`}>
                                    {subscription?.plan_tiers?.name || 'Recruta'}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 pt-4">
                                <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
                                <div className="flex flex-wrap gap-3 text-muted-foreground mb-3">
                                    {profile.pista && (
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm">{profile.pista}</span>
                                        </div>
                                    )}
                                    {profile.rota_number && (
                                        <Badge variant="outline">
                                            ID Rota: {profile.rota_number}
                                        </Badge>
                                    )}
                                </div>

                                {/* Bio */}
                                {profile.bio && (
                                    <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                        {profile.bio}
                                    </p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Gamification Card */}
                        <GamificationCard
                            gamification={gamification}
                            subscription={subscription}
                            nextRank={nextRank}
                        />

                        {/* Medals Grid */}
                        <MedalsGrid
                            allMedals={allMedals}
                            earnedMedals={earnedMedals}
                        />

                        {/* Portfolio (if has items) */}
                        {portfolio.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Portfólio</CardTitle>
                                    <CardDescription>Trabalhos realizados</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-4">
                                        {portfolio.map((item) => (
                                            <div key={item.id} className="space-y-2">
                                                {item.image_url && (
                                                    <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                                                        <Image
                                                            src={item.image_url}
                                                            alt={item.title}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-sm">{item.title}</p>
                                                    {item.description && (
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {item.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Ratings */}
                        {ratingStats && ratingStats.total_ratings > 0 && (
                            <Card>
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="flex items-center gap-2">
                                                <Star className="w-5 h-5 text-yellow-500" />
                                                Avaliações
                                            </CardTitle>
                                            <CardDescription>
                                                {ratingStats.total_ratings} {ratingStats.total_ratings === 1 ? 'avaliação' : 'avaliações'}
                                            </CardDescription>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-yellow-500">
                                                {ratingStats.average_rating.toFixed(1)}
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= Math.round(ratingStats.average_rating)
                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                : 'text-gray-600'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {ratings.map((rating) => (
                                            <div key={rating.id} className="border-b border-border last:border-0 pb-4 last:pb-0">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="font-bold text-primary">
                                                            {rating.reviewer?.full_name?.charAt(0).toUpperCase() || '?'}
                                                        </span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="font-semibold text-sm">
                                                                {rating.reviewer?.full_name || 'Usuário'}
                                                            </p>
                                                            <div className="flex gap-0.5">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star
                                                                        key={star}
                                                                        className={`w-3 h-3 ${star <= rating.rating
                                                                                ? 'text-yellow-500 fill-yellow-500'
                                                                                : 'text-gray-600'
                                                                            }`}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        {rating.comment && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {rating.comment}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            {new Date(rating.created_at).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Confraternity Stats */}
                        <ConfraternityStats stats={confraternityStats} />

                        {/* Contact Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-bold">Informações de Contato</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-muted-foreground">{profile.email}</span>
                                </div>
                                {profile.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">{profile.phone}</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Request Project (disabled for now) */}
                        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm">
                                    <Briefcase className="w-4 h-4" />
                                    Solicitar Orçamento
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    Interessado no trabalho deste profissional?
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" size="sm" disabled>
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Em Breve
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Sistema em desenvolvimento
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
