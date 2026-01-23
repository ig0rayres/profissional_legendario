import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

// Função para criar cliente admin (chamada dentro da request, não no build)
function getSupabaseAdmin() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Variáveis de ambiente do Supabase não configuradas')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId, userEmail } = await request.json()

        if (!userId) {
            return NextResponse.json({ error: 'userId obrigatório' }, { status: 400 })
        }

        console.log('[Admin] Deletando usuário:', userEmail, userId)

        // Criar cliente admin dentro da request
        const supabaseAdmin = getSupabaseAdmin()

        // 1. Deletar profile (CASCADE vai deletar relacionados)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            console.error('[Admin] Erro ao deletar profile:', profileError)
            return NextResponse.json({ error: profileError.message }, { status: 500 })
        }

        // 2. Deletar do auth.users
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

        if (authError) {
            console.error('[Admin] Erro ao deletar auth user:', authError)
            // Não falha - profile já deletou
        }

        console.log('[Admin] Usuário deletado com sucesso:', userEmail)

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('[Admin] Erro geral:', error)
        return NextResponse.json({ error: error.message || 'Erro interno' }, { status: 500 })
    }
}

