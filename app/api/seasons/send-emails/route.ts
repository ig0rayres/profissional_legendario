import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

// Lazy init para evitar erro de build
let resend: Resend | null = null
function getResend() {
    if (!resend && process.env.RESEND_API_KEY) {
        resend = new Resend(process.env.RESEND_API_KEY)
    }
    return resend
}

function getSupabaseAdmin() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )
}

/**
 * POST /api/seasons/send-emails
 * 
 * Envia emails de notificação de temporada
 */
export async function POST(request: NextRequest) {
    try {
        const { seasonId, type } = await request.json()
        const supabase = getSupabaseAdmin()

        // Buscar temporada
        const { data: season } = await supabase
            .from('seasons')
            .select('*')
            .eq('id', seasonId)
            .single()

        if (!season) {
            return NextResponse.json({ error: 'Temporada não encontrada' }, { status: 404 })
        }

        // Buscar prêmios
        const { data: prizes } = await supabase
            .from('season_prizes')
            .select('*')
            .eq('season_id', seasonId)
            .order('position')

        // Buscar usuários ativos com email
        const { data: users } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .not('email', 'is', null)

        if (!users || users.length === 0) {
            return NextResponse.json({ error: 'Nenhum usuário para notificar' }, { status: 400 })
        }

        let emailsSent = 0
        let errors: string[] = []

        const emailClient = getResend()
        if (!emailClient) {
            return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
        }

        if (type === 'new_season') {
            // Email de nova temporada
            for (const user of users) {
                if (!user.email) continue

                try {
                    await emailClient.emails.send({
                        from: 'Rota Business Club <noreply@rotabusinessclub.com.br>',
                        to: user.email,
                        subject: `🏆 Nova Temporada: ${season.name} - Veja os Prêmios!`,
                        html: generateNewSeasonEmail(season, prizes || [], user.full_name)
                    })
                    emailsSent++
                } catch (e: any) {
                    errors.push(`${user.email}: ${e.message}`)
                }
            }
        } else if (type === 'champions') {
            // Email de anúncio de campeões
            const { data: winners } = await supabase
                .from('season_winners')
                .select(`*, user:profiles!user_id(full_name, avatar_url)`)
                .eq('season_id', seasonId)
                .order('position')

            for (const user of users) {
                if (!user.email) continue

                try {
                    await emailClient.emails.send({
                        from: 'Rota Business Club <noreply@rotabusinessclub.com.br>',
                        to: user.email,
                        subject: `🎉 Conheça os Campeões de ${season.name}!`,
                        html: generateChampionsEmail(season, winners || [], user.full_name)
                    })
                    emailsSent++
                } catch (e: any) {
                    errors.push(`${user.email}: ${e.message}`)
                }
            }
        }

        return NextResponse.json({
            success: true,
            emailsSent,
            errors: errors.length > 0 ? errors : undefined
        })

    } catch (error: any) {
        console.error('[API] Error sending season emails:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

function generateNewSeasonEmail(season: any, prizes: any[], userName: string): string {
    const prizesList = prizes.map(p => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #333;">
                ${p.position === 1 ? '🥇' : p.position === 2 ? '🥈' : '🥉'} ${p.position}º Lugar
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #333; font-weight: bold;">
                ${p.title}
            </td>
        </tr>
    `).join('')

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px; text-align: center;">
                                <h1 style="margin: 0; color: white; font-size: 28px;">🏆 Nova Temporada!</h1>
                                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 18px;">${season.name}</p>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px; color: #e5e5e5;">
                                <p style="font-size: 16px; margin: 0 0 20px;">
                                    Olá <strong>${userName}</strong>! 👋
                                </p>
                                <p style="font-size: 16px; margin: 0 0 30px; line-height: 1.6;">
                                    Uma nova temporada começou no Rota Business Club! Participe das atividades, ganhe XP e concorra a prêmios incríveis!
                                </p>
                                
                                <h2 style="color: #f97316; font-size: 20px; margin: 0 0 20px;">Prêmios do Mês:</h2>
                                
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #262626; border-radius: 8px; overflow: hidden;">
                                    ${prizesList}
                                </table>
                                
                                <p style="font-size: 14px; color: #a3a3a3; margin: 30px 0 0; text-align: center;">
                                    Período: ${new Date(season.start_date).toLocaleDateString('pt-BR')} a ${new Date(season.end_date).toLocaleDateString('pt-BR')}
                                </p>
                            </td>
                        </tr>
                        
                        <!-- CTA -->
                        <tr>
                            <td style="padding: 0 40px 40px; text-align: center;">
                                <a href="https://rotabusinessclub.com.br/dashboard/rota-valente" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Ver Ranking Completo
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; background-color: #0a0a0a; text-align: center;">
                                <p style="margin: 0; color: #737373; font-size: 12px;">
                                    Rota Business Club © ${new Date().getFullYear()}
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

function generateChampionsEmail(season: any, winners: any[], userName: string): string {
    const winnersList = winners.map(w => `
        <div style="display: flex; align-items: center; padding: 16px; background-color: #262626; border-radius: 8px; margin-bottom: 12px;">
            <span style="font-size: 32px; margin-right: 16px;">
                ${w.position === 1 ? '🥇' : w.position === 2 ? '🥈' : '🥉'}
            </span>
            <div>
                <p style="margin: 0; font-weight: bold; font-size: 18px; color: white;">${w.user?.full_name || 'Usuário'}</p>
                <p style="margin: 4px 0 0; color: #f97316; font-size: 14px;">${w.xp_earned} XP</p>
            </div>
        </div>
    `).join('')

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
            <tr>
                <td align="center" style="padding: 40px 20px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 16px; overflow: hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px; text-align: center;">
                                <h1 style="margin: 0; color: white; font-size: 28px;">🎉 Campeões de ${season.name}!</h1>
                            </td>
                        </tr>
                        
                        <!-- Content -->
                        <tr>
                            <td style="padding: 40px; color: #e5e5e5;">
                                <p style="font-size: 16px; margin: 0 0 20px;">
                                    Olá <strong>${userName}</strong>! 👋
                                </p>
                                <p style="font-size: 16px; margin: 0 0 30px; line-height: 1.6;">
                                    A temporada ${season.name} chegou ao fim! Confira os campeões que se destacaram este mês:
                                </p>
                                
                                ${winnersList}
                                
                                <p style="font-size: 16px; margin: 30px 0 0; line-height: 1.6;">
                                    Parabéns aos vencedores! 🎊<br><br>
                                    Uma nova temporada já começou. Participe e conquiste seu lugar no pódio!
                                </p>
                            </td>
                        </tr>
                        
                        <!-- CTA -->
                        <tr>
                            <td style="padding: 0 40px 40px; text-align: center;">
                                <a href="https://rotabusinessclub.com.br/dashboard/rota-valente" style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                                    Participar da Nova Temporada
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 20px 40px; background-color: #0a0a0a; text-align: center;">
                                <p style="margin: 0; color: #737373; font-size: 12px;">
                                    Rota Business Club © ${new Date().getFullYear()}
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
