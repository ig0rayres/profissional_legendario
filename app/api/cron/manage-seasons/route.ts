import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

/**
 * CRON: Gerenciamento automático de temporadas
 * 
 * Este endpoint deve ser chamado diariamente (via Vercel Cron ou similar)
 * 
 * Funções:
 * 1. Encerra temporadas que passaram da data final
 * 2. Ativa a próxima temporada agendada
 * 3. Envia emails de encerramento/abertura
 */

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

export async function GET(request: NextRequest) {
    // Verificar token de segurança (para cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Em desenvolvimento, permite sem token
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    try {
        const supabase = getSupabaseAdmin()
        const today = new Date().toISOString().split('T')[0]
        const results: string[] = []

        console.log(`[CRON SEASONS] Executando em ${today}`)

        // 1. Buscar temporada ativa que já deveria ter encerrado
        const { data: expiredSeasons } = await supabase
            .from('seasons')
            .select('*')
            .eq('is_active', true)
            .lt('end_date', today)

        if (expiredSeasons && expiredSeasons.length > 0) {
            for (const season of expiredSeasons) {
                console.log(`[CRON] Encerrando temporada: ${season.name}`)

                // Buscar top 3 do ranking
                const { data: ranking } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, xp')
                    .order('xp', { ascending: false })
                    .limit(3)

                // Salvar vencedores
                if (ranking && ranking.length >= 3) {
                    for (let i = 0; i < 3; i++) {
                        await supabase.from('season_winners').insert({
                            season_id: season.id,
                            user_id: ranking[i].id,
                            position: i + 1,
                            xp_earned: ranking[i].xp
                        })
                    }
                }

                // Marcar como encerrada
                await supabase
                    .from('seasons')
                    .update({ is_active: false, status: 'finished' })
                    .eq('id', season.id)

                // Enviar email de encerramento
                try {
                    await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/seasons/send-emails`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            seasonId: season.id,
                            type: 'champions'
                        })
                    })
                    results.push(`✅ Temporada "${season.name}" encerrada e emails enviados`)
                } catch (e) {
                    results.push(`⚠️ Temporada "${season.name}" encerrada (erro no email)`)
                }
            }
        }

        // 2. Buscar próxima temporada agendada que deve iniciar
        const { data: pendingSeasons } = await supabase
            .from('seasons')
            .select('*')
            .eq('status', 'scheduled')
            .lte('start_date', today)
            .gte('end_date', today)
            .order('start_date')
            .limit(1)

        if (pendingSeasons && pendingSeasons.length > 0) {
            const nextSeason = pendingSeasons[0]
            console.log(`[CRON] Ativando temporada: ${nextSeason.name}`)

            // Ativar nova temporada
            await supabase
                .from('seasons')
                .update({ is_active: true, status: 'active' })
                .eq('id', nextSeason.id)

            // Resetar XP de todos (opcional - comentar se não quiser)
            // await supabase.rpc('reset_all_xp')

            // Enviar email de nova temporada
            try {
                await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/seasons/send-emails`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        seasonId: nextSeason.id,
                        type: 'new_season'
                    })
                })
                results.push(`✅ Temporada "${nextSeason.name}" ativada e emails enviados`)
            } catch (e) {
                results.push(`⚠️ Temporada "${nextSeason.name}" ativada (erro no email)`)
            }
        }

        if (results.length === 0) {
            results.push('Nenhuma ação necessária')
        }

        return NextResponse.json({
            success: true,
            date: today,
            actions: results
        })

    } catch (error: any) {
        console.error('[CRON SEASONS] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
