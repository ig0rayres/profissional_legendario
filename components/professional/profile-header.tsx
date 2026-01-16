import { User, CheckCircle, MapPin, Shield, Award, Medal, Zap, Star, Sword, Sparkles, Video, Flag, Hammer, HeartHandshake, Megaphone, Mountain, Gem, Anchor } from 'lucide-react'
import { RotabusinessLogo } from '@/components/branding/logo'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { Badge } from '@/components/ui/badge'

const iconMap: Record<string, any> = {
    'user-check': CheckCircle,
    'sword': Sword,
    'sparkles': Sparkles,
    'video': Video,
    'flag': Flag,
    'hammer': Hammer,
    'heart-handshake': HeartHandshake,
    'zap': Zap,
    'megaphone': Megaphone,
    'mountain': Mountain,
    'gem': Gem,
    'anchor': Anchor,
}

interface ProfileHeaderProps {
    profile: any
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    const rank = profile.rank || { name: 'Recruta', multiplier: 1 }
    const badges = profile.badges || []

    return (
        <div className="relative">
            {/* Cover/Background */}
            <div className="h-48 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-t-xl overflow-hidden relative">
                <div className="absolute inset-0 bg-[url('/images/pattern-dots.svg')] opacity-10" />
                <div className="absolute bottom-4 right-6 flex gap-2">
                    {badges.slice(0, 5).map((badge: any) => {
                        const Icon = iconMap[badge.icon_key] || Medal
                        return (
                            <div
                                key={badge.id}
                                title={`${badge.name}: ${badge.description}`}
                                className="w-10 h-10 rounded-full bg-secondary text-white border border-white/20 flex items-center justify-center hover:scale-110 transition-transform cursor-help group shadow-lg"
                            >
                                <Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                {/* Custom Tooltip (Pure CSS for performance) */}
                                <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-black/90 backdrop-blur-md text-white text-[10px] rounded border border-white/10 z-50 pointer-events-none">
                                    <p className="font-black uppercase text-secondary mb-1">{badge.name}</p>
                                    <p className="font-medium leading-tight opacity-90">{badge.description}</p>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-black/90" />
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Profile Info */}
            <div className="relative px-6 pb-6">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16">
                    <div className="relative">
                        <div className="p-1 rounded-full bg-gradient-to-br from-primary to-secondary shadow-2xl">
                            {profile.avatar_url ? (
                                <img
                                    src={profile.avatar_url}
                                    alt={profile.full_name}
                                    className="w-32 h-32 rounded-full border-4 border-background object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full border-4 border-background bg-gray-800 flex items-center justify-center text-gray-600">
                                    <User className="w-16 h-16" />
                                </div>
                            )}
                        </div>

                        {profile.verification_status === 'verified' && (
                            <div className="absolute top-0 right-0 bg-green-500 rounded-full p-1.5 border-4 border-background z-10">
                                <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                        )}

                        {rank && (
                            <div className="absolute -bottom-2 -right-2 z-20">
                                <RankInsignia rankId={rank.id} variant="icon-only" size="lg" className="shadow-2xl border-4 border-background" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 sm:mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl lg:text-4xl font-black text-white text-impact uppercase tracking-tight">
                                        {profile.full_name}
                                    </h1>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 mt-3">
                                    {profile.tops && (
                                        <div className="flex items-center gap-1 text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                            <span className="text-sm font-medium">{profile.tops.name}</span>
                                        </div>
                                    )}

                                    <Badge variant="outline" className="capitalize border-primary/20 bg-primary/5 text-primary-foreground font-bold">
                                        {profile.role}
                                    </Badge>

                                    {rank.multiplier > 1 && (
                                        <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 font-black text-[10px]">
                                            <Zap className="w-3 h-3 mr-1 fill-secondary" />
                                            MULT. {rank.multiplier.toFixed(1)}X
                                        </Badge>
                                    )}
                                </div>
                            </div>

                            {/* Stats Overlay */}
                            <div className="flex gap-4">
                                {profile.average_rating > 0 && (
                                    <div className="flex flex-col items-center bg-card/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
                                        <div className="flex items-center gap-1">
                                            <span className="text-2xl font-black text-yellow-500">{profile.average_rating.toFixed(1)}</span>
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-bold uppercase">{profile.total_ratings} Avaliações</span>
                                    </div>
                                )}
                                <div className="flex flex-col items-center bg-card/40 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/5">
                                    <span className="text-2xl font-black text-primary">{profile.total_reviews * 10 + 150}</span>
                                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Vigor</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
