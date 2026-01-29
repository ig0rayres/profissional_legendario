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

    const prizeCards = sortedPrizes.map(p => {
        const gradients = {
            1: 'linear-gradient(135deg, #854d0e 0%, #713f12 50%, #422006 100%)',
            2: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
            3: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #292524 100%)'
        }
        const borders = { 1: '#fbbf24', 2: '#9ca3af', 3: '#d97706' }
        const glows = { 1: 'rgba(251, 191, 36, 0.3)', 2: 'rgba(156, 163, 175, 0.2)', 3: 'rgba(217, 119, 6, 0.25)' }
        const emoji = p.position === 1 ? '👑' : p.position === 2 ? '🥈' : '🥉'
        const label = p.position === 1 ? 'CAMPEÃO' : p.position === 2 ? 'VICE' : 'BRONZE'

        return `
            <td style="padding: 8px; width: 33%; vertical-align: top;">
                <div style="background: ${gradients[p.position as 1 | 2 | 3]}; border-radius: 16px; padding: 20px 15px; border: 2px solid ${borders[p.position as 1 | 2 | 3]}; box-shadow: 0 8px 32px ${glows[p.position as 1 | 2 | 3]}; text-align: center;">
                    <div style="font-size: 40px; margin-bottom: 12px;">${emoji}</div>
                    <p style="color: ${borders[p.position as 1 | 2 | 3]}; font-weight: 900; font-size: 11px; margin: 0 0 15px; letter-spacing: 2px; text-transform: uppercase;">${label}</p>
                    ${p.image_url ? `
                        <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 12px; margin-bottom: 12px;">
                            <img src="${p.image_url}" alt="${p.title}" style="max-width: 90px; max-height: 90px; object-fit: contain; display: block; margin: 0 auto;" />
                        </div>
                    ` : ''}
                    <p style="color: #ffffff; font-size: 14px; font-weight: bold; margin: 0; line-height: 1.3;">${p.title}</p>
                </div>
            </td>
        `
    }).join('')

    const startDate = new Date(season.start_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })
    const endDate = new Date(season.end_date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #030712; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #030712 0%, #0a0a0a 100%);">
            <tr>
                <td align="center" style="padding: 40px 15px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #111827 0%, #0a0a0a 100%); border-radius: 24px; overflow: hidden; border: 1px solid rgba(34, 197, 94, 0.3); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(34, 197, 94, 0.1);">
                        
                        ${season.banner_url ? `
                        <!-- Banner da Temporada -->
                        <tr>
                            <td style="padding: 0;">
                                <img src="${season.banner_url}" alt="${season.name}" style="width: 100%; height: auto; display: block;" />
                            </td>
                        </tr>
                        ` : `
                        <!-- Header Épico (quando não tem banner) -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #14532d 0%, #166534 30%, #15803d 70%, #16a34a 100%); padding: 50px 30px; text-align: center; position: relative;">
                                <div style="font-size: 70px; margin-bottom: 15px; filter: drop-shadow(0 0 30px rgba(255,255,255,0.3));">🚀</div>
                                <h1 style="margin: 0; color: white; font-size: 36px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">
                                    NOVA TEMPORADA
                                </h1>
                                <div style="width: 80px; height: 4px; background: linear-gradient(90deg, transparent, #ffffff, transparent); margin: 20px auto; border-radius: 2px;"></div>
                                <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 24px; font-weight: 700; letter-spacing: 1px;">
                                    ${season.name}
                                </p>
                                <p style="margin: 15px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">
                                    🗓️ ${startDate} até ${endDate}
                                </p>
                            </td>
                        </tr>
                        `}
                        
                        <!-- Saudação Personalizada -->
                        <tr>
                            <td style="padding: 40px 35px 25px;">
                                <p style="font-size: 18px; margin: 0; color: #e5e5e5; line-height: 1.6;">
                                    E aí, <strong style="color: #22c55e; font-size: 20px;">${userName}</strong>! 🔥
                                </p>
                                <p style="font-size: 16px; margin: 20px 0 0; color: #a3a3a3; line-height: 1.7;">
                                    A <strong style="color: white;">maior competição do mês</strong> acaba de começar! 
                                    Complete missões, conquiste medalhas e <strong style="color: #fbbf24;">leve prêmios incríveis pra casa</strong>.
                                </p>
                            </td>
                        </tr>

                        <!-- Seção de Prêmios Épica -->
                        <tr>
                            <td style="padding: 15px 20px 30px;">
                                <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1px solid rgba(251, 191, 36, 0.2); border-radius: 20px; padding: 30px 20px;">
                                    <h2 style="color: #fbbf24; text-align: center; font-size: 22px; margin: 0 0 25px; text-transform: uppercase; letter-spacing: 3px; font-weight: 900;">
                                        🎁 Prêmios em Jogo
                                    </h2>
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            ${prizeCards}
                                        </tr>
                                    </table>
                                </div>
                            </td>
                        </tr>

                        <!-- Urgência / FOMO -->
                        <tr>
                            <td style="padding: 0 35px 25px;">
                                <div style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 18px 25px; text-align: center;">
                                    <p style="color: #fca5a5; font-size: 14px; margin: 0; font-weight: 600;">
                                        ⏰ <strong style="color: #ef4444;">ATENÇÃO:</strong> Quanto antes você começar, maiores suas chances de chegar ao topo!
                                    </p>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- CTA Magnético -->
                        <tr>
                            <td style="padding: 10px 35px 45px; text-align: center;">
                                <a href="https://profissionaislegendarios.com.br/rota-valente" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%); color: white; text-decoration: none; padding: 20px 60px; border-radius: 14px; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 10px 40px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2);">
                                    ⚡ QUERO COMPETIR
                                </a>
                                <p style="color: #525252; font-size: 12px; margin: 15px 0 0;">
                                    Clique e veja sua posição atual no ranking
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Footer Premium -->
                        <tr>
                            <td style="padding: 30px 35px; background: linear-gradient(180deg, #0a0a0a 0%, #030712 100%); text-align: center; border-top: 1px solid #1f2937;">
                                <p style="margin: 0 0 10px; color: #22c55e; font-size: 13px; font-weight: 600;">
                                    💚 Obrigado por fazer parte da comunidade!
                                </p>
                                <p style="margin: 0; color: #404040; font-size: 11px; line-height: 1.6;">
                                    Profissionais Legendários © ${new Date().getFullYear()}<br>
                                    Você recebeu este email por ser membro ativo.
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

    const winnerRows = winners.map(w => {
        const configs = {
            1: {
                gradient: 'linear-gradient(135deg, #854d0e 0%, #713f12 50%, #422006 100%)',
                border: '#fbbf24',
                glow: 'rgba(251, 191, 36, 0.4)',
                trophy: '🏆',
                label: 'CAMPEÃO',
                labelBg: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                size: '60px'
            },
            2: {
                gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 50%, #111827 100%)',
                border: '#9ca3af',
                glow: 'rgba(156, 163, 175, 0.3)',
                trophy: '🥈',
                label: 'VICE-CAMPEÃO',
                labelBg: 'linear-gradient(135deg, #9ca3af, #6b7280)',
                size: '48px'
            },
            3: {
                gradient: 'linear-gradient(135deg, #78350f 0%, #451a03 50%, #292524 100%)',
                border: '#d97706',
                glow: 'rgba(217, 119, 6, 0.35)',
                trophy: '🥉',
                label: 'BRONZE',
                labelBg: 'linear-gradient(135deg, #d97706, #b45309)',
                size: '44px'
            }
        }
        const config = configs[w.position as 1 | 2 | 3] || configs[3]
        const prize = prizeByPosition[w.position]

        return `
            <tr>
                <td style="padding: 10px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: ${config.gradient}; border-radius: 20px; border: 3px solid ${config.border}; overflow: hidden; box-shadow: 0 15px 50px ${config.glow};">
                        <tr>
                            <!-- Troféu -->
                            <td width="100" style="padding: 25px; text-align: center; vertical-align: middle; background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, transparent 100%);">
                                <div style="font-size: ${config.size}; filter: drop-shadow(0 0 20px ${config.glow});">${config.trophy}</div>
                            </td>
                            
                            <!-- Info do Vencedor -->
                            <td style="padding: 25px 10px;">
                                <!-- Badge de Posição -->
                                <div style="background: ${config.labelBg}; display: inline-block; padding: 6px 16px; border-radius: 20px; margin-bottom: 12px;">
                                    <span style="color: #000; font-weight: 900; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">${config.label}</span>
                                </div>
                                
                                <!-- Nome do Vencedor -->
                                <p style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0 0 10px; text-shadow: 0 2px 8px rgba(0,0,0,0.4); letter-spacing: 0.5px;">
                                    ${w.user?.full_name || 'Campeão Misterioso'}
                                </p>
                                
                                <!-- XP Conquistado -->
                                <p style="color: #22c55e; font-size: 15px; margin: 0 0 12px; font-weight: 700;">
                                    ⚡ <span style="font-size: 18px;">${w.xp_earned || 0}</span> VIGOR conquistado
                                </p>
                                
                                <!-- Prêmio -->
                                ${prize ? `
                                    <div style="background: rgba(0,0,0,0.3); border-radius: 10px; padding: 10px 15px; display: inline-block;">
                                        <span style="color: ${config.border}; font-size: 13px; font-weight: 600;">
                                            🎁 Prêmio: <strong style="color: #fff;">${prize.title}</strong>
                                        </span>
                                    </div>
                                ` : ''}
                            </td>
                            
                            <!-- Imagem do Prêmio -->
                            ${prize?.image_url ? `
                                <td width="120" style="padding: 20px; text-align: center; vertical-align: middle;">
                                    <div style="background: rgba(0,0,0,0.3); border-radius: 15px; padding: 12px;">
                                        <img src="${prize.image_url}" alt="${prize.title}" style="max-width: 90px; max-height: 90px; object-fit: contain; display: block; margin: 0 auto; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));" />
                                    </div>
                                </td>
                            ` : ''}
                        </tr>
                    </table>
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
    <body style="margin: 0; padding: 0; background-color: #030712; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #030712 0%, #0f0f0f 50%, #030712 100%);">
            <tr>
                <td align="center" style="padding: 40px 15px;">
                    <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #111827 0%, #0a0a0a 100%); border-radius: 28px; overflow: hidden; border: 1px solid rgba(251, 191, 36, 0.3); box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.6), 0 0 80px rgba(251, 191, 36, 0.08);">
                        
                        ${season.banner_url ? `
                        <!-- Banner da Temporada -->
                        <tr>
                            <td style="padding: 0;">
                                <img src="${season.banner_url}" alt="${season.name}" style="width: 100%; height: auto; display: block;" />
                            </td>
                        </tr>
                        <!-- Overlay de Encerramento -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #78350f 0%, #b45309 50%, #78350f 100%); padding: 25px 30px; text-align: center;">
                                <h1 style="margin: 0; color: white; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">
                                    🏆 E OS CAMPEÕES SÃO...
                                </h1>
                            </td>
                        </tr>
                        ` : `
                        <!-- Header ÉPICO Estilo Oscar -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #78350f 0%, #b45309 25%, #f59e0b 50%, #b45309 75%, #78350f 100%); padding: 60px 30px; text-align: center; position: relative;">
                                <!-- Spotlight Effect -->
                                <div style="position: absolute; top: 0; left: 50%; width: 200px; margin-left: -100px; height: 100%; background: radial-gradient(ellipse at center, rgba(255,255,255,0.15) 0%, transparent 70%);"></div>
                                
                                <!-- Trophy Icon -->
                                <div style="font-size: 80px; margin-bottom: 20px; filter: drop-shadow(0 0 40px rgba(255,255,255,0.4));">🏆</div>
                                
                                <!-- Title -->
                                <h1 style="margin: 0; color: white; font-size: 38px; font-weight: 900; text-transform: uppercase; letter-spacing: 5px; text-shadow: 0 4px 20px rgba(0,0,0,0.4);">
                                    E OS CAMPEÕES SÃO...
                                </h1>
                                
                                <!-- Divider -->
                                <div style="width: 100px; height: 4px; background: linear-gradient(90deg, transparent, #ffffff, transparent); margin: 25px auto; border-radius: 2px;"></div>
                                
                                <!-- Season Name -->
                                <p style="margin: 0; color: rgba(255,255,255,0.95); font-size: 26px; font-weight: 700; letter-spacing: 2px;">
                                    ${season.name}
                                </p>
                            </td>
                        </tr>
                        `}
                        
                        <!-- Saudação Emocional -->
                        <tr>
                            <td style="padding: 45px 40px 30px;">
                                <p style="font-size: 19px; margin: 0; color: #f5f5f5; line-height: 1.6;">
                                    Olá, <strong style="color: #fbbf24; font-size: 21px;">${userName}</strong>! 👋
                                </p>
                                <p style="font-size: 16px; margin: 20px 0 0; color: #a3a3a3; line-height: 1.8;">
                                    A temporada <strong style="color: white;">${season.name}</strong> chegou ao fim e foi <strong style="color: #22c55e; font-size: 18px;">ÉPICA</strong>! 
                                </p>
                                <p style="font-size: 16px; margin: 15px 0 0; color: #a3a3a3; line-height: 1.8;">
                                    💚 <strong style="color: #d4d4d4;">Obrigado</strong> por fazer parte dessa jornada incrível conosco. Seu esforço e dedicação fazem a diferença!
                                </p>
                                <p style="font-size: 17px; margin: 25px 0 0; color: #fbbf24; line-height: 1.6; font-weight: 600;">
                                    🌟 Agora, o momento que você esperava... Os <strong style="text-transform: uppercase;">LENDÁRIOS</strong> que conquistaram o pódio:
                                </p>
                            </td>
                        </tr>
                        
                        <!-- Pódio dos Campeões -->
                        <tr>
                            <td style="padding: 0 25px 35px;">
                                <div style="background: linear-gradient(180deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%); border: 1px solid rgba(251, 191, 36, 0.25); border-radius: 24px; padding: 30px 20px;">
                                    <!-- Título do Pódio -->
                                    <h2 style="color: #fbbf24; text-align: center; font-size: 22px; margin: 0 0 25px; text-transform: uppercase; letter-spacing: 4px; font-weight: 900;">
                                        🎖️ Pódio Oficial
                                    </h2>
                                    
                                    <!-- Cards dos Vencedores -->
                                    <table width="100%" cellpadding="0" cellspacing="0">
                                        ${winnerRows}
                                    </table>
                                </div>
                            </td>
                        </tr>
                        
                        <!-- Celebração -->
                        <tr>
                            <td style="padding: 0 35px 30px;">
                                <div style="background: linear-gradient(135deg, rgba(22, 163, 74, 0.12) 0%, rgba(22, 163, 74, 0.04) 100%); border: 2px solid rgba(34, 197, 94, 0.5); border-radius: 20px; padding: 30px; text-align: center;">
                                    <div style="font-size: 50px; margin-bottom: 15px;">🎉</div>
                                    <p style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0 0 12px;">
                                        Parabéns aos Campeões!
                                    </p>
                                    <p style="color: #86efac; font-size: 15px; margin: 0; line-height: 1.7;">
                                        Vocês são inspiração para toda a comunidade!<br>
                                        <span style="color: #22c55e; font-weight: 600;">Entraremos em contato para entrega dos prêmios.</span>
                                    </p>
                                </div>
                            </td>
                        </tr>

                        <!-- Motivação para os outros -->
                        <tr>
                            <td style="padding: 0 40px 30px; text-align: center;">
                                <p style="color: #737373; font-size: 15px; margin: 0; line-height: 1.7;">
                                    Não subiu ao pódio dessa vez? <strong style="color: #a3a3a3;">Seu momento está chegando!</strong><br>
                                    Cada temporada é uma nova chance. 💪
                                </p>
                            </td>
                        </tr>
                        
                        <!-- CTA para Próxima Temporada -->
                        <tr>
                            <td style="padding: 10px 40px 50px; text-align: center;">
                                <p style="color: #f59e0b; font-size: 16px; margin: 0 0 25px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                                    🚀 Nova temporada começando!
                                </p>
                                <a href="https://profissionaislegendarios.com.br/rota-valente" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #22c55e 50%, #16a34a 100%); color: white; text-decoration: none; padding: 22px 60px; border-radius: 16px; font-weight: 900; font-size: 18px; text-transform: uppercase; letter-spacing: 2px; box-shadow: 0 12px 40px rgba(34, 197, 94, 0.45), inset 0 2px 0 rgba(255,255,255,0.2);">
                                    ⚡ QUERO COMPETIR
                                </a>
                            </td>
                        </tr>
                        
                        <!-- Footer Premium -->
                        <tr>
                            <td style="padding: 30px 40px; background: linear-gradient(180deg, #0a0a0a 0%, #030712 100%); text-align: center; border-top: 1px solid #1f2937;">
                                <p style="margin: 0 0 12px; color: #22c55e; font-size: 14px; font-weight: 600;">
                                    💚 Você faz parte de algo LENDÁRIO!
                                </p>
                                <p style="margin: 0; color: #404040; font-size: 11px; line-height: 1.7;">
                                    Profissionais Legendários © ${new Date().getFullYear()}<br>
                                    Você recebeu este email por ser membro da comunidade.
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

