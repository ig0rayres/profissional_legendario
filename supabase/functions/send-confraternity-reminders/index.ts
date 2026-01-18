// supabase/functions/send-confraternity-reminders/index.ts
// Edge Function para enviar lembretes de confraria 24h antes

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2.0.0'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ConfraternyReminder {
    invite_id: string
    sender_id: string
    receiver_id: string
    proposed_date: string
    location: string
    sender_email: string
    sender_name: string
    receiver_email: string
    receiver_name: string
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const resendApiKey = Deno.env.get('RESEND_API_KEY')

        const supabase = createClient(supabaseUrl, supabaseKey)

        // Buscar confrarias que precisam de lembrete
        const { data: reminders, error } = await supabase.rpc('get_confraternities_needing_reminder')

        if (error) {
            console.error('Error fetching reminders:', error)
            return new Response(JSON.stringify({ error: error.message }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        if (!reminders || reminders.length === 0) {
            console.log('No reminders to send')
            return new Response(JSON.stringify({ message: 'No reminders to send', count: 0 }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        console.log(`Found ${reminders.length} confraternities needing reminders`)

        const resend = resendApiKey ? new Resend(resendApiKey) : null
        let emailsSent = 0
        let notificationsSent = 0

        for (const reminder of reminders as ConfraternyReminder[]) {
            const eventDate = new Date(reminder.proposed_date)
            const formattedDate = eventDate.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                hour: '2-digit',
                minute: '2-digit'
            })

            // 1. Criar notificações na plataforma para ambos
            const notifications = [
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
            ]

            const { error: notifError } = await supabase.from('notifications').insert(notifications)
            if (notifError) {
                console.error('Error creating notifications:', notifError)
            } else {
                notificationsSent += 2
            }

            // 2. Enviar emails se Resend estiver configurado
            if (resend) {
                const emailTemplate = (recipientName: string, partnerName: string) => ({
                    from: 'Rota Business Club <noreply@rotabusiness.com.br>',
                    subject: '⚔️ Você tem uma Confraria amanhã!',
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <div style="background: linear-gradient(135deg, #D97706, #92400E); padding: 20px; text-align: center;">
                                <h1 style="color: white; margin: 0;">⚔️ CONFRARIA AMANHÃ!</h1>
                            </div>
                            <div style="padding: 30px; background: #f9f9f9;">
                                <p style="font-size: 16px;">Olá <strong>${recipientName}</strong>,</p>
                                <p style="font-size: 16px;">Lembrete: você tem uma <strong>confraria</strong> marcada com <strong>${partnerName}</strong>!</p>
                                <div style="background: white; border-left: 4px solid #D97706; padding: 15px; margin: 20px 0;">
                                    <p style="margin: 0;"><strong>📅 Data:</strong> ${formattedDate}</p>
                                    ${reminder.location ? `<p style="margin: 5px 0 0;"><strong>📍 Local:</strong> ${reminder.location}</p>` : ''}
                                </div>
                                <p style="font-size: 14px; color: #666;">Pra cima, Valente! 🏹</p>
                            </div>
                            <div style="background: #1a1a1a; padding: 15px; text-align: center;">
                                <p style="color: #888; font-size: 12px; margin: 0;">Rota Business Club - Amor, Honra e União</p>
                            </div>
                        </div>
                    `
                })

                try {
                    // Email para o sender
                    await resend.emails.send({
                        ...emailTemplate(reminder.sender_name, reminder.receiver_name),
                        to: reminder.sender_email
                    })
                    emailsSent++

                    // Email para o receiver
                    await resend.emails.send({
                        ...emailTemplate(reminder.receiver_name, reminder.sender_name),
                        to: reminder.receiver_email
                    })
                    emailsSent++
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                }
            }

            // 3. Marcar lembrete como enviado
            await supabase.rpc('mark_reminder_sent', { invite_uuid: reminder.invite_id })
        }

        return new Response(JSON.stringify({
            success: true,
            reminders: reminders.length,
            emailsSent,
            notificationsSent
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        console.error('Error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
