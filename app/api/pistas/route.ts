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

/**
 * GET /api/pistas
 * 
 * Lista pistas ativas - bypass RLS para usuários anônimos
 */
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('pistas')
            .select('id, name, city, state')
            .eq('active', true)
            .order('state')
            .order('city')

        if (error) {
            console.error('[API Pistas] Erro:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data || [])

    } catch (error) {
        console.error('[API Pistas] Erro:', error)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
