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
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        // Validação detalhada das variáveis de ambiente
        if (!supabaseUrl) {
            console.error('❌ NEXT_PUBLIC_SUPABASE_URL não configurada')
            return NextResponse.json(
                { error: 'Configuração de Supabase URL ausente. Configure NEXT_PUBLIC_SUPABASE_URL no Vercel.' },
                { status: 500 }
            )
        }

        if (!serviceRoleKey) {
            console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada')
            return NextResponse.json(
                { error: 'Configuração de Service Role Key ausente. Configure SUPABASE_SERVICE_ROLE_KEY no Vercel.' },
                { status: 500 }
            )
        }

        // Validar formato básico da service role key (deve começar com 'eyJ')
        if (!serviceRoleKey.startsWith('eyJ')) {
            console.error('❌ SUPABASE_SERVICE_ROLE_KEY parece inválida (não começa com eyJ)')
            return NextResponse.json(
                { error: 'Service Role Key inválida. Verifique se copiou corretamente do Supabase Dashboard.' },
                { status: 500 }
            )
        }

        console.log('🔑 Service Role Key configurada (primeiros 20 chars):', serviceRoleKey.substring(0, 20) + '...')

        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Usar generateLink para criar um magic link
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : 'https://rotabusinessclub.com.br'

        console.log('🔗 Gerando magic link para:', email, 'redirectTo:', `${baseUrl}/dashboard`)

        const { data, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: `${baseUrl}/dashboard`
            }
        })

        if (linkError) {
            console.error('❌ Erro ao gerar magic link:', linkError.message, linkError)

            // Verificar se é erro de API key inválida
            if (linkError.message.includes('Invalid API key') || linkError.message.includes('invalid')) {
                return NextResponse.json(
                    { error: 'Service Role Key inválida ou expirada. Atualize a SUPABASE_SERVICE_ROLE_KEY no Vercel.' },
                    { status: 500 }
                )
            }

            return NextResponse.json(
                { error: linkError.message },
                { status: 500 }
            )
        }

        console.log('✅ Magic link gerado com sucesso')

        // Retornar tanto o magic link quanto o OTP para verificação alternativa
        return NextResponse.json({
            success: true,
            email: email,
            magicLink: data.properties?.action_link,
            otp: data.properties?.email_otp,
            hashedToken: data.properties?.hashed_token
        })

    } catch (error: any) {
        console.error('❌ Erro no impersonate:', error?.message || error)
        return NextResponse.json(
            { error: error?.message || 'Erro interno do servidor' },
            { status: 500 }
        )
    }
}

