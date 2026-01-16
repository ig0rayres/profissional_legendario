// ============================================
// Utils: Google Calendar Integration
// Gerar links para adicionar eventos
// ============================================

/**
 * Gera URL do Google Calendar para adicionar evento
 */
export function generateGoogleCalendarUrl(params: {
    title: string
    description?: string
    location?: string
    startTime: Date
    endTime?: Date
}): string {
    const { title, description, location, startTime, endTime } = params

    // Formato: YYYYMMDDTHHmmssZ
    const formatDateForGoogle = (date: Date): string => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
    }

    // Se não tiver endTime, assume 2 horas
    const end = endTime || new Date(startTime.getTime() + 2 * 60 * 60 * 1000)

    const params_obj = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${formatDateForGoogle(startTime)}/${formatDateForGoogle(end)}`,
        details: description || '',
        location: location || '',
        ctz: 'America/Sao_Paulo' // Timezone
    })

    return `https://www.google.com/calendar/render?${params_obj.toString()}`
}

/**
 * Gera dados do evento de confraternização para Google Calendar
 */
export function generateConfraternityCalendarEvent(
    otherMemberName: string,
    proposedDate: string,
    location?: string,
    message?: string
): string {
    const startTime = new Date(proposedDate)

    const title = `⚔️ Confraria com ${otherMemberName}`

    const description = [
        '🤝 Confraternização - Rota Business Club',
        '',
        message || 'Networking profissional',
        '',
        '💡 Dica: Leve cartões de visita e esteja preparado para uma ótima conversa!',
        '',
        '🎁 Ao realizar: +50 XP + bônus por fotos e depoimentos'
    ].join('\n')

    return generateGoogleCalendarUrl({
        title,
        description,
        location,
        startTime
    })
}

/**
 * Abrir Google Calendar em nova aba
 */
export function openGoogleCalendar(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer')
}
