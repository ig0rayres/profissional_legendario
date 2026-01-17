'use server'

import { createClient } from '@/lib/supabase/server'

/**
 * Dar medalha para um usuário (se ainda não tiver)
 * Chama a function award_medal do Supabase que:
 * - Aplica multiplicador do plano
 * - Adiciona pontos
 * - Atualiza patente
 * - Registra medalha
 */
export async function awardMedal(userId: string, medalId: string): Promise<boolean> {
    try {
        const supabase = await createClient()

        // Verificar se já tem a medalha
        const { data: existing } = await supabase
            .from('user_medals')
            .select('id')
            .eq('user_id', userId)
            .eq('medal_id', medalId)
            .maybeSingle()

        if (existing) {
            console.log(`Medalha ${medalId} já conquistada por ${userId}`)
            return false // Já tem a medalha
        }

        // Dar a medalha (function do Supabase faz tudo)
        const { error } = await supabase.rpc('award_medal', {
            p_user_id: userId,
            p_medal_id: medalId
        })

        if (error) {
            console.error('Erro ao dar medalha:', error)
            return false
        }

        console.log(`✅ Medalha ${medalId} concedida para ${userId}`)
        return true
    } catch (error) {
        console.error('Erro ao processar medalha:', error)
        return false
    }
}

/**
 * Verificar completude do perfil
 * Retorna true se perfil está completo (avatar + bio)
 */
export async function checkProfileCompletion(userId: string): Promise<boolean> {
    try {
        const supabase = await createClient()

        const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, bio')
            .eq('id', userId)
            .single()

        if (!profile) return false

        const isComplete = !!(profile.avatar_url && profile.bio)

        if (isComplete) {
            await awardMedal(userId, 'alistamento_concluido')
        }

        return isComplete
    } catch (error) {
        console.error('Erro ao verificar perfil:', error)
        return false
    }
}

/**
 * Verificar perfil de excelência
 * Retorna true se TODOS os campos estão preenchidos
 */
export async function checkProfileExcellence(userId: string): Promise<boolean> {
    try {
        const supabase = await createClient()

        const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, bio, phone, pista, rota_number')
            .eq('id', userId)
            .single()

        if (!profile) return false

        const isExcellent = !!(
            profile.avatar_url &&
            profile.bio &&
            profile.phone &&
            profile.pista &&
            profile.rota_number
        )

        if (isExcellent) {
            await awardMedal(userId, 'batismo_excelencia')
        }

        return isExcellent
    } catch (error) {
        console.error('Erro ao verificar excelência:', error)
        return false
    }
}
