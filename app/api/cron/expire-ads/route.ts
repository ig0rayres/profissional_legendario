import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * CRON: Expiração automática de anúncios do Marketplace
 * 
 * Este endpoint é chamado diariamente às 00:05 (via Vercel Cron)
 * 
 * Funções:
 * 1. Marca como 'expired' anúncios que passaram da data de expiração
 * 2. (Futuro) Envia notificações de "seu anúncio está para expirar"
 */

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
        const now = new Date().toISOString()
        const results: string[] = []

        console.log(`[CRON EXPIRE-ADS] Executando em ${now}`)

        // 1. Buscar anúncios ativos que já expiraram
        const { data: expiredAds, error: fetchError } = await supabase
            .from('marketplace_ads')
            .select('id, title, user_id, expires_at')
            .eq('status', 'active')
            .lt('expires_at', now)

        if (fetchError) {
            console.error('[CRON EXPIRE-ADS] Erro ao buscar anúncios:', fetchError)
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        if (!expiredAds || expiredAds.length === 0) {
            console.log('[CRON EXPIRE-ADS] Nenhum anúncio para expirar')
            return NextResponse.json({
                success: true,
                date: now,
                expired_count: 0,
                message: 'Nenhum anúncio expirado'
            })
        }

        console.log(`[CRON EXPIRE-ADS] Encontrados ${expiredAds.length} anúncios expirados`)

        // 2. Atualizar status para 'expired'
        const expiredIds = expiredAds.map(ad => ad.id)

        const { error: updateError } = await supabase
            .from('marketplace_ads')
            .update({
                status: 'expired',
                updated_at: now
            })
            .in('id', expiredIds)

        if (updateError) {
            console.error('[CRON EXPIRE-ADS] Erro ao atualizar anúncios:', updateError)
            return NextResponse.json({ error: updateError.message }, { status: 500 })
        }

        // 3. Criar notificações para os donos dos anúncios
        const notifications = expiredAds.map(ad => ({
            user_id: ad.user_id,
            type: 'marketplace_expired',
            title: 'Anúncio Expirado',
            message: `Seu anúncio "${ad.title}" expirou. Renove para continuar visível no Marketplace.`,
            data: { ad_id: ad.id },
            is_read: false
        }))

        const { error: notifError } = await supabase
            .from('notifications')
            .insert(notifications)

        if (notifError) {
            console.warn('[CRON EXPIRE-ADS] Erro ao criar notificações:', notifError)
            // Não falha o cron por causa de notificações
        }

        // Log dos resultados
        for (const ad of expiredAds) {
            results.push(`✅ Expirado: "${ad.title}"`)
        }

        console.log(`[CRON EXPIRE-ADS] ${expiredAds.length} anúncios expirados com sucesso`)

        return NextResponse.json({
            success: true,
            date: now,
            expired_count: expiredAds.length,
            results
        })

    } catch (error: any) {
        console.error('[CRON EXPIRE-ADS] Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Também permitir POST para testes manuais
export async function POST(request: NextRequest) {
    return GET(request)
}
