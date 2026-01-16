'use client'

import { Shield, Target, Crown, Zap, Sword, Medal, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'

const rankIconMap: Record<string, any> = {
    'recruta': Shield,
    'especialista': Sword,
    'veterano': Medal,
    'comandante': Target,
    'general': Crown,
    'lenda': Flame,
}

const rankColorMap: Record<string, string> = {
    'recruta': 'text-white bg-primary border-primary/20 shadow-sm',
    'especialista': 'text-white bg-primary border-primary/20 shadow-sm',
    'veterano': 'text-white bg-primary border-primary/30 shadow-md',
    'comandante': 'text-white bg-primary border-primary/40 shadow-md',
    'general': 'text-white bg-primary border-primary/50 shadow-lg',
    'lenda': 'text-white bg-primary border-primary/60 shadow-2xl glow-primary',
}
// Note: Standardizing all ranks to "Verde Rota" (primary brand color) with white icons.

interface RankInsigniaProps {
    rankId: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    className?: boolean
    variant?: 'badge' | 'icon-only' | 'full'
}

export function RankInsignia({ rankId, size = 'md', showLabel = false, className, variant = 'badge' }: any) {
    const Icon = rankIconMap[rankId] || Shield
    const colorClass = rankColorMap[rankId] || rankColorMap.recruta

    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
        xl: 'w-16 h-16',
    }

    const containerSizeMap = {
        sm: 'p-1',
        md: 'p-1.5',
        lg: 'p-3',
        xl: 'p-5',
    }

    if (variant === 'icon-only') {
        return (
            <div className={cn("rounded-full flex items-center justify-center", colorClass, containerSizeMap[size as keyof typeof containerSizeMap], className)}>
                <Icon className={sizeMap[size as keyof typeof sizeMap]} />
            </div>
        )
    }

    if (variant === 'badge') {
        return (
            <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider", colorClass, className)}>
                <Icon className="w-3 h-3" />
                {showLabel ? rankId : null}
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className={cn("rounded-full flex items-center justify-center shadow-2xl", colorClass, containerSizeMap[size as keyof typeof containerSizeMap])}>
                <Icon className={sizeMap[size as keyof typeof sizeMap]} />
            </div>
            {showLabel && (
                <span className={cn("font-black uppercase tracking-widest text-impact", colorClass.split(' ')[0])}>
                    {rankId}
                </span>
            )}
        </div>
    )
}
