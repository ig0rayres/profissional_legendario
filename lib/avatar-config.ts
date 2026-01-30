import { createClient } from '@/lib/supabase/client'

export interface AvatarConfig {
    id: string
    context: 'dashboard' | 'elo'
    device: 'desktop' | 'mobile'
    frame_size: number
    badge_size: number
    badge_bottom: number
    badge_right: number
    border_width: number
    updated_at: string
    updated_by: string | null
}

/**
 * Busca as configurações de avatar do banco
 */
export async function getAvatarConfig(): Promise<AvatarConfig[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('avatar_config')
        .select('*')
        .order('context', { ascending: true })
        .order('device', { ascending: true })

    if (error) {
        console.error('Erro ao buscar configurações de avatar:', error)
        return []
    }

    return data || []
}

/**
 * Atualiza uma configuração específica de avatar
 */
export async function updateAvatarConfig(
    context: 'dashboard' | 'elo',
    device: 'desktop' | 'mobile',
    config: {
        frame_size: number
        badge_size: number
        badge_bottom: number
        badge_right: number
        border_width: number
    }
): Promise<boolean> {
    console.log('[updateAvatarConfig] Usando API route:', { context, device, config })

    try {
        const response = await fetch('/api/avatar-config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ context, device, config }),
        })

        const result = await response.json()
        console.log('[updateAvatarConfig] Resposta da API:', result)

        return result.success
    } catch (error) {
        console.error('[updateAvatarConfig] Erro ao chamar API:', error)
        return false
    }
}

/**
 * Busca configuração específica
 */
export async function getSpecificAvatarConfig(
    context: 'dashboard' | 'elo',
    device: 'desktop' | 'mobile'
): Promise<AvatarConfig | null> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('avatar_config')
        .select('*')
        .eq('context', context)
        .eq('device', device)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Erro ao buscar configuração específica:', error)
        return null
    }

    return data
}
