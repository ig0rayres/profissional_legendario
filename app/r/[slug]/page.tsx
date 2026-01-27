import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

interface Props {
    params: Promise<{ slug: string }>
}

export default async function ReferralPage({ params }: Props) {
    const { slug } = await params
    const supabase = await createClient()

    // Validar se o slug existe
    const { data: referrer } = await supabase
        .from('profiles')
        .select('id, full_name, slug')
        .eq('slug', slug)
        .single()

    if (!referrer) {
        // Slug inválido, redireciona para home
        redirect('/')
    }

    // Salvar código de indicação em cookie (30 dias)
    const cookieStore = await cookies()
    cookieStore.set('referral_code', slug, {
        maxAge: 60 * 60 * 24 * 30, // 30 dias
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    // Redirecionar para página de cadastro
    redirect('/auth/register')
}
