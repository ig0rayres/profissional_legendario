import { useState, useEffect } from 'react'
import { getSpecificAvatarConfig, AvatarConfig } from '@/lib/avatar-config'

export interface AvatarSizes {
    frameSize: number
    badgeSize: number
    badgeBottom: number
    badgeRight: number
    borderWidth: number
}

/**
 * Hook para buscar configurações de avatar do banco
 * @param context 'dashboard' ou 'elo'
 * @param device 'desktop' ou 'mobile'
 */
export function useAvatarConfig(
    context: 'dashboard' | 'elo',
    device: 'desktop' | 'mobile'
): { sizes: AvatarSizes | null; loading: boolean; reload: () => void } {
    const [sizes, setSizes] = useState<AvatarSizes | null>(null)
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)

    useEffect(() => {
        async function loadConfig() {
            try {
                const config = await getSpecificAvatarConfig(context, device)

                if (config) {
                    const newSizes = {
                        frameSize: config.frame_size,
                        badgeSize: config.badge_size,
                        badgeBottom: config.badge_bottom,
                        badgeRight: config.badge_right,
                        borderWidth: config.border_width,
                    }
                    setSizes(newSizes)
                }
            } catch (error) {
                console.error('[useAvatarConfig] Erro ao carregar config:', error)
            } finally {
                setLoading(false)
            }
        }

        loadConfig()
    }, [context, device, refreshKey]) // refreshKey força recarregar

    // Função para forçar recarga
    const reload = () => {
        setLoading(true)
        setRefreshKey(prev => prev + 1)
    }

    return { sizes, loading, reload }
}
