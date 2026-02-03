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
 */
export async function POST(request: Request) {
    try {
        const { userId, email, fullName, cpf, role, rotaNumber, pistaId, plan } = await request.json()

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

        console.log('[API ensure] Perfil criado com sucesso para:', email)
        return NextResponse.json({ success: true, message: 'Perfil criado!' })

    } catch (error) {
        console.error('[API ensure] Erro:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
