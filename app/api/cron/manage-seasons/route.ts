import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getSeasonStartEmailTemplate, getSeasonEndEmailTemplate } from '@/lib/services/season-emails'
import { getTopUsersForSeason } from '@/lib/services/ranking'

/**
 * CRON: Gerenciamento automático de temporadas
 * 
 * Executa diariamente (00:00 via Vercel Cron)
 * 
 * Funções:
 * 1. Encerra temporadas expiradas (end_date < hoje)
 * 2. Registra top 3 como vencedores (EXCLUINDO admin/rotabusiness)
 * 3. ZERA monthly_vigor de TODOS (mantém total_points e medalhas)
 * 4. Envia email de encerramento
 * 5. Ativa próxima temporada agendada
 * 6. Envia email de nova temporada
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

function getMonthName(month: number): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return months[month - 1]
}

export async function GET(request: NextRequest) {
    // Verificar token de segurança
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    try {
        const supabase = getSupabaseAdmin()
        const today = new Date().toISOString().split('T')[0]
        const results: string[] = []

        console.log(`[CRON SEASONS] 🕐 Executando em ${today}`)

        // ============================================
        // 1. ENCERRAR TEMPORADAS EXPIRADAS
        // ============================================
        const { data: expiredSeasons } = await supabase
            .from('seasons')
            .select('*')
            .eq('status', 'active')
            .lt('end_date', today)

        if (expiredSeasons && expiredSeasons.length > 0) {
            for (const season of expiredSeasons) {
                console.log(`[CRON] 🏁 Encerrando temporada: ${season.name}`)

                // ✅ QUERY CENTRALIZADA: getTopUsersForSeason (exclui admin/rotabusiness)
                const topUsers = await getTopUsersForSeason(supabase, 3)

                console.log(`[CRON] Top 3 encontrados: ${topUsers.length} usuários (admin/rotabusiness EXCLUÍDOS)`)

                // Salvar vencedores
                if (topUsers.length >= 3) {
                    for (let i = 0; i < 3; i++) {
                        const winner = topUsers[i]
                        await supabase.from('season_winners').insert({
                            season_id: season.id,
                            user_id: winner.user_id,
                            position: i + 1,
                            xp_earned: winner.total_points
                        })
                    }
                    console.log(`[CRON] ✅ Top 3 registrados`)
                } else {
                    console.log(`[CRON] ⚠️ Menos de 3 usuários elegíveis (${topUsers.length})`)
                }

                // Marcar temporada como finished
                await supabase
                    .from('seasons')
                    .update({

                        status: 'finished',
                        finished_at: new Date().toISOString()
                    })
                    .eq('id', season.id)

                // ✅ ZERAR MONTHLY_VIGOR (CRÍTICO!)
                console.log('[CRON] 🔄 Zerando monthly_vigor de TODOS os usuários...')
                const { data: resetResult } = await supabase.rpc('reset_monthly_vigor')

                if (resetResult && Array.isArray(resetResult) && resetResult.length > 0) {
                    const { users_affected, total_points_reset } = resetResult[0]
                    console.log(`[CRON] ✅ Reset concluído:`)
                    console.log(`       - ${users_affected} usuários afetados`)
                    console.log(`       - ${total_points_reset} pontos zerados`)
                    console.log(`       - Medalhas PRESERVADAS`)
                }

                // Preparar dados para email de encerramento
                const winners = topUsers.slice(0, 3).map((winner, idx) => ({
                    position: idx + 1,
                    userName: winner.full_name,
                    userAvatar: winner.avatar_url,
                    prize: `${idx + 1}º Lugar`
                }))


                const { data: prizes } = await supabase
                    .from('season_prizes')
                    .select('position, title, image_url')
                    .eq('season_id', season.id)
                    .order('position')
                    .limit(3)

                // TODO: Enviar email de encerramento
                // const html = getSeasonEndEmailTemplate({
                //     seasonName: season.name,
                //     monthYear: `${getMonthName(season.month)}/${season.year}`,
                //     prizes: prizes || [],
                //     winners: winners || []
                // })
                // await sendEmailToAllUsers(html, 'Temporada Encerrada')

                results.push(`✅ Temporada "${season.name}" encerrada e monthly_vigor resetado`)
            }
        }

        // ============================================
        // 2. ATIVAR PRÓXIMA TEMPORADA AGENDADA
        // ============================================
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
            console.log(`[CRON] 🚀 Ativando temporada: ${nextSeason.name}`)

            // Ativar nova temporada
            await supabase
                .from('seasons')
                .update({ status: 'active' })
                .eq('id', nextSeason.id)

            // Buscar prêmios da nova temporada
            const { data: newPrizes } = await supabase
                .from('season_prizes')
                .select('position, title, image_url')
                .eq('season_id', nextSeason.id)
                .order('position')

            // TODO: Enviar email de nova temporada
            // const html = getSeasonStartEmailTemplate({
            //     seasonName: nextSeason.name,
            //     monthYear: `${getMonthName(nextSeason.month)}/${nextSeason.year}`,
            //     prizes: newPrizes || []
            // })
            // await sendEmailToAllUsers(html, 'Nova Temporada')

            results.push(`✅ Temporada "${nextSeason.name}" ativada`)
        }

        if (results.length === 0) {
            results.push('✅ Nenhuma ação necessária (temporadas em dia)')
        }

        console.log('[CRON] ✅ Processo concluído com sucesso')

        return NextResponse.json({
            success: true,
            date: today,
            actions: results
        })

    } catch (error: any) {
        console.error('[CRON SEASONS] ❌ Erro:', error)
        return NextResponse.json({
            error: error.message,
            stack: error.stack
        }, { status: 500 })
    }
}
