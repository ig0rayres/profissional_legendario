// ============================================
// API - CONFRATERNITY
// Sistema de Confraternizações
// ============================================

import { createClient } from '@/lib/supabase/client'
import { awardPoints, awardBadge } from '@/lib/api/gamification'

// Types
export interface ConfraternityInvite {
    id: string
    sender_id: string
    receiver_id: string
    status: 'pending' | 'accepted' | 'rejected' | 'completed'
    proposed_date: string | null
    location: string | null
    message: string | null
    created_at: string
    accepted_at: string | null
    completed_at: string | null
}

export interface Confraternity {
    id: string
    invite_id: string | null
    member1_id: string
    member2_id: string
    date_occurred: string
    location: string | null
    description: string | null
    photos: string[]
    testimonial_member1: string | null
    testimonial_member2: string | null
    visibility: 'private' | 'connections' | 'public'
    created_at: string
    updated_at: string
}

export interface ConfraternityLimit {
    user_id: string
    month_year: string
    invites_sent: number
    last_reset_at: string
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Verificar se usuário pode enviar convite
 */
export async function canSendInvite(userId: string): Promise<{
    canSend: boolean
    remainingInvites: number
    maxInvites: number
    planType: string
}> {
    try {
        const supabase = createClient()

        // Chamar função SQL
        const { data, error } = await supabase.rpc('check_confraternity_limit', {
            p_user_id: userId
        })

        if (error) {
            console.error('Error checking limit:', error)
            return {
                canSend: false,
                remainingInvites: 0,
                maxInvites: 0,
                planType: 'recruta'
            }
        }

        // Buscar detalhes do limite
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM

        const { data: limitData } = await supabase
            .from('confraternity_limits')
            .select('*, profiles!inner(subscription_tier)')
            .eq('user_id', userId)
            .single()

        const planType = limitData?.profiles?.subscription_tier || 'recruta'
        const maxInvites = planType === 'elite' ? 10 : planType === 'veterano' ? 2 : 0
        const invitesSent = limitData?.invites_sent || 0

        return {
            canSend: data as boolean,
            remainingInvites: Math.max(0, maxInvites - invitesSent),
            maxInvites,
            planType
        }
    } catch (error) {
        console.error('Exception checking invite limit:', error)
        return {
            canSend: false,
            remainingInvites: 0,
            maxInvites: 0,
            planType: 'recruta'
        }
    }
}

/**
 * Enviar convite de confraternização
 */
export async function sendConfraternityInvite(
    senderId: string,
    receiverId: string,
    proposedDate: string | null,
    location: string | null,
    message: string | null
): Promise<{ success: boolean; invite?: ConfraternityInvite; error?: string }> {
    try {
        const supabase = createClient()

        // 1. Verificar limite
        const { canSend } = await canSendInvite(senderId)

        if (!canSend) {
            return {
                success: false,
                error: 'Limite de convites atingido para este mês'
            }
        }

        // 2. Criar convite
        const { data: invite, error: inviteError } = await supabase
            .from('confraternity_invites')
            .insert({
                sender_id: senderId,
                receiver_id: receiverId,
                proposed_date: proposedDate,
                location,
                message,
                status: 'pending'
            })
            .select()
            .single()

        if (inviteError) {
            console.error('Error creating invite:', inviteError)
            return { success: false, error: inviteError.message }
        }

        // 3. Incrementar contador
        await supabase.rpc('increment_confraternity_count', {
            p_user_id: senderId
        })

        // 4. Gamificação: +10 XP por enviar convite
        try {
            await awardPoints(
                senderId,
                10,
                'confraternity_invite_sent',
                'Enviou convite de confraternização'
            )
        } catch (gamifError) {
            console.error('Gamification error:', gamifError)
        }

        return {
            success: true,
            invite: invite as ConfraternityInvite
        }
    } catch (error: any) {
        console.error('Exception sending invite:', error)
        return {
            success: false,
            error: error.message
        }
    }
}

/**
 * Aceitar convite de confraternização
 */
export async function acceptConfraternityInvite(
    inviteId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient()

        // 1. Atualizar status do convite
        const { error: updateError } = await supabase
            .from('confraternity_invites')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString()
            })
            .eq('id', inviteId)
            .eq('receiver_id', userId) // Garantir que é o receptor

        if (updateError) {
            console.error('Error accepting invite:', updateError)
            return { success: false, error: updateError.message }
        }

        // 2. Gamificação: +10 XP por aceitar
        try {
            await awardPoints(
                userId,
                10,
                'confraternity_invite_accepted',
                'Aceitou convite de confraternização'
            )
        } catch (gamifError) {
            console.error('Gamification error:', gamifError)
        }

        return { success: true }
    } catch (error: any) {
        console.error('Exception accepting invite:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Recusar convite
 */
export async function rejectConfraternityInvite(
    inviteId: string,
    userId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient()

        const { error } = await supabase
            .from('confraternity_invites')
            .update({ status: 'rejected' })
            .eq('id', inviteId)
            .eq('receiver_id', userId)

        if (error) {
            console.error('Error rejecting invite:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Exception rejecting invite:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Marcar confraternização como realizada
 */
export async function completeConfraternity(
    inviteId: string,
    userId: string,
    data: {
        dateOccurred: string
        location: string
        description?: string
        photos?: string[]
        testimonial: string
        visibility: 'private' | 'connections' | 'public'
    }
): Promise<{ success: boolean; confraternity?: Confraternity; error?: string }> {
    try {
        const supabase = createClient()

        // 1. Buscar convite para pegar IDs dos membros
        const { data: invite, error: inviteError } = await supabase
            .from('confraternity_invites')
            .select('*')
            .eq('id', inviteId)
            .single()

        if (inviteError || !invite) {
            return { success: false, error: 'Convite não encontrado' }
        }

        // Verificar se usuário é parte do convite
        if (invite.sender_id !== userId && invite.receiver_id !== userId) {
            return { success: false, error: 'Acesso negado' }
        }

        // 2. Verificar se já existe confraternização
        const { data: existing } = await supabase
            .from('confraternities')
            .select('id')
            .eq('invite_id', inviteId)
            .single()

        let confraternityId: string

        if (existing) {
            // 3a. Atualizar existente (segundo membro adicionando depoimento)
            const testimonialField = userId === invite.sender_id
                ? 'testimonial_member1'
                : 'testimonial_member2'

            const { data: updated, error: updateError } = await supabase
                .from('confraternities')
                .update({
                    [testimonialField]: data.testimonial,
                    description: data.description || undefined,
                    photos: data.photos || []
                })
                .eq('id', existing.id)
                .select()
                .single()

            if (updateError) {
                return { success: false, error: updateError.message }
            }

            confraternityId = existing.id
        } else {
            // 3b. Criar nova confraternização (primeiro membro)
            const testimonialField = userId === invite.sender_id
                ? 'testimonial_member1'
                : 'testimonial_member2'

            const { data: newConf, error: createError } = await supabase
                .from('confraternities')
                .insert({
                    invite_id: inviteId,
                    member1_id: invite.sender_id,
                    member2_id: invite.receiver_id,
                    date_occurred: data.dateOccurred,
                    location: data.location,
                    description: data.description,
                    photos: data.photos || [],
                    [testimonialField]: data.testimonial,
                    visibility: data.visibility
                })
                .select()
                .single()

            if (createError) {
                return { success: false, error: createError.message }
            }

            confraternityId = newConf.id
        }

        // 4. Marcar convite como completo
        await supabase
            .from('confraternity_invites')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', inviteId)

        // 5. Gamificação
        try {
            // +50 XP por realizar
            await awardPoints(
                userId,
                50,
                'confraternity_completed',
                'Confraternização realizada'
            )

            // +20 XP por foto (se enviou)
            if (data.photos && data.photos.length > 0) {
                await awardPoints(
                    userId,
                    20 * data.photos.length,
                    'confraternity_photos',
                    `Adicionou ${data.photos.length} fotos`
                )
            }

            // +15 XP por depoimento
            if (data.testimonial) {
                await awardPoints(
                    userId,
                    15,
                    'confraternity_testimonial',
                    'Adicionou depoimento'
                )
            }

            // Verificar badges
            const { data: userConfs } = await supabase
                .from('confraternities')
                .select('id')
                .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)

            const totalConfs = userConfs?.length || 0

            if (totalConfs === 1) {
                // Primeira confraternização
                await awardBadge(userId, 'primeira_confraria')
            } else if (totalConfs === 5) {
                // 5 confraternizações
                await awardBadge(userId, 'networker_ativo')
            } else if (totalConfs === 20) {
                // 20 confraternizações
                await awardBadge(userId, 'mestre_conexoes')
            }
        } catch (gamifError) {
            console.error('Gamification error:', gamifError)
        }

        // 6. Buscar confraternização completa
        const { data: confraternity } = await supabase
            .from('confraternities')
            .select('*')
            .eq('id', confraternityId)
            .single()

        return {
            success: true,
            confraternity: confraternity as Confraternity
        }
    } catch (error: any) {
        console.error('Exception completing confraternity:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Listar convites recebidos pelo usuário
 */
export async function getReceivedInvites(
    userId: string
): Promise<ConfraternityInvite[]> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('confraternity_invites')
            .select(`
                *,
                sender:profiles!sender_id(id, full_name, avatar_url)
            `)
            .eq('receiver_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching invites:', error)
            return []
        }

        return data as any[]
    } catch (error) {
        console.error('Exception fetching invites:', error)
        return []
    }
}

/**
 * Listar convites enviados pelo usuário
 */
export async function getSentInvites(
    userId: string
): Promise<ConfraternityInvite[]> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('confraternity_invites')
            .select(`
                *,
                receiver:profiles!receiver_id(id, full_name, avatar_url)
            `)
            .eq('sender_id', userId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching sent invites:', error)
            return []
        }

        return data as any[]
    } catch (error) {
        console.error('Exception fetching sent invites:', error)
        return []
    }
}

/**
 * Listar confraternizações do usuário
 */
export async function getUserConfraternities(
    userId: string
): Promise<Confraternity[]> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('confraternities')
            .select(`
                *,
                member1:profiles!member1_id(id, full_name, avatar_url),
                member2:profiles!member2_id(id, full_name, avatar_url)
            `)
            .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)
            .order('date_occurred', { ascending: false })

        if (error) {
            console.error('Error fetching confraternities:', error)
            return []
        }

        return data as any[]
    } catch (error) {
        console.error('Exception fetching confraternities:', error)
        return []
    }
}

/**
 * Listar confraternizações públicas (galeria global)
 */
export async function getPublicConfraternities(
    limit: number = 20
): Promise<Confraternity[]> {
    try {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('confraternities')
            .select(`
                *,
                member1:profiles!member1_id(id, full_name, avatar_url, subscription_tier),
                member2:profiles!member2_id(id, full_name, avatar_url, subscription_tier)
            `)
            .eq('visibility', 'public')
            .order('date_occurred', { ascending: false })
            .limit(limit)

        if (error) {
            console.error('Error fetching public confraternities:', error)
            return []
        }

        return data as any[]
    } catch (error) {
        console.error('Exception fetching public confraternities:', error)
        return []
    }
}
