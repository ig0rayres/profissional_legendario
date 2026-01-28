/**
 * UTILITÁRIO DE PATENTES - FONTE ÚNICA DE VERDADE
 * 
 * Use este arquivo para obter ícones e informações de patentes
 * em TODOS os componentes do projeto.
 * 
 * PATENTES DO SISTEMA (em ordem):
 * 1. recruta    - Iniciante
 * 2. veterano   - Intermediário
 * 3. elite      - Avançado
 * 4. mestre     - Expert
 * 5. lenda      - Top
 */

import {
    Shield,
    ShieldCheck,
    Target,
    Medal,
    Flame,
    Crown,
    LucideIcon
} from 'lucide-react'

// Mapeamento de patentes para ícones Lucide
// CENTRALIZADO - Única fonte de verdade
export const RANK_ICONS: Record<string, LucideIcon> = {
    // Patentes reais do banco
    'recruta': Shield,
    'veterano': ShieldCheck,
    'elite': Target,
    'mestre': Medal,
    'lenda': Crown,

    // Aliases/Legacy (manter compatibilidade)
    'novato': Shield,
    'especialista': Target,
    'guardiao': ShieldCheck,
    'comandante': Medal,
    'general': Flame,
}

// Mapeamento de patentes para cores
export const RANK_COLORS: Record<string, string> = {
    // Patentes reais do banco
    'recruta': '#9CA3AF',      // Cinza
    'veterano': '#22C55E',     // Verde
    'elite': '#3B82F6',        // Azul
    'mestre': '#F97316',       // Laranja
    'lenda': '#EAB308',        // Dourado

    // Aliases/Legacy
    'novato': '#9CA3AF',
    'especialista': '#22C55E',
    'guardiao': '#3B82F6',
    'comandante': '#F97316',
    'general': '#EF4444',
}

// Nomes formatados das patentes
export const RANK_NAMES: Record<string, string> = {
    // Patentes reais do banco
    'recruta': 'Recruta',
    'veterano': 'Veterano',
    'elite': 'Elite',
    'mestre': 'Mestre',
    'lenda': 'Lenda',

    // Aliases/Legacy
    'novato': 'Novato',
    'especialista': 'Especialista',
    'guardiao': 'Guardião',
    'comandante': 'Comandante',
    'general': 'General',
}

// Mapeamento de nomes de ícones (para componentes que usam string)
const RANK_ICON_NAMES: Record<string, string> = {
    // Patentes reais do banco
    'recruta': 'Shield',
    'veterano': 'ShieldCheck',
    'elite': 'Target',
    'mestre': 'Medal',
    'lenda': 'Crown',

    // Aliases/Legacy
    'novato': 'Shield',
    'especialista': 'Target',
    'guardiao': 'ShieldCheck',
    'comandante': 'Medal',
    'general': 'Flame',
}

/**
 * Retorna o ícone Lucide correspondente à patente
 * @param rankId - ID da patente
 * @returns Componente do ícone Lucide
 */
export function getRankIcon(rankId: string | null | undefined): LucideIcon {
    if (!rankId) return Shield
    return RANK_ICONS[rankId.toLowerCase()] || Shield
}

/**
 * Retorna a cor correspondente à patente
 * @param rankId - ID da patente
 * @returns Cor em hexadecimal
 */
export function getRankColor(rankId: string | null | undefined): string {
    if (!rankId) return RANK_COLORS['recruta']
    return RANK_COLORS[rankId.toLowerCase()] || RANK_COLORS['recruta']
}

/**
 * Retorna o nome formatado da patente
 * @param rankId - ID da patente
 * @returns Nome legível
 */
export function getRankName(rankId: string | null | undefined): string {
    if (!rankId) return RANK_NAMES['recruta']
    return RANK_NAMES[rankId.toLowerCase()] || rankId
}

/**
 * Retorna o nome do ícone como string (para componentes que precisam do nome)
 * @param rankId - ID da patente
 * @returns Nome do ícone (Shield, Target, etc)
 */
export function getRankIconName(rankId: string | null | undefined): string {
    if (!rankId) return 'Shield'
    return RANK_ICON_NAMES[rankId.toLowerCase()] || 'Shield'
}

