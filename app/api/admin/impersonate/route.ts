import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Impersonate para Admin
 * 
 * IMPORTANTE: Não altera a senha do usuário!
 * Usa magic link para fazer login seguro.
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, email } = await request.json()

        if (!userId || !email) {
            return NextResponse.json(
                { error: 'userId e email são obrigatórios' },
                { status: 400 }
            )
        }

        // Criar cliente admin com service role key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!serviceRoleKey) {
            return NextResponse.json(
                { error: 'SUPABASE_SERVICE_ROLE_KEY não configurada' },
                { status: 500 }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Usar generateLink para criar um magic link SEM alterar a senha
        const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`
            }
        })

        if (linkError) {
            console.error('Erro ao gerar magic link:', linkError)
            return NextResponse.json(
                { error: linkError.message },
                { status: 500 }
            )
        }

        // Retornar o magic link
        return NextResponse.json({
            success: true,
            email: email,
            magicLink: data.properties?.action_link
        })

    } catch (error: any) {
        console.error('Erro no impersonate:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
