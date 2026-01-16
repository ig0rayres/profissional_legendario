'use client'

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
    Sword, Sparkles, Video, Flag,
    Hammer, HeartHandshake, Zap, Megaphone, Mountain, Gem, Lock,
    Award, UserCheck, Anchor
} from 'lucide-react'

const iconMap: Record<string, any> = {
    'user-check': UserCheck,
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
    'lock': Lock,
    'anchor': Anchor
}

interface Badge {
    id: string
    name: string
    description: string
    xp_reward: number
    icon_key: string
    benefit_description?: string
}

interface BadgeCardProps {
    badge: Badge
    isEarned: boolean
    earnedAt?: string
    className?: string
}

export function BadgeCard({ badge, isEarned, earnedAt, className }: BadgeCardProps) {
    const Icon = iconMap[badge.icon_key] || Award

    return (
        <Card className={cn(
            "relative transition-all duration-300 group overflow-hidden border-primary/10",
            isEarned
                ? "bg-card hover:border-primary/40 hover:glow-orange cursor-pointer"
                : "bg-muted/30 grayscale opacity-80",
            className
        )}>
            {/* Locked Overlay Icon */}
            {!isEarned && (
                <div className="absolute top-2 right-2">
                    <Lock className="w-4 h-4 text-muted-foreground/50" />
                </div>
            )}

            <CardContent className="p-4 flex flex-col items-center text-center">
                <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110",
                    isEarned ? "bg-secondary text-white shadow-lg shadow-secondary/20" : "bg-muted text-muted-foreground"
                )}>
                    <Icon className="w-8 h-8" />
                </div>

                <h4 className="text-sm font-bold text-impact mb-1 line-clamp-1">
                    {badge.name}
                </h4>

                <p className="text-xs text-muted-foreground mb-3 min-h-[2rem] line-clamp-2">
                    {badge.description}
                </p>

                {isEarned ? (
                    <div className="space-y-1">
                        <span className="text-[10px] font-bold text-secondary uppercase bg-secondary/10 px-2 py-0.5 rounded-full">
                            Conquistado
                        </span>
                        {earnedAt && (
                            <p className="text-[10px] text-muted-foreground mt-1">
                                {new Date(earnedAt).toLocaleDateString()}
                            </p>
                        )}
                        {badge.benefit_description && (
                            <div className="mt-2 p-1 border border-primary/10 rounded bg-primary/5">
                                <p className="text-[9px] font-medium text-primary leading-tight">
                                    BÔNUS: {badge.benefit_description}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase bg-muted px-2 py-0.5 rounded-full">
                        +{badge.xp_reward} Vigor
                    </span>
                )}
            </CardContent>
        </Card>
    )
}
