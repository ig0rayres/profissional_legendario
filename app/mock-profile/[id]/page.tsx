import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Star, MapPin, Trophy, Flame, Shield, Lock, Users, Camera, Calendar, Zap } from 'lucide-react'
import Link from 'next/link'
import { Progress } from '@/components/ui/progress'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { MedalBadge } from '@/components/gamification/medal-badge'

export default function MockProfilePage({ params }: { params: { id: string } }) {
    const prof = MOCK_PROFESSIONALS.find(p => p.id === params.id)
    if (!prof) notFound()

    const gamif = MOCK_USER_GAMIFICATION.find(g => g.user_id === prof.user_id)
    const rank = MOCK_RANKS.find(r => r.id === gamif?.current_rank_id) || MOCK_RANKS[0]
    const nextRank = MOCK_RANKS.find(r => r.display_order === rank.display_order + 1)

    const earnedBadgeIds = gamif?.badges_earned.map(b => b.badge_id) || []
    const totalBadges = MOCK_BADGES.length
    const earnedCount = earnedBadgeIds.length
    const progressPercent = (earnedCount / totalBadges) * 100

    // Mock confraternity stats
    const confraternityStats = {
        total_created: 5,
        total_attended: 12,
        total_photos: 23,
        next_event: {
            title: 'Churrasco da Vitória',
            date: '2026-01-25T19:00:00'
        }
    }

    return (
        <div className="min-h-screen bg-adventure">
            {/* Header */}
            <header className="border-b border-primary/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <Link href="/professionals">
                        <Button variant="outline" size="sm" className="border-primary/20">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {/* Profile Header */}
                <div className="glass-strong border-primary/20 p-8 mb-8">
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden border-4 border-primary/30">
                                {prof.avatar_url ? (
                                    <img src={prof.avatar_url} alt={prof.full_name} className="w-full h-full object-cover" />
                                ) : (
                                    <Users className="w-16 h-16 text-primary" />
                                )}
                            </div>
                            {prof.verified && (
                                <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-2 border-background">
                                    <Shield className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-4xl font-black text-white text-impact mb-2">{prof.full_name}</h1>
                            <div className="flex items-center gap-2 mb-4">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{prof.location}</span>
                            </div>
                            <p className="text-foreground mb-4">{prof.bio}</p>
                            <div className="flex flex-wrap gap-2">
                                {prof.specialties.map((spec, idx) => (
                                    <Badge key={idx} variant="outline" className="border-primary/20">
                                        {spec}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 mb-2">
                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                <span className="text-2xl font-bold text-yellow-500">{prof.rating}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {prof.total_reviews} avaliações
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Gamification */}
                    <div className="space-y-6">
                        {/* Gamification Card */}
                        <Card className="glass-strong border-secondary/30 bg-secondary/5 glow-orange">
                            <CardHeader className="border-b border-secondary/20">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Trophy className="h-5 w-5 text-secondary" />
                                    GAMIFICAÇÃO
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Current Rank */}
                                <div className="text-center">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
                                        PATENTE ATUAL
                                    </div>
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        <RankInsignia rankId={rank.id} size="lg" />
                                    </div>
                                    <div className="text-2xl font-black text-white uppercase mb-2">
                                        {rank.name}
                                    </div>
                                    <div className="text-sm text-slate-400">
                                        Multiplicador: <span className="text-secondary font-bold">x{rank.multiplier.toFixed(1)}</span>
                                    </div>
                                </div>

                                {/* Progress to Next Rank */}
                                {nextRank && (
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="text-slate-400">Progresso para {nextRank.name}</span>
                                            <span className="text-white font-bold">
                                                {gamif?.total_xp || 0} / {nextRank.min_xp}
                                            </span>
                                        </div>
                                        <Progress
                                            value={((gamif?.total_xp || 0) / nextRank.min_xp) * 100}
                                            className="h-3 bg-slate-800"
                                        />
                                    </div>
                                )}

                                {/* Total Vigor */}
                                <div className="glass border border-secondary/20 p-4 rounded-lg text-center">
                                    <div className="flex items-center justify-center gap-2 mb-1">
                                        <Flame className="h-6 w-6 text-secondary animate-pulse" />
                                        <span className="text-4xl font-black text-secondary">
                                            {gamif?.total_xp || 0}
                                        </span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        VIGOR TOTAL
                                    </div>
                                </div>

                                {/* Medals Count */}
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-400">Medalhas Conquistadas</span>
                                    <span className="text-white font-black">{earnedCount}/{totalBadges}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Confraternity Stats */}
                        <Card className="glass-strong border-primary/20">
                            <CardHeader className="border-b border-primary/20">
                                <CardTitle className="flex items-center gap-2 text-white">
                                    <Users className="h-5 w-5 text-primary" />
                                    CONFRARIA
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-white">{confraternityStats.total_created}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Criadas</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-black text-white">{confraternityStats.total_attended}</div>
                                        <div className="text-[10px] font-bold text-slate-400 uppercase">Participou</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Camera className="h-4 w-4 text-primary" />
                                    <span className="text-white font-bold">{confraternityStats.total_photos}</span>
                                    <span className="text-slate-400">fotos compartilhadas</span>
                                </div>

                                {confraternityStats.next_event && (
                                    <div className="glass border border-primary/10 p-3 rounded-lg">
                                        <div className="flex items-start gap-2">
                                            <Calendar className="h-4 w-4 text-primary mt-1" />
                                            <div>
                                                <div className="text-sm font-bold text-white">{confraternityStats.next_event.title}</div>
                                                <div className="text-xs text-slate-400">
                                                    {new Date(confraternityStats.next_event.date).toLocaleDateString('pt-BR', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" className="flex-1 text-xs">
                                        Ver Galeria
                                    </Button>
                                    <Button variant="default" size="sm" className="flex-1 text-xs">
                                        Criar Evento
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column - Medals Grid */}
                    <div className="lg:col-span-2">
                        <Card className="glass-strong border-primary/20">
                            <CardHeader className="border-b border-primary/20">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Trophy className="h-5 w-5 text-primary" />
                                        MEDALHAS ({earnedCount}/{totalBadges})
                                    </CardTitle>
                                    <div className="text-sm">
                                        <Progress value={progressPercent} className="w-32 h-2 bg-slate-800" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {MOCK_BADGES.map((badge) => {
                                        const isEarned = earnedBadgeIds.includes(badge.id)
                                        return (
                                            <div
                                                key={badge.id}
                                                className={`
                                                    glass p-4 rounded-lg text-center transition-all
                                                    ${isEarned
                                                        ? 'border-2 border-secondary/30 bg-secondary/5 hover:glow-orange cursor-pointer'
                                                        : 'opacity-40 border border-slate-700 cursor-not-allowed'}
                                                `}
                                                title={`${badge.name}: ${badge.description} (+${badge.xp_reward} XP)`}
                                            >
                                                <div className="relative mb-2">
                                                    <div className={`flex justify-center ${!isEarned && 'grayscale'}`}>
                                                        <MedalBadge medalId={badge.id} size="lg" variant="icon-only" />
                                                    </div>
                                                    {!isEarned && (
                                                        <Lock className="absolute inset-0 m-auto h-6 w-6 text-slate-600" />
                                                    )}
                                                </div>
                                                <div className={`text-xs font-bold ${isEarned ? 'text-white' : 'text-slate-500'} line-clamp-2 mb-1`}>
                                                    {badge.name}
                                                </div>
                                                <div className="text-[10px] font-bold text-slate-600">
                                                    +{badge.xp_reward} XP
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
