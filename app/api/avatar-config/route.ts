import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client com service_role key que bypassa RLS
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

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { context, device, config } = body

        console.log('[API] Salvando config:', { context, device, config })

        // Update direto SEM RLS usando service_role
        const { data, error } = await supabaseAdmin
            .from('avatar_config')
            .update(config)
            .eq('context', context)
            .eq('device', device)
            .select()

        console.log('[API] Resultado:', { data, error })

        if (error) {
            console.error('[API] Erro:', error)
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        if (!data || data.length === 0) {
            console.error('[API] Nenhuma linha atualizada')
            return NextResponse.json({ success: false, error: 'Nenhuma linha atualizada' }, { status: 404 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        console.error('[API] Exceção:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('avatar_config')
            .select('*')
            .order('context', { ascending: true })
            .order('device', { ascending: true })

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, data })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
