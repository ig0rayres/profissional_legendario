// ============================================
// API - CONFRATERNITY
// Sistema de Confraternizações
// ============================================

import { createClient } from '@/lib/supabase/client'
import { awardPoints, awardBadge, awardAchievement } from '@/lib/api/gamification'

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

        // Buscar plano do usuário da tabela subscriptions
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('plan_id')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single()

        const planType = subscription?.plan_id || 'recruta'

        // Recruta: 0, Veterano: 4, Elite: 10
        const maxInvites = planType === 'elite' ? 10 : planType === 'veterano' ? 4 : 0

        // Recruta não pode enviar
        if (maxInvites === 0) {
            return {
                canSend: false,
                remainingInvites: 0,
                maxInvites: 0,
                planType
            }
        }

        // Contar convites ACEITOS este mês (não enviados)
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const { count } = await supabase
            .from('confraternity_invites')
            .select('*', { count: 'exact', head: true })
            .eq('sender_id', userId)
            .eq('status', 'accepted') // Apenas aceitos contam
            .gte('accepted_at', startOfMonth.toISOString())

        const invitesAccepted = count || 0
        const canSend = invitesAccepted < maxInvites

        return {
            canSend,
            remainingInvites: Math.max(0, maxInvites - invitesAccepted),
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

        console.log('[Confraternity] Sending invite from', senderId, 'to', receiverId)

        // 1. Verificar limite
        const { canSend } = await canSendInvite(senderId)

        if (!canSend) {
            return {
                success: false,
                error: 'Limite de convites atingido para este mês'
            }
        }

        // 2. Buscar nome do remetente
        const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', senderId)
            .single()

        const senderName = senderProfile?.full_name || 'Usuário'

        // 3. Criar convite
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
            console.error('[Confraternity] Error creating invite:', inviteError)
            return { success: false, error: inviteError.message }
        }

        console.log('[Confraternity] Invite created:', invite.id)

        // 4. Criar NOTIFICAÇÃO para o receptor
        try {
            const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                    user_id: receiverId,
                    type: 'confraternity_invite',
                    title: '⚔️ Convite de Confraria',
                    body: `${senderName} deseja marcar uma confraria com você!`,
                    priority: 'high',
                    action_url: `/elo-da-rota/confraria`,
                    metadata: {
                        invite_id: invite.id,
                        from_user_id: senderId,
                        from_user_name: senderName,
                        proposed_date: proposedDate,
                        location: location
                    }
                })

            if (notifError) {
                console.error('[Confraternity] Notification error:', notifError)
            } else {
                console.log('[Confraternity] Notification sent to receiver')
            }
        } catch (notifErr) {
            console.error('[Confraternity] Exception creating notification:', notifErr)
        }

        // 5. Gamificação: +10 Vigor (XP) por enviar convite
        try {
            console.log('[Confraternity] Awarding points to sender...')
            const result = await awardPoints(
                senderId,
                10,
                'confraternity_invite_sent',
                'Enviou convite de confraternização'
            )
            console.log('[Confraternity] Points awarded result:', result)
        } catch (gamifError) {
            console.error('[Confraternity] Gamification error:', gamifError)
        }

        return {
            success: true,
            invite: invite as ConfraternityInvite
        }
    } catch (error: any) {
        console.error('[Confraternity] Exception sending invite:', error)
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
        console.log('[Confraternity] Convite aceito! Iniciando gamificação para userId:', userId)
        try {
            console.log('[Confraternity] Chamando awardPoints...')
            const pointsResult = await awardPoints(
                userId,
                10,
                'confraternity_invite_accepted',
                'Aceitou convite de confraternização'
            )
            console.log('[Confraternity] awardPoints resultado:', pointsResult)

            // 3. Verificar medalha "Presente" - primeiro convite aceito
            const { data: acceptedInvites } = await supabase
                .from('confraternity_invites')
                .select('id', { count: 'exact' })
                .eq('receiver_id', userId)
                .eq('status', 'accepted')

            console.log('[Confraternity] Total convites aceitos:', acceptedInvites?.length)

            if (acceptedInvites && acceptedInvites.length === 1) {
                // É o primeiro convite aceito! Conceder medalha
                console.log('[Confraternity] Concedendo medalha Presente...')
                await awardBadge(userId, 'presente')
                console.log('✅ Medalha "Presente" concedida ao usuário:', userId)
            }
        } catch (gamifError) {
            console.error('[Confraternity] Gamification error:', gamifError)
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
): Promise<{ success: boolean; confraternity?: Confraternity; confraternityId?: string; error?: string }> {
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

        // 4. Determine partner ID
        const partnerId = userId === invite.sender_id ? invite.receiver_id : invite.sender_id

        // 5. Update invite status based on whether partner already confirmed
        // Check if partner already added their testimonial
        const { data: confCheck } = await supabase
            .from('confraternities')
            .select('testimonial_member1, testimonial_member2')
            .eq('id', confraternityId)
            .single()

        const partnerTestimonialField = userId === invite.sender_id ? 'testimonial_member2' : 'testimonial_member1'
        const partnerHasConfirmed = confCheck?.[partnerTestimonialField] ? true : false

        if (partnerHasConfirmed) {
            // Both have confirmed, mark as completed
            await supabase
                .from('confraternity_invites')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', inviteId)
        } else {
            // Partner still needs to confirm
            await supabase
                .from('confraternity_invites')
                .update({
                    status: 'pending_partner'
                })
                .eq('id', inviteId)

            // 6. Notify partner to confirm
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', userId)
                .single()

            const userName = userProfile?.full_name || 'Seu parceiro'

            await supabase
                .from('notifications')
                .insert({
                    user_id: partnerId,
                    type: 'confraternity_pending_confirmation',
                    title: '✅ Confraria Registrada - Confirme sua participação!',
                    body: `${userName} registrou a confraria. Adicione seu depoimento e ganhe Vigor!`,
                    priority: 'high',
                    action_url: `/elo-da-rota/confraria/confirmar/${confraternityId}`,
                    metadata: {
                        confraternity_id: confraternityId,
                        invite_id: inviteId,
                        from_user_id: userId,
                        from_user_name: userName
                    }
                })
        }

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

                // 🎖️ MEDALHA: Cronista - Primeiro upload de foto em confraria
                const { data: previousPhotos } = await supabase
                    .from('confraternities')
                    .select('photos')
                    .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)
                    .not('photos', 'eq', '{}')

                // Se este é o primeiro registro com fotos, conceder medalha
                const totalWithPhotos = previousPhotos?.filter(c => c.photos && c.photos.length > 0).length || 0
                if (totalWithPhotos <= 1) {
                    console.log('[Confraternity] 🎖️ Concedendo medalha Cronista...')
                    await awardBadge(userId, 'cronista')
                }
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

            // Verificar badges baseadas em quantidade de confrarias
            // 🎖️ PRIMEIRA CONFRARIA: total geral (não mensal)
            const { data: allUserConfs } = await supabase
                .from('confraternities')
                .select('id')
                .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)

            const totalConfs = allUserConfs?.length || 0

            if (totalConfs === 1) {
                // Primeira confraternização (geral, não mensal)
                await awardBadge(userId, 'primeira_confraria')
            }

            // 🎖️ MEDALHA: Anfitrião - Quem enviou o convite (sender/member1) e realizou a confraria
            if (userId === invite.sender_id) {
                // É o anfitrião (quem enviou o convite)
                const { data: hostedConfs } = await supabase
                    .from('confraternities')
                    .select('id')
                    .eq('member1_id', userId)

                if (hostedConfs && hostedConfs.length === 1) {
                    console.log('[Confraternity] 🎖️ Concedendo medalha Anfitrião...')
                    await awardBadge(userId, 'anfitriao')
                }
            }

            // 🎖️ MEDALHAS MENSAIS - Rota do Valente
            // Contar apenas confrarias realizadas NESTE MÊS
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { data: monthlyConfs } = await supabase
                .from('confraternities')
                .select('id')
                .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)
                .gte('date_occurred', startOfMonth.toISOString())

            const monthlyCount = monthlyConfs?.length || 0
            console.log('[Confraternity] 📊 Confrarias este mês:', monthlyCount)

            // networker_ativo: 2 confrarias no mês (Medalha Permanente se definida assim, ou placeholder)
            if (monthlyCount >= 2) {
                // await awardBadge(userId, 'networker_ativo') // Comentado se não existir a medalha
            }

            // 🏆 PROEZA MENSAL: 5 Confrarias no Mês
            if (monthlyCount >= 5) {
                console.log('[Confraternity] 🏆 Verificando proeza mensal: 5 Confrarias...')
                await awardAchievement(userId, '5_confrarias_mes')

                // Manter medalha antiga para histórico se necessário, ou remover
                // await awardBadge(userId, 'lider_confraria') 
            }

            // mestre_conexoes: 10 confrarias no mês
            if (monthlyCount >= 10) {
                // await awardBadge(userId, 'mestre_conexoes')
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
            confraternity: confraternity as Confraternity,
            confraternityId: confraternityId
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
                member1:profiles!member1_id(id, full_name),
                member2:profiles!member2_id(id, full_name)
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

/**
 * Parceiro confirma participação na confraria e adiciona depoimento
 * Esta função é chamada quando o segundo membro confirma a confraria registrada pelo primeiro
 */
export async function confirmConfraternityPartner(
    confraternityId: string,
    userId: string,
    data: {
        testimonial: string
        approvePublication: boolean
    }
): Promise<{ success: boolean; error?: string }> {
    try {
        const supabase = createClient()

        // 1. Buscar a confraria
        const { data: confraternity, error: confError } = await supabase
            .from('confraternities')
            .select('*, invite:confraternity_invites!invite_id(*)')
            .eq('id', confraternityId)
            .single()

        if (confError || !confraternity) {
            return { success: false, error: 'Confraria não encontrada' }
        }

        // 2. Verificar se usuário é parte da confraria
        if (confraternity.member1_id !== userId && confraternity.member2_id !== userId) {
            return { success: false, error: 'Você não faz parte desta confraria' }
        }

        // 3. Determinar qual campo de depoimento usar
        const testimonialField = confraternity.member1_id === userId
            ? 'testimonial_member1'
            : 'testimonial_member2'

        // 4. Atualizar a confraria com o depoimento do parceiro
        const updateData: any = {
            [testimonialField]: data.testimonial
        }

        // Se parceiro não aprovou publicação, mudar visibilidade para privado
        if (!data.approvePublication && confraternity.visibility === 'public') {
            updateData.visibility = 'connections' // Ou 'private'
        }

        const { error: updateError } = await supabase
            .from('confraternities')
            .update(updateData)
            .eq('id', confraternityId)

        if (updateError) {
            return { success: false, error: updateError.message }
        }

        // 5. Marcar convite como completed (ambos confirmaram)
        if (confraternity.invite_id) {
            await supabase
                .from('confraternity_invites')
                .update({
                    status: 'completed',
                    completed_at: new Date().toISOString()
                })
                .eq('id', confraternity.invite_id)
        }

        // 6. Gamificação para o parceiro
        try {
            // +50 XP por confirmar participação
            await awardPoints(
                userId,
                50,
                'confraternity_confirmed',
                'Confirmou participação na confraria'
            )

            // +15 XP por adicionar depoimento
            if (data.testimonial) {
                await awardPoints(
                    userId,
                    15,
                    'confraternity_testimonial',
                    'Adicionou depoimento na confraria'
                )
            }

            // Verificar badges
            const { data: allUserConfs } = await supabase
                .from('confraternities')
                .select('id')
                .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)

            const totalConfs = allUserConfs?.length || 0

            if (totalConfs === 1) {
                await awardBadge(userId, 'primeira_confraria')
            }

            // Proezas mensais
            const startOfMonth = new Date()
            startOfMonth.setDate(1)
            startOfMonth.setHours(0, 0, 0, 0)

            const { data: monthlyConfs } = await supabase
                .from('confraternities')
                .select('id')
                .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)
                .gte('date_occurred', startOfMonth.toISOString())

            const monthlyCount = monthlyConfs?.length || 0

            if (monthlyCount >= 5) {
                await awardAchievement(userId, '5_confrarias_mes')
            }
        } catch (gamifError) {
            console.error('[ConfirmPartner] Gamification error:', gamifError)
        }

        // 7. Notificar o primeiro membro que o parceiro confirmou
        const partnerId = confraternity.member1_id === userId
            ? confraternity.member2_id
            : confraternity.member1_id

        const { data: userProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single()

        await supabase
            .from('notifications')
            .insert({
                user_id: partnerId,
                type: 'confraternity_partner_confirmed',
                title: '🎉 Confraria Confirmada!',
                body: `${userProfile?.full_name || 'Seu parceiro'} confirmou a participação na confraria!`,
                priority: 'normal',
                action_url: `/elo-da-rota/confraria/galeria`,
                metadata: {
                    confraternity_id: confraternityId,
                    from_user_id: userId
                }
            })

        return { success: true }
    } catch (error: any) {
        console.error('[ConfirmPartner] Exception:', error)
        return { success: false, error: error.message }
    }
}
