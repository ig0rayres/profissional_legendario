import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY!)

/**
 * Envia email para TODOS os usuários da plataforma
 * Usado pelo CRON de temporadas
 */
export async function sendEmailToAllUsers(
    htmlContent: string,
    subject: string
): Promise<{ success: boolean; sent: number; errors: number }> {

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Buscar TODOS os emails de usuários ativos
    const { data: profiles } = await supabase
        .from('profiles')
        .select('email, full_name')
        .not('email', 'is', null)

    if (!profiles || profiles.length === 0) {
        console.log('[EMAIL] Nenhum usuário para enviar')
        return { success: false, sent: 0, errors: 0 }
    }

    console.log(`[EMAIL] Enviando para ${profiles.length} usuários...`)

    let sent = 0
    let errors = 0

    // Enviar em lote (máximo 100 por vez)
    const batchSize = 100
    for (let i = 0; i < profiles.length; i += batchSize) {
        const batch = profiles.slice(i, i + batchSize)

        try {
            await resend.emails.send({
                from: 'Rota Business Club <noreply@rotabusinessclub.com.br>',
                to: batch.map(p => p.email),
                subject: subject,
                html: htmlContent
            })

            sent += batch.length
            console.log(`[EMAIL] Lote ${i / batchSize + 1}: ${batch.length} emails enviados`)
        } catch (error) {
            console.error(`[EMAIL] Erro no lote ${i / batchSize + 1}:`, error)
            errors += batch.length
        }
    }

    console.log(`[EMAIL] ✅ Total: ${sent} enviados, ${errors} erros`)

    return { success: errors === 0, sent, errors }
}
