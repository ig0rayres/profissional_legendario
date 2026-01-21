import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

/**
 * API de Impersonate para Admin
 * 
 * Gera um OTP e retorna para fazer verificação direta
 */
export async function POST(request: NextRequest) {
    try {
        const { userId, email } = await request.json()

        console.log('📧 Impersonate request:', { userId, email })

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
            console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada')
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

        // Usar generateLink para criar um magic link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

        console.log('🔗 Gerando magic link para:', email)

        const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: `${baseUrl}/dashboard`
            }
        })

        console.log('🔗 Resultado generateLink:', JSON.stringify(data, null, 2))

        if (linkError) {
            console.error('❌ Erro ao gerar magic link:', linkError)
            return NextResponse.json(
                { error: linkError.message },
                { status: 500 }
            )
        }

        // Retornar tanto o magic link quanto o OTP para verificação alternativa
        return NextResponse.json({
            success: true,
            email: email,
            magicLink: data.properties?.action_link,
            otp: data.properties?.email_otp,
            hashedToken: data.properties?.hashed_token
        })

    } catch (error: any) {
        console.error('❌ Erro no impersonate:', error)
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        )
    }
}
