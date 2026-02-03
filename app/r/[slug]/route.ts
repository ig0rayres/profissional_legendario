import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * GET /r/{slug}
 * 
 * Rota de afiliados - salva cookie e redireciona para registro
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params
        const supabase = await createClient()

        // Validar se o slug existe
        const { data: referrer, error } = await supabase
            .from('profiles')
            .select('id, full_name, slug')
            .eq('slug', slug)
            .single()

        if (error || !referrer) {
            // Slug inválido, redireciona para home
            return NextResponse.redirect(new URL('/', request.url))
        }

        // Salvar código de indicação em cookie (30 dias) E passar na URL
        const registerUrl = new URL('/auth/register', request.url)
        registerUrl.searchParams.set('ref', slug)

        const response = NextResponse.redirect(registerUrl)

        response.cookies.set('referral_code', slug, {
            maxAge: 60 * 60 * 24 * 30, // 30 dias
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        })

        console.log(`[Referral] Cookie salvo para slug: ${slug}, referrer: ${referrer.full_name}`)

        return response

    } catch (error) {
        console.error('[Referral] Erro:', error)
        return NextResponse.redirect(new URL('/', request.url))
    }
}
