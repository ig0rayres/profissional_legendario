import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Marcar como dinâmica pois usa request.headers
export const dynamic = 'force-dynamic'

/**
 * CRON JOB: Enviar notificações pós-confraria
 * 
 * Roda a cada 1 hora (configurar no Vercel/Supabase)
 * Envia notificação para AMBOS os participantes 4h após a confraria
 */
export async function GET(request: Request) {
    try {
        // Verificar autenticação (cron secret)
        const authHeader = request.headers.get('authorization')
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const supabase = await createClient()

        // Buscar confrarias que precisam de notificação
        const { data: confraternities, error } = await supabase
            .rpc('get_confraternities_needing_post_event_notification')

        if (error) {
            console.error('Erro ao buscar confrarias:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!confraternities || confraternities.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Nenhuma confraria precisa de notificação',
                count: 0
            })
        }

        console.log(`📢 ${confraternities.length} confrarias precisam de notificação`)

        const results = []

        // Para cada confraria, enviar notificação para AMBOS os participantes
        for (const conf of confraternities) {
            try {
                // Formatar data/hora
                const date = new Date(conf.proposed_date)
                const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

                // ============================================
                // NOTIFICAÇÃO PARA O SENDER
                // ============================================
                const { data: senderNotification, error: senderError } = await supabase
                    .rpc('create_post_confraternity_notification', {
                        p_user_id: conf.sender_id,
                        p_confraternity_id: conf.invite_id,
                        p_partner_name: conf.receiver_name,
                        p_date: conf.proposed_date,
                        p_location: conf.location || 'Local não especificado'
                    })

                if (senderError) {
                    console.error(`Erro ao criar notificação para sender ${conf.sender_name}:`, senderError)
                } else {
                    console.log(`✅ Notificação enviada para ${conf.sender_name}`)
                }

                // ============================================
                // NOTIFICAÇÃO PARA O RECEIVER
                // ============================================
                const { data: receiverNotification, error: receiverError } = await supabase
                    .rpc('create_post_confraternity_notification', {
                        p_user_id: conf.receiver_id,
                        p_confraternity_id: conf.invite_id,
                        p_partner_name: conf.sender_name,
                        p_date: conf.proposed_date,
                        p_location: conf.location || 'Local não especificado'
                    })

                if (receiverError) {
                    console.error(`Erro ao criar notificação para receiver ${conf.receiver_name}:`, receiverError)
                } else {
                    console.log(`✅ Notificação enviada para ${conf.receiver_name}`)
                }

                // ============================================
                // MARCAR COMO NOTIFICAÇÃO ENVIADA
                // ============================================
                const { error: markError } = await supabase
                    .rpc('mark_post_event_notification_sent', {
                        p_invite_id: conf.invite_id
                    })

                if (markError) {
                    console.error(`Erro ao marcar notificação como enviada:`, markError)
                }

                results.push({
                    confraternity_id: conf.invite_id,
                    sender: conf.sender_name,
                    receiver: conf.receiver_name,
                    date: `${formattedDate} ${formattedTime}`,
                    notifications_sent: !senderError && !receiverError ? 2 : 1,
                    success: true
                })

            } catch (err) {
                console.error('Erro ao processar confraria:', err)
                results.push({
                    confraternity_id: conf.invite_id,
                    error: err instanceof Error ? err.message : 'Erro desconhecido',
                    success: false
                })
            }
        }

        const successCount = results.filter(r => r.success).length
        const totalNotificationsSent = results.reduce((acc, r) => acc + (r.notifications_sent || 0), 0)

        return NextResponse.json({
            success: true,
            message: `${successCount}/${confraternities.length} confrarias processadas`,
            total_notifications_sent: totalNotificationsSent,
            results
        })

    } catch (error) {
        console.error('Erro no cron job:', error)
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Erro desconhecido'
        }, { status: 500 })
    }
}
