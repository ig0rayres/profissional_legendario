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
            console.error('[API] RESEND_API_KEY não configurada')
            return NextResponse.json({
                error: 'Serviço de email não configurado',
                message: 'Configure a variável RESEND_API_KEY no Vercel',
                envCheck: {
                    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
                    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
                    SUPABASE_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY
                }
            }, { status: 500 })
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
                        from: 'Profissionais Legendários <noreply@profissionaislegendarios.com.br>',
                        to: user.email,
                        subject: `🏆 E OS CAMPEÕES SÃO... | ${season.name}`,
                        html: generateChampionsEmail(season, winners || [], user.full_name, prizes)
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
    // Ordenar prêmios por posição
    const sortedPrizes = [...prizes].sort((a, b) => a.position - b.position)

    const startDate = new Date(season.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    const endDate = new Date(season.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

    // Tabela de prêmios limpa
    const prizeRows = sortedPrizes.map(p => {
        const emoji = p.position === 1 ? '🥇' : p.position === 2 ? '🥈' : '🥉'
        const bgColor = p.position === 1 ? '#FEF3C7' : p.position === 2 ? '#F3F4F6' : '#FED7AA'
        const textColor = p.position === 1 ? '#92400E' : p.position === 2 ? '#374151' : '#9A3412'

        return `
            <tr style="background-color: ${bgColor};">
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 28px;">
                    ${emoji}
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; color: ${textColor}; font-weight: 600; font-size: 16px;">
                    ${p.position}º Lugar
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 16px;">
                    ${p.title}
                </td>
            </tr>
        `
    }).join('')

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
                            <td style="background-color: #166534; padding: 40px 30px; text-align: center;">
                                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 700;">
                                    🏆 Nova Temporada
                                </h1>
                                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 20px; font-weight: 500;">
                                    ${season.name}
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Saudação -->
                        <tr>
                            <td style="padding: 30px 30px 20px;">
                                <p style="font-size: 16px; margin: 0; color: #374151; line-height: 1.6;">
                                    Olá, <strong style="color: #166534;">${userName}</strong>!
                                </p>
                                <p style="font-size: 16px; margin: 15px 0 0; color: #6B7280; line-height: 1.7;">
                                    A nova temporada do <strong style="color: #111827;">Rota Business Club</strong> começou! 
                                    Participe, acumule pontos e concorra a prêmios incríveis.
                                </p>
                            </td>
                        </tr>

                        <!-- Período -->
                        <tr>
                            <td style="padding: 0 30px 25px;">
                                <div style="background-color: #F3F4F6; border-radius: 8px; padding: 15px 20px; text-align: center;">
                                    <p style="margin: 0; color: #6B7280; font-size: 14px;">
                                        📅 <strong style="color: #374151;">Período:</strong> ${startDate} até ${endDate}
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Tabela de Prêmios -->
                        <tr>
                            <td style="padding: 0 30px 30px;">
                                <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px; font-weight: 600;">
                                    🎁 Prêmios desta Temporada
                                </h2>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                                    <thead>
                                        <tr style="background-color: #166534;">
                                            <th style="padding: 12px 20px; color: white; font-weight: 600; text-align: center; width: 60px;"></th>
                                            <th style="padding: 12px 20px; color: white; font-weight: 600; text-align: left;">Posição</th>
                                            <th style="padding: 12px 20px; color: white; font-weight: 600; text-align: left;">Prêmio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${prizeRows}
                                    </tbody>
                                </table>
                            </td>
                        </tr>
                        
                        <!-- CTA -->
                        <tr>
                            <td style="padding: 0 30px 40px; text-align: center;">
                                <a href="https://rotabusinessclub.com.br/dashboard/rota-do-valente" style="display: inline-block; background-color: #166534; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    Ver Ranking e Participar
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 25px 30px; background-color: #F9FAFB; text-align: center; border-top: 1px solid #E5E7EB;">
                                <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.6;">
                                    Rota Business Club © ${new Date().getFullYear()}<br>
                                    Você recebeu este email por ser membro da plataforma.
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

function generateChampionsEmail(season: any, winners: any[], userName: string, prizes?: any[]): string {
    // Mapear prêmios por posição
    const prizeByPosition: { [key: number]: any } = {}
    if (prizes) {
        prizes.forEach(p => {
            prizeByPosition[p.position] = p
        })
    }

    // Tabela de vencedores limpa
    const winnerRows = winners.map(w => {
        const emoji = w.position === 1 ? '🥇' : w.position === 2 ? '🥈' : '🥉'
        const bgColor = w.position === 1 ? '#FEF3C7' : w.position === 2 ? '#F3F4F6' : '#FED7AA'
        const textColor = w.position === 1 ? '#92400E' : w.position === 2 ? '#374151' : '#9A3412'
        const prize = prizeByPosition[w.position]

        return `
            <tr style="background-color: ${bgColor};">
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; text-align: center; font-size: 28px;">
                    ${emoji}
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; color: ${textColor}; font-weight: 600; font-size: 16px;">
                    ${w.position}º Lugar
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; color: #111827; font-size: 16px; font-weight: 600;">
                    ${w.user?.full_name || 'Campeão'}
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; color: #166534; font-size: 14px;">
                    ${w.xp_earned || 0} pts
                </td>
                <td style="padding: 16px 20px; border-bottom: 1px solid #E5E7EB; color: #6B7280; font-size: 14px;">
                    ${prize?.title || '-'}
                </td>
            </tr>
        `
    }).join('')

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
                        
                        <!-- Header Dourado -->
                        <tr>
                            <td style="background-color: #B45309; padding: 40px 30px; text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 10px;">🏆</div>
                                <h1 style="margin: 0; color: white; font-size: 26px; font-weight: 700;">
                                    Resultados da Temporada
                                </h1>
                                <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 18px; font-weight: 500;">
                                    ${season.name}
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Saudação -->
                        <tr>
                            <td style="padding: 30px 30px 20px;">
                                <p style="font-size: 16px; margin: 0; color: #374151; line-height: 1.6;">
                                    Olá, <strong style="color: #B45309;">${userName}</strong>!
                                </p>
                                <p style="font-size: 16px; margin: 15px 0 0; color: #6B7280; line-height: 1.7;">
                                    A temporada <strong style="color: #111827;">${season.name}</strong> chegou ao fim! 
                                    Confira os vencedores e seus prêmios.
                                </p>
                            </td>
                        </tr>

                        <!-- Tabela de Vencedores -->
                        <tr>
                            <td style="padding: 0 30px 30px;">
                                <h2 style="color: #111827; font-size: 20px; margin: 0 0 20px; font-weight: 600;">
                                    🎖️ Pódio Oficial
                                </h2>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
                                    <thead>
                                        <tr style="background-color: #B45309;">
                                            <th style="padding: 12px 15px; color: white; font-weight: 600; text-align: center; width: 50px;"></th>
                                            <th style="padding: 12px 15px; color: white; font-weight: 600; text-align: left;">Posição</th>
                                            <th style="padding: 12px 15px; color: white; font-weight: 600; text-align: left;">Nome</th>
                                            <th style="padding: 12px 15px; color: white; font-weight: 600; text-align: left;">Pontos</th>
                                            <th style="padding: 12px 15px; color: white; font-weight: 600; text-align: left;">Prêmio</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${winnerRows}
                                    </tbody>
                                </table>
                            </td>
                        </tr>

                        <!-- Mensagem de Parabéns -->
                        <tr>
                            <td style="padding: 0 30px 25px;">
                                <div style="background-color: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 20px; text-align: center;">
                                    <p style="margin: 0; color: #166534; font-size: 16px; font-weight: 600;">
                                        🎉 Parabéns aos vencedores!
                                    </p>
                                    <p style="margin: 10px 0 0; color: #047857; font-size: 14px;">
                                        Entraremos em contato para entrega dos prêmios.
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Mensagem Motivacional -->
                        <tr>
                            <td style="padding: 0 30px 25px; text-align: center;">
                                <p style="color: #6B7280; font-size: 14px; margin: 0; line-height: 1.6;">
                                    Não subiu ao pódio? A nova temporada já começou!<br>
                                    <strong style="color: #374151;">Cada mês é uma nova chance.</strong> 💪
                                </p>
                            </td>
                        </tr>
                        
                        <!-- CTA -->
                        <tr>
                            <td style="padding: 0 30px 40px; text-align: center;">
                                <a href="https://rotabusinessclub.com.br/dashboard/rota-do-valente" style="display: inline-block; background-color: #166534; color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                                    Ver Nova Temporada
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer -->
                        <tr>
                            <td style="padding: 25px 30px; background-color: #F9FAFB; text-align: center; border-top: 1px solid #E5E7EB;">
                                <p style="margin: 0; color: #9CA3AF; font-size: 12px; line-height: 1.6;">
                                    Rota Business Club © ${new Date().getFullYear()}<br>
                                    Você recebeu este email por ser membro da plataforma.
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

