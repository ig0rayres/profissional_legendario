// Templates de email para o sistema de temporadas Rota Valente

interface SeasonEmailData {
    seasonName: string
    monthYear: string // Ex: "Janeiro 2026"
    prizes: Array<{
        position: number
        title: string
        imageUrl?: string
    }>
    winners?: Array<{
        position: number
        userName: string
        userAvatar?: string
        prize: string
    }>
}

// Cores padrão da plataforma
const COLORS = {
    primary: '#16a34a', // Verde
    secondary: '#f59e0b', // Dourado
    dark: '#1a1a1a',
    gold: '#fbbf24',
    silver: '#9ca3af',
    bronze: '#d97706'
}

/**
 * Template de email para INÍCIO DE TEMPORADA
 * Enviado quando uma nova temporada começa, apresentando os prêmios
 */
export function getSeasonStartEmailTemplate(data: SeasonEmailData): string {
    const { monthYear, prizes } = data

    const prizeRows = prizes.map(prize => {
        const positionColor = prize.position === 1 ? COLORS.gold :
            prize.position === 2 ? COLORS.silver : COLORS.bronze
        const positionLabel = prize.position === 1 ? '🥇 1º LUGAR' :
            prize.position === 2 ? '🥈 2º LUGAR' : '🥉 3º LUGAR'

        return `
            <tr>
                <td style="padding: 15px; text-align: center;">
                    <div style="background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%); border-radius: 12px; padding: 20px; border: 2px solid ${positionColor};">
                        ${prize.imageUrl ? `<img src="${prize.imageUrl}" alt="${prize.title}" style="max-width: 150px; max-height: 150px; object-fit: contain; margin-bottom: 15px;" />` : ''}
                        <p style="color: ${positionColor}; font-weight: bold; font-size: 16px; margin: 10px 0;">${positionLabel}</p>
                        <p style="color: #ffffff; font-size: 14px; margin: 0;">${prize.title}</p>
                    </div>
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
    <title>Nova Temporada - Rota Valente</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #333;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${COLORS.primary} 0%, #15803d 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">
                                🏆 NOVA TEMPORADA
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0;">
                                Prêmios de ${monthYear}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Intro -->
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                                A nova temporada <strong style="color: ${COLORS.primary};">Rota Valente</strong> começou!<br>
                                Complete missões, ganhe medalhas e conquiste seu lugar no pódio.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Prêmios -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h2 style="color: ${COLORS.secondary}; text-align: center; font-size: 20px; margin-bottom: 20px;">
                                🎁 PRÊMIOS DO MÊS
                            </h2>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                ${prizeRows}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- CTA -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            <a href="https://profissionaislegendarios.com.br/rota-valente" 
                               style="display: inline-block; background: linear-gradient(135deg, ${COLORS.primary} 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; text-transform: uppercase;">
                                ⚡ PARTICIPAR AGORA
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                Profissionais Legendários © ${new Date().getFullYear()}<br>
                                Você está recebendo este email por ser membro da comunidade.
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

/**
 * Template de email para ENCERRAMENTO DE TEMPORADA
 * Enviado quando a temporada acaba, anunciando os ganhadores
 */
export function getSeasonEndEmailTemplate(data: SeasonEmailData): string {
    const { monthYear, prizes, winners = [] } = data

    const winnerRows = winners.map(winner => {
        const positionColor = winner.position === 1 ? COLORS.gold :
            winner.position === 2 ? COLORS.silver : COLORS.bronze
        const positionEmoji = winner.position === 1 ? '🥇' :
            winner.position === 2 ? '🥈' : '🥉'
        const medal = winner.position === 1 ? '🏆' :
            winner.position === 2 ? '🥈' : '🥉'

        return `
            <tr>
                <td style="padding: 10px;">
                    <div style="background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%); border-radius: 12px; padding: 20px; border-left: 4px solid ${positionColor}; display: flex; align-items: center;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                                <td width="60" style="text-align: center; vertical-align: middle;">
                                    <span style="font-size: 32px;">${medal}</span>
                                </td>
                                <td style="padding-left: 15px;">
                                    <p style="color: ${positionColor}; font-weight: bold; font-size: 14px; margin: 0 0 5px;">
                                        ${positionEmoji} ${winner.position}º LUGAR
                                    </p>
                                    <p style="color: #ffffff; font-size: 18px; font-weight: bold; margin: 0 0 5px;">
                                        ${winner.userName}
                                    </p>
                                    <p style="color: #888; font-size: 13px; margin: 0;">
                                        Prêmio: <span style="color: ${COLORS.secondary};">${winner.prize}</span>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
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
    <title>Temporada Encerrada - Rota Valente</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #1a1a1a 0%, #0d0d0d 100%); border-radius: 16px; overflow: hidden; border: 1px solid #333;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${COLORS.secondary} 0%, #d97706 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-transform: uppercase; letter-spacing: 2px;">
                                🏆 TEMPORADA ENCERRADA
                            </h1>
                            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 10px 0 0;">
                                ${monthYear}
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Intro -->
                    <tr>
                        <td style="padding: 30px; text-align: center;">
                            <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin: 0;">
                                A temporada de ${monthYear} chegou ao fim!<br>
                                Confira os <strong style="color: ${COLORS.secondary};">CAMPEÕES</strong> que conquistaram o pódio:
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Ganhadores -->
                    <tr>
                        <td style="padding: 0 30px 30px;">
                            <h2 style="color: ${COLORS.gold}; text-align: center; font-size: 22px; margin-bottom: 20px;">
                                🎖️ PÓDIO OFICIAL
                            </h2>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                ${winnerRows}
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Parabéns -->
                    <tr>
                        <td style="padding: 0 30px 30px; text-align: center;">
                            <div style="background: linear-gradient(135deg, rgba(22, 163, 74, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%); border: 1px solid ${COLORS.primary}; border-radius: 12px; padding: 20px;">
                                <p style="color: #ffffff; font-size: 16px; margin: 0;">
                                    🎉 <strong>Parabéns aos vencedores!</strong><br>
                                    <span style="color: #888; font-size: 14px;">Entraremos em contato para a entrega dos prêmios.</span>
                                </p>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Nova Temporada -->
                    <tr>
                        <td style="padding: 0 30px 40px; text-align: center;">
                            <p style="color: #888; font-size: 14px; margin-bottom: 15px;">
                                A próxima temporada já está chegando!
                            </p>
                            <a href="https://profissionaislegendarios.com.br/rota-valente" 
                               style="display: inline-block; background: linear-gradient(135deg, ${COLORS.primary} 0%, #15803d 100%); color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; text-transform: uppercase;">
                                🚀 PREPARAR PARA A PRÓXIMA
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0a0a0a; padding: 20px; text-align: center; border-top: 1px solid #333;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                Profissionais Legendários © ${new Date().getFullYear()}<br>
                                Você está recebendo este email por ser membro da comunidade.
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

/**
 * Gera o assunto do email de início de temporada
 */
export function getSeasonStartEmailSubject(monthYear: string): string {
    return `🏆 Nova Temporada Rota Valente - Prêmios de ${monthYear}!`
}

/**
 * Gera o assunto do email de encerramento de temporada  
 */
export function getSeasonEndEmailSubject(monthYear: string): string {
    return `🎖️ Temporada Encerrada - Confira os Campeões de ${monthYear}!`
}
