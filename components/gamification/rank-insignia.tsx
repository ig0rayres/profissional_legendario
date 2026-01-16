'use client'

import { Shield, Target, Crown, Zap, Sword, Medal, Flame, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mapa de ícones por ID de patente
const rankIconMap: Record<string, any> = {
    'novato': Shield,
    'especialista': Target,
    'guardiao': Sword,
    'comandante': Medal,
    'general': Crown,
    'lenda': Flame,
}

interface RankInsigniaProps {
    rankId: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    className?: string
    variant?: 'badge' | 'icon-only' | 'avatar'
}

export function RankInsignia({ rankId, size = 'md', showLabel = false, className, variant = 'badge' }: RankInsigniaProps) {
    const Icon = rankIconMap[rankId] || Shield

    const sizeMap = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-10 h-10',
        xl: 'w-16 h-16',
    }

    const containerSizeMap = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
    }

    // Estilo unificado: Verde sólido + Ícone branco
    const rankStyle = 'bg-green-600 text-white shadow-lg'

    if (variant === 'icon-only' || variant === 'avatar') {
        return (
            <div className={cn(
                "rounded-full flex items-center justify-center",
                rankStyle,
                containerSizeMap[size],
                className
            )}>
                <Icon className={sizeMap[size]} strokeWidth={2.5} />
            </div>
        )
    }

    if (variant === 'badge') {
        return (
            <div className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                rankStyle,
                className
            )}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {showLabel && <span>{rankId}</span>}
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className={cn(
                "rounded-full flex items-center justify-center",
                rankStyle,
                containerSizeMap[size]
            )}>
                <Icon className={sizeMap[size]} strokeWidth={2.5} />
            </div>
            {showLabel && (
                <span className="text-xs font-bold uppercase text-green-600">
                    {rankId}
                </span>
            )}
        </div>
    )
}
