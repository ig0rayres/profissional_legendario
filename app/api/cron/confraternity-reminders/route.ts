import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'

/**
 * API Route para enviar lembretes de confraria
 * Deve ser chamada por um cron job a cada hora
 * 
 * Para Vercel, adicione em vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/confraternity-reminders",
 *     "schedule": "0 * * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
    // Verificar se é uma requisição autorizada (do cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Em desenvolvimento, permitir sem secret
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    try {
        const supabase = await createClient()

        // Buscar confrarias que precisam de lembrete (24h antes)
        const { data: reminders, error } = await supabase.rpc('get_confraternities_needing_reminder')

        if (error) {
            console.error('[Cron] Error fetching reminders:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!reminders || reminders.length === 0) {
            console.log('[Cron] No reminders to send')
            return NextResponse.json({ message: 'No reminders to send', count: 0 })
        }

        console.log(`[Cron] Found ${reminders.length} confraternities needing reminders`)

        let notificationsSent = 0

        for (const reminder of reminders) {
            const eventDate = new Date(reminder.proposed_date)
            const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            })

            // Criar notificações na plataforma para ambos
            const { error: notifError } = await supabase.from('notifications').insert([
                {
                    user_id: reminder.sender_id,
                    type: 'confraternity_reminder',
                    title: '⏰ Confraria Amanhã!',
                    body: `Você tem uma confraria com ${reminder.receiver_name} amanhã - ${formattedDate}`,
                    priority: 'high',
                    metadata: { invite_id: reminder.invite_id, partner_name: reminder.receiver_name }
                },
                {
                    user_id: reminder.receiver_id,
                    type: 'confraternity_reminder',
                    title: '⏰ Confraria Amanhã!',
                    body: `Você tem uma confraria com ${reminder.sender_name} amanhã - ${formattedDate}`,
                    priority: 'high',
                    metadata: { invite_id: reminder.invite_id, partner_name: reminder.sender_name }
                }
            ])

            if (notifError) {
                console.error('[Cron] Error creating notifications:', notifError)
            } else {
                notificationsSent += 2
            }

            // TODO: Enviar emails via Resend quando configurado
            // const resend = new Resend(process.env.RESEND_API_KEY)
            // await resend.emails.send({ ... })

            // Marcar lembrete como enviado
            await supabase.rpc('mark_reminder_sent', { invite_uuid: reminder.invite_id })
        }

        return NextResponse.json({
            success: true,
            reminders: reminders.length,
            notificationsSent
        })

    } catch (error: any) {
        console.error('[Cron] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
