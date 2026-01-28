import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * API para executar migrations - USE COM CUIDADO!
 * GET /api/admin/migrate?action=add-metadata
 */

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false } }
    )

    if (action === 'add-metadata') {
        // Verificar se coluna existe tentando fazer select
        const { error: checkError } = await supabaseAdmin
            .from('posts')
            .select('metadata')
            .limit(1)

        if (checkError && checkError.message.includes('does not exist')) {
            // Coluna não existe - precisa criar via SQL Editor no Supabase Dashboard
            return NextResponse.json({
                success: false,
                message: 'Coluna metadata não existe. Por favor, execute este SQL no Supabase Dashboard:',
                sql: 'ALTER TABLE posts ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT NULL;'
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Coluna metadata já existe!'
        })
    }

    return NextResponse.json({
        error: 'Ação não reconhecida',
        available: ['add-metadata']
    }, { status: 400 })
}
