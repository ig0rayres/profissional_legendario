'use client'

import {
    CheckCircle, Sword, Star, Camera, Target, Gem,
    Users, Zap, Megaphone, Shield, Award, Anchor,
    PartyPopper, ImagePlus, Trophy, UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Mapa de ícones de medalhas por ID
const medalIconMap: Record<string, any> = {
    'alistamento_concluido': CheckCircle,
    'primeiro_sangue': Sword,
    'batismo_excelencia': Star,
    'cinegrafista_campo': Camera,
    'missao_cumprida': Target,
    'inabalavel': Gem,
    'irmandade': UserPlus,
    'pronto_missao': Zap,
    'recrutador': Megaphone,
    'veterano_guerra': Shield,
    'sentinela_elite': Award,
    'sentinela_inabalavel': Anchor,
    // Medalhas da Confraria
    'anfitriao': PartyPopper,
    'presente': Users,
    'cronista': ImagePlus,
    'lider_confraria': Trophy,
}

interface MedalBadgeProps {
    medalId: string
    name?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    className?: string
    variant?: 'badge' | 'icon-only'
}

export function MedalBadge({ medalId, name, size = 'md', showLabel = false, className, variant = 'badge' }: MedalBadgeProps) {
    const Icon = medalIconMap[medalId] || Award

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

    // Usando cores secundárias da plataforma (secondary = laranja Rota Business)
    const medalStyle = 'bg-secondary text-white shadow-lg'

    if (variant === 'icon-only') {
        return (
            <div className={cn(
                "rounded-full flex items-center justify-center",
                medalStyle,
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
                medalStyle,
                className
            )}>
                <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
                {showLabel && name && <span>{name}</span>}
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className={cn(
                "rounded-full flex items-center justify-center",
                medalStyle,
                containerSizeMap[size]
            )}>
                <Icon className={sizeMap[size]} strokeWidth={2.5} />
            </div>
            {showLabel && name && (
                <span className="text-xs font-bold uppercase text-secondary">
                    {name}
                </span>
            )}
        </div>
    )
}
