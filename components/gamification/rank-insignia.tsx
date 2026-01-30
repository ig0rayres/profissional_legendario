'use client'

import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRankIconName } from '@/lib/utils/ranks'

// ============================================
// FONTE ÚNICA DE VERDADE: lib/utils/ranks.ts
// ============================================
// O iconName deve vir do banco, mas usamos getRankIconName como fallback

interface RankInsigniaProps {
    rankId: string
    rankName?: string
    iconName?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    showLabel?: boolean
    className?: string
    variant?: 'badge' | 'icon-only' | 'avatar'
}

export function RankInsignia({
    rankId,
    rankName,
    iconName,
    size = 'md',
    showLabel = false,
    className,
    variant = 'badge'
}: RankInsigniaProps) {
    // Fallback usando utilitário centralizado se iconName não fornecido
    const resolvedIconName = iconName || getRankIconName(rankId)

    let IconComponent = LucideIcons.Shield; // Fallback final

    // Usar iconName do banco ou fallback centralizado
    if (resolvedIconName) {
        const lucideKey = Object.keys(LucideIcons).find(key => key.toLowerCase() === resolvedIconName.toLowerCase());
        if (lucideKey) {
            IconComponent = LucideIcons[lucideKey as keyof typeof LucideIcons] as any;
        }
    }

    const sizeMap = {
        xs: 'w-2.5 h-2.5',
        sm: 'w-3 h-3',
        md: 'w-5 h-5',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    }

    const containerClasses = {
        'avatar': 'text-white rounded-full p-1.5 shadow-md border-2 border-white',
        'icon-only': 'rounded-full', // Apenas circular, sem padding ou border extras
        'badge': 'text-white px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 shadow-sm',
    }

    // Cor verde fixa para patentes - NUNCA mudar
    const RANK_GREEN_COLOR = '#2E4A3E'

    const specificContainerClass = containerClasses[variant] || '';

    // Tamanhos do container circular
    const containerSizes = {
        xs: { width: 20, height: 20 },
        sm: { width: 28, height: 28 },
        md: { width: 36, height: 36 },
        lg: { width: 48, height: 48 },
        xl: { width: 64, height: 64 },
    }

    // Verificar se className contém tamanho customizado
    const hasCustomSize = className && (className.includes('w-') || className.includes('h-'))

    return (
        <div
            className={cn(
                "flex items-center justify-center",
                specificContainerClass,
                className
            )}
            style={hasCustomSize ? {
                backgroundColor: RANK_GREEN_COLOR,
            } : {
                backgroundColor: RANK_GREEN_COLOR,
                width: containerSizes[size].width,
                height: containerSizes[size].height,
                minWidth: containerSizes[size].width,
            }}
        >
            <IconComponent className={cn(hasCustomSize ? "w-1/2 h-1/2" : sizeMap[size], "text-white")} strokeWidth={2.5} />
            {showLabel && <span className="ml-1 uppercase font-bold text-[10px] sm:text-xs">{rankName || rankId}</span>}
        </div>
    )
}
