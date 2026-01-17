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
import { createClient } from '@/lib/supabase/server'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'

interface PageProps {
    params: {
        id: string
    }
}

export default async function ProfessionalProfile({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Buscar perfil real do usuário
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single()

    if (profileError || !profile) {
        notFound()
    }

    // Buscar gamificação
    const { data: gamification } = await supabase
        .from('user_gamification')
        .select('*')
        .eq('user_id', params.id)
        .single()

    // Buscar patente
    const { data: rank } = await supabase
        .from('ranks')
        .select('*')
        .eq('id', gamification?.current_rank_id || 'novato')
        .single()

    // Buscar medalhas conquistadas
    const { data: userMedals } = await supabase
        .from('user_medals')
        .select(`
            medal_id,
            earned_at,
            medals (
                id,
                name,
                icon,
                description
            )
        `)
        .eq('user_id', params.id)

    const earnedMedals = userMedals?.map(um => um.medals) || []

    // Buscar subscription/plano
    const { data: subscription } = await supabase
        .from('subscriptions')
        .select

        (`
            plan_id,
            plan_tiers (
                name,
                xp_multiplier
            )
        `)
        .eq('user_id', params.id)
        .single()

    // Portfolio items (vazio por enquanto)
    const portfolioItems: any[] = []

    // Adaptar profile para componentes
    const adaptedProfile = {
        ...profile,
        skills: [], // Ainda não temos campo de skills
        tops: { name: profile.pista || 'São Paulo' },
        portfolio_description: profile.bio || 'Profissional Rota Business',
        total_ratings: 0, // Ainda não temos avaliações
        average_rating: 0,
        rank: rank || { id: 'novato', name: 'Novato', icon: '🛡️' },
        badges: earnedMedals,
        gamification: gamification || { total_points: 0, total_medals: 0 },
        subscription: subscription?.plan_tiers || { name: 'Recruta', xp_multiplier: 1.0 }
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
                                    <p className="text-gray-500 italic">Este usuário ainda não adicionou uma bio.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Gamification Stats */}
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-primary" />
                                    Status Rota do Valente
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-background/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Patente</p>
                                        <div className="flex items-center gap-2">
                                            <RankInsignia rankId={gamification?.current_rank_id || 'novato'} size="md" />
                                            <p className="font-bold text-lg">{rank?.name}</p>
                                        </div>
                                    </div>
                                    <div className="bg-background/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Plano</p>
                                        <p className="font-bold text-lg capitalize">{subscription?.plan_tiers?.name || 'Recruta'}</p>
                                        <p className="text-xs text-muted-foreground">Multiplicador: {subscription?.plan_tiers?.xp_multiplier || 1.0}x</p>
                                    </div>
                                    <div className="bg-background/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Vigor</p>
                                        <p className="font-bold text-2xl text-primary">{gamification?.total_points || 0}</p>
                                    </div>
                                    <div className="bg-background/50 p-4 rounded-lg">
                                        <p className="text-sm text-muted-foreground mb-1">Medalhas</p>
                                        <p className="font-bold text-2xl text-secondary">{gamification?.total_medals || 0}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Portfolio Section */}
                        {portfolioItems.length > 0 && (
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
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Gamification Medals */}
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
                                {earnedMedals.length > 0 ? (
                                    <>
                                        <div className="flex flex-wrap gap-2">
                                            {earnedMedals.map((medal: any) => (
                                                <div
                                                    key={medal.id}
                                                    title={`${medal.name}: ${medal.description}`}
                                                    className="hover:scale-110 transition-transform cursor-help"
                                                >
                                                    <MedalBadge medalId={medal.id} size="md" variant="icon-only" />
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-wider">
                                            {earnedMedals.length} de 16 Medalhas conquistadas
                                        </p>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">Nenhuma medalha conquistada ainda</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Contact Card */}
                        <ProfileInfo profile={adaptedProfile} />

                        {/* Location */}
                        {profile.pista && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Localização</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-lg font-medium">{profile.pista}</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Back to Search */}
                <div className="mt-8 text-center">
                    <Link href="/professionals">
                        <Button variant="outline">
                            ← Voltar para Profissionais
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
