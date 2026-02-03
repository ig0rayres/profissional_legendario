import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client admin para bypass de RLS
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
)

/**
 * POST /api/profile/ensure
 * 
 * Garante que o perfil do usuário existe.
 * FALLBACK para quando o trigger handle_new_user não executa.
 * TAMBÉM processa o código de indicação!
 */
export async function POST(request: Request) {
    try {
        const { userId, email, fullName, cpf, role, rotaNumber, pistaId, plan, referralCode } = await request.json()

        if (!userId || !email) {
            return NextResponse.json({ error: 'userId e email são obrigatórios' }, { status: 400 })
        }

        // Verificar se perfil já existe
        const { data: existing } = await supabaseAdmin
            .from('profiles')
            .select('id')
            .eq('id', userId)
            .maybeSingle()

        if (existing) {
            // Perfil já existe - mas ainda precisamos processar indicação se não foi processada
            if (referralCode) {
                await processReferral(userId, referralCode)
            }
            return NextResponse.json({ success: true, message: 'Perfil já existe' })
        }

        // Criar perfil
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                email,
                full_name: fullName || email.split('@')[0],
                cpf: cpf || null,
                role: role || 'user',
                rota_number: rotaNumber || null,
                pista_id: pistaId || null,
                verification_status: 'pending'
            })
            .single()

        if (profileError) {
            console.error('[API ensure] Erro ao criar perfil:', profileError)
            return NextResponse.json({ error: profileError.message }, { status: 500 })
        }

        // Criar subscription
        await supabaseAdmin
            .from('subscriptions')
            .insert({
                user_id: userId,
                plan_id: plan || 'recruta',
                status: 'active'
            })
            .single()

        // Criar gamification
        await supabaseAdmin
            .from('user_gamification')
            .insert({
                user_id: userId,
                current_rank_id: 'novato',
                total_points: 0,
                total_medals: 0
            })
            .single()

        // NOVO: Processar indicação
        if (referralCode) {
            await processReferral(userId, referralCode)
        }

        console.log('[API ensure] Perfil criado com sucesso para:', email, referralCode ? `(indicado por ${referralCode})` : '')
        return NextResponse.json({ success: true, message: 'Perfil criado!' })

    } catch (error) {
        console.error('[API ensure] Erro:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}

/**
 * Processa indicação: busca referrer pelo slug e cria registro
 */
async function processReferral(referredId: string, referralCode: string) {
    try {
        // Verificar se já existe indicação
        const { data: existingRef } = await supabaseAdmin
            .from('referrals')
            .select('id')
            .eq('referred_id', referredId)
            .maybeSingle()

        if (existingRef) {
            console.log('[API ensure] Indicação já existe para:', referredId)
            return
        }

        // Buscar referrer pelo slug
        const { data: referrer } = await supabaseAdmin
            .from('profiles')
            .select('id, full_name')
            .eq('slug', referralCode)
            .maybeSingle()

        if (!referrer) {
            console.log('[API ensure] Referrer não encontrado:', referralCode)
            return
        }

        // Criar indicação
        const { error } = await supabaseAdmin
            .from('referrals')
            .insert({
                referrer_id: referrer.id,
                referred_id: referredId,
                referral_code: referralCode,
                status: 'pending'
            })

        if (error) {
            console.error('[API ensure] Erro ao criar indicação:', error)
        } else {
            console.log(`[API ensure] ✅ Indicação criada: ${referredId} indicado por ${referrer.full_name} (${referralCode})`)
        }
    } catch (err) {
        console.error('[API ensure] Erro ao processar indicação:', err)
    }
}
