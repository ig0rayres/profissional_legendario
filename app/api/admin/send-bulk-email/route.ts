import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

// Lazy init
let resend: Resend | null = null
function getResend() {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY)
    }
    return resend
}

/**
 * POST /api/admin/send-bulk-email
 * 
 * Envia emails em massa para uma lista de destinatários
 * Reutiliza a configuração do Resend já existente
 */
export async function POST(request: NextRequest) {
    try {
        const { recipients, subject, body } = await request.json()

        if (!recipients || recipients.length === 0) {
            return NextResponse.json({ error: 'Nenhum destinatário' }, { status: 400 })
        }

        if (!subject || !body) {
            return NextResponse.json({ error: 'Assunto e corpo são obrigatórios' }, { status: 400 })
        }

        const emailClient = getResend()
        if (!emailClient) {
            return NextResponse.json({
                error: 'Serviço de email não configurado',
                message: 'Configure RESEND_API_KEY no Vercel'
            }, { status: 500 })
        }

        let emailsSent = 0
        let errors: string[] = []

        // Gerar HTML do email
        const htmlContent = generateEmailHTML(subject, body)

        // Enviar para cada destinatário
        for (const recipient of recipients) {
            if (!recipient.email) continue

            try {
                await emailClient.emails.send({
                    from: 'Rota Business Club <noreply@rotabusinessclub.com.br>',
                    to: recipient.email,
                    subject: subject,
                    html: htmlContent
                })
                emailsSent++
            } catch (e: any) {
                console.error(`[BULK EMAIL] Erro para ${recipient.email}:`, e)
                errors.push(`${recipient.email}: ${e.message}`)
            }
        }

        return NextResponse.json({
            success: true,
            emailsSent,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error: any) {
        console.error('[BULK EMAIL] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

/**
 * Gera o HTML do email com template padrão
 */
function generateEmailHTML(subject: string, body: string): string {
    // Converter quebras de linha em <br>
    const formattedBody = body.replace(/\n/g, '<br>')

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #F9FAFB; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F9FAFB;">
            <tr>
                <td align="center" style="padding: 40px 15px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        
                        <!-- Header Verde -->
                        <tr>
                            <td style="background-color: #166534; padding: 30px; text-align: center;">
                                <h1 style="margin: 0; color: white; font-size: 24px; font-weight: 700;">
                                    ${subject}
                                </h1>
                            </td>
                        </tr>
                        
                        <!-- Corpo -->
                        <tr>
                            <td style="padding: 30px;">
                                <div style="font-size: 16px; color: #374151; line-height: 1.7;">
                                    ${formattedBody}
                                </div>
                            </td>
                        </tr>

                        <!-- CTA -->
                        <tr>
                            <td style="padding: 0 30px 30px; text-align: center;">
                                <a href="https://rotabusinessclub.com.br" style="display: inline-block; background-color: #166534; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    Acessar Plataforma
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #F3F4F6; padding: 20px 30px; text-align: center;">
                                <p style="margin: 0; color: #9CA3AF; font-size: 12px;">
                                    Rota Business Club © ${new Date().getFullYear()}<br>
                                    <a href="https://rotabusinessclub.com.br" style="color: #166534; text-decoration: none;">rotabusinessclub.com.br</a>
                                </p>
                            </td>
                        </tr>
                        
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `
}
