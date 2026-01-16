import { notFound } from 'next/navigation'
import { ProfileHeader } from '@/components/professional/profile-header'
import { ProfileInfo } from '@/components/professional/profile-info'
import { PortfolioGallery } from '@/components/portfolio/portfolio-gallery'
import { RatingForm } from '@/components/ratings/rating-form'
import { RatingList } from '@/components/ratings/rating-list'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Star, Briefcase, Award, Medal } from 'lucide-react'
import Link from 'next/link'
import {
    MOCK_PROFESSIONALS,
    MOCK_REVIEWS,
    MOCK_USER_GAMIFICATION,
    MOCK_RANKS,
    MOCK_BADGES
} from '@/lib/data/mock'

interface PageProps {
    params: {
        id: string
    }
}

export default function ProfessionalProfile({ params }: { params: { id: string } }) {
    // Get professional profile from mock data
    const profile = MOCK_PROFESSIONALS.find(p => p.id === params.id)

    if (!profile) {
        notFound()
    }

    const gamification = MOCK_USER_GAMIFICATION.find(g => g.user_id === profile.user_id)
    const rank = MOCK_RANKS.find(r => r.id === gamification?.current_rank_id) || MOCK_RANKS[0]
    const earnedBadges = MOCK_BADGES.filter(b =>
        gamification?.badges_earned.some(eb => eb.badge_id === b.id)
    )

    // Mock portfolio items (since we don't have them in mock.ts yet, we'll use empty or generate some)
    const portfolioItems = [
        {
            id: '1',
            title: 'Projeto Exemplo 1',
            description: 'Descrição do projeto exemplo',
            image_url: '/images/event-1.jpg',
            user_id: params.id,
            display_order: 1
        },
        {
            id: '2',
            title: 'Projeto Exemplo 2',
            description: 'Descrição do projeto exemplo',
            image_url: '/images/event-2.jpg',
            image: '/images/event-2.jpg',
            user_id: params.id,
            display_order: 2
        }
    ]

    // Adapt mock profile to component expected shape if necessary
    const adaptedProfile = {
        ...profile,
        skills: profile.specialties,
        tops: { name: profile.location },
        portfolio_description: 'Confira alguns dos meus trabalhos recentes.',
        total_ratings: profile.total_reviews,
        average_rating: profile.rating,
        rank,
        badges: earnedBadges
    }

    return (
        <div className="min-h-screen bg-adventure">
            <div className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Profile Header */}
                <ProfileHeader profile={adaptedProfile} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* About Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Sobre</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {profile.bio ? (
                                    <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
                                ) : (
                                    <p className="text-gray-500 italic">Este profissional ainda não adicionou uma bio.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Portfolio Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Portfólio</CardTitle>
                                <CardDescription>
                                    Trabalhos realizados
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <PortfolioGallery items={portfolioItems} columns={2} />
                            </CardContent>
                        </Card>

                        {/* Ratings Section */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <Star className="w-5 h-5 text-yellow-500" />
                                            Avaliações
                                        </CardTitle>
                                        <CardDescription>
                                            {profile.total_reviews > 0
                                                ? `${profile.total_reviews} ${profile.total_reviews === 1 ? 'avaliação' : 'avaliações'}`
                                                : 'Nenhuma avaliação ainda'}
                                        </CardDescription>
                                    </div>
                                    {profile.rating > 0 && (
                                        <div className="text-right">
                                            <div className="text-3xl font-bold text-yellow-500">
                                                {profile.rating.toFixed(1)}
                                            </div>
                                            <div className="flex gap-1 mt-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= Math.round(profile.rating)
                                                            ? 'text-yellow-500 fill-yellow-500'
                                                            : 'text-gray-600'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Rating List */}
                                <RatingList professionalId={params.id} />
                            </CardContent>
                        </Card>

                        {/* Rating Form */}
                        <RatingForm
                            professionalId={params.id}
                            professionalName={profile.full_name}
                        />
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Gamification Badges */}
                        {adaptedProfile.badges && adaptedProfile.badges.length > 0 && (
                            <Card className="border-secondary/20 bg-secondary/5 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                    <Award className="w-12 h-12 text-secondary" />
                                </div>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-black uppercase text-secondary flex items-center gap-2">
                                        <Medal className="w-4 h-4" />
                                        Conquistas
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {adaptedProfile.badges.map((badge: any) => (
                                            <div
                                                key={badge.id}
                                                title={`${badge.name}: ${badge.description}`}
                                                className="w-10 h-10 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center hover:scale-110 transition-transform cursor-help group shadow-inner"
                                            >
                                                <Award className="w-5 h-5 text-secondary group-hover:text-amber-400 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-wider">
                                        {adaptedProfile.badges.length} de 11 Medalhas conquistadas
                                    </p>
                                </CardContent>
                            </Card>
                        )}

                        {/* Contact Card */}
                        <ProfileInfo profile={adaptedProfile} />

                        {/* Request Project Button */}
                        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Solicitar Orçamento
                                </CardTitle>
                                <CardDescription>
                                    Interessado no trabalho deste profissional?
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className="w-full" size="lg" disabled>
                                    <Briefcase className="w-4 h-4 mr-2" />
                                    Em Breve
                                </Button>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Sistema de solicitações em desenvolvimento
                                </p>
                            </CardContent>
                        </Card>

                        {/* Skills */}
                        {profile.specialties && profile.specialties.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Habilidades</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {profile.specialties.map((skill: string, i: number) => (
                                            <span
                                                key={i}
                                                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Location */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Localização</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-lg font-medium">{profile.location}</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Back to Search */}
                <div className="mt-8 text-center">
                    <Link href="/professionals">
                        <Button variant="outline">
                            ← Voltar para Busca de Profissionais
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
