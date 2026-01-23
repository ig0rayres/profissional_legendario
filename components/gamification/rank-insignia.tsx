'use client'

import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================
// FALLBACK REMOVIDO - ÍCONES VEM 100% DO BANCO
// ============================================
// O iconName deve sempre ser passado pelo componente pai
// Se não vier, usa Shield como fallback genérico

interface RankInsigniaProps {
    rankId: string
    rankName?: string // Novo prop para fallback por nome
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
    let IconComponent = LucideIcons.Shield; // Fallback genérico

    // Usar iconName do banco (fonte única de verdade)
    if (iconName) {
        const lucideKey = Object.keys(LucideIcons).find(key => key.toLowerCase() === iconName.toLowerCase());
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
        'icon-only': '',
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

    return (
        <div
            className={cn(
                "flex items-center justify-center",
                specificContainerClass,
                className
            )}
            style={{
                backgroundColor: RANK_GREEN_COLOR,
                width: containerSizes[size].width,
                height: containerSizes[size].height,
                minWidth: containerSizes[size].width,
                borderRadius: '50%'
            }}
        >
            <IconComponent className={cn(sizeMap[size])} strokeWidth={2.5} />
            {showLabel && <span className="ml-1 uppercase font-bold text-[10px] sm:text-xs">{rankName || rankId}</span>}
        </div>
    )
}
