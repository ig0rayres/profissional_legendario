'use client'

import { cn } from '@/lib/utils'

interface MedalBadgeProps {
    icon: string // emoji
    name?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    className?: string
    variant?: 'badge' | 'icon-only'
}

export function MedalBadge({ icon, name, size = 'md', showLabel = false, className, variant = 'badge' }: MedalBadgeProps) {
    const sizeMap = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-2xl',
        xl: 'text-4xl',
    }

    const containerSizeMap = {
        sm: 'w-6 h-6',
        md: 'w-8 h-8',
        lg: 'w-14 h-14',
        xl: 'w-20 h-20',
    }

    // Estilo unificado: Laranja sólido + Ícone (emoji) branco
    const medalStyle = 'bg-orange-500 text-white shadow-lg'

    if (variant === 'icon-only') {
        return (
            <div className={cn(
                "rounded-full flex items-center justify-center",
                medalStyle,
                containerSizeMap[size],
                className
            )}>
                <span className={sizeMap[size]}>{icon}</span>
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
                <span className="text-sm">{icon}</span>
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
                <span className={sizeMap[size]}>{icon}</span>
            </div>
            {showLabel && name && (
                <span className="text-xs font-bold uppercase text-orange-500">
                    {name}
                </span>
            )}
        </div>
    )
}
