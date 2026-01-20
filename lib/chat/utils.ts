'use client'

import { createClient } from '@/lib/supabase/client'

export async function startConversation(currentUserId: string, otherUserId: string): Promise<string | null> {
    const supabase = createClient()

    try {
        // Usar a função RPC para criar ou buscar conversa
        const { data, error } = await supabase
            .rpc('get_or_create_conversation', {
                user_1: currentUserId,
                user_2: otherUserId
            })

        if (error) {
            console.error('Erro ao iniciar conversa:', error)
            return null
        }

        return data
    } catch (err) {
        console.error('Erro ao iniciar conversa:', err)
        return null
    }
}

// Event para notificar o widget de chat para abrir uma conversa específica
export function openChatWithUser(userId: string) {
    const event = new CustomEvent('openChat', { detail: { userId } })
    window.dispatchEvent(event)
}
