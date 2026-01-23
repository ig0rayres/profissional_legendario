/**
 * Componente para renderizar ícone Lucide dinamicamente pelo nome
 * Usado no painel admin da Rota do Valente
 */

'use client'

import * as LucideIcons from 'lucide-react'
import { cn } from '@/lib/utils'

interface DynamicIconProps {
    name: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    className?: string
}

const SIZES = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
}

export function DynamicIcon({ name, size = 'md', className }: DynamicIconProps) {
    // Tentar obter o ícone do Lucide
    const Icon = (LucideIcons as any)[name]

    if (!Icon) {
        // Fallback se não encontrar
        const FallbackIcon = LucideIcons.Award
        return <FallbackIcon className={cn(SIZES[size], className)} strokeWidth={2} />
    }

    return <Icon className={cn(SIZES[size], className)} strokeWidth={2} />
}

// Lista de ícones disponíveis para seleção no admin
export const AVAILABLE_ICONS = [
    'Award', 'Trophy', 'Medal', 'Star', 'Crown', 'Gem', 'Shield',
    'Sword', 'Target', 'Flame', 'Zap', 'Rocket', 'Briefcase',
    'CheckCircle', 'Check', 'Gift', 'Heart', 'Smile',
    'Users', 'UserPlus', 'UserCheck', 'Globe', 'Home',
    'Camera', 'Video', 'Image', 'Mic', 'Megaphone', 'MessageCircle', 'MessageSquare',
    'ThumbsUp', 'Eye', 'PenLine', 'Smartphone',
    'ShoppingCart', 'Store', 'Building', 'DollarSign',
    'PartyPopper', 'Anchor', 'Book', 'BookOpen',
]
