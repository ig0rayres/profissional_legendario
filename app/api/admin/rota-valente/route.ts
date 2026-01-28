import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

/**
 * API Admin para gerenciar entidades da Rota do Valente
 * Usa service_role_key para bypassar RLS
 * 
 * Suporta: ranks, medals, proezas, point_actions, daily_missions
 */

const TABLE_MAP: Record<string, string> = {
    ranks: 'ranks',
    medals: 'medals',
    proezas: 'proezas',
    actions: 'point_actions',
    missions: 'daily_missions'
}

// POST - Create or Update
export async function POST(request: NextRequest) {
    try {
        const { table, data, id } = await request.json()

        if (!table || !TABLE_MAP[table]) {
            return NextResponse.json({ error: 'Tabela inválida' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        const tableName = TABLE_MAP[table]

        if (id) {
            // Update
            const { error } = await supabaseAdmin
                .from(tableName)
                .update(data)
                .eq('id', id)

            if (error) {
                console.error(`[Admin API] Update ${tableName} error:`, error)
                return NextResponse.json({ error: error.message }, { status: 400 })
            }

            return NextResponse.json({ success: true, action: 'updated' })
        } else {
            // Insert
            const { error } = await supabaseAdmin
                .from(tableName)
                .insert([data])

            if (error) {
                console.error(`[Admin API] Insert ${tableName} error:`, error)
                return NextResponse.json({ error: error.message }, { status: 400 })
            }

            return NextResponse.json({ success: true, action: 'created' })
        }
    } catch (error: any) {
        console.error('[Admin API] POST Exception:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// DELETE
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const table = searchParams.get('table')
        const id = searchParams.get('id')

        if (!table || !TABLE_MAP[table] || !id) {
            return NextResponse.json({ error: 'Parâmetros inválidos (table, id)' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        const tableName = TABLE_MAP[table]

        const { error } = await supabaseAdmin
            .from(tableName)
            .delete()
            .eq('id', id)

        if (error) {
            console.error(`[Admin API] Delete ${tableName} error:`, error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        console.log(`[Admin API] Deleted ${id} from ${tableName}`)
        return NextResponse.json({ success: true, action: 'deleted' })
    } catch (error: any) {
        console.error('[Admin API] DELETE Exception:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// PATCH - Toggle is_active
export async function PATCH(request: NextRequest) {
    try {
        const { table, id, is_active } = await request.json()

        if (!table || !TABLE_MAP[table] || !id) {
            return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 })
        }

        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false } }
        )

        const tableName = TABLE_MAP[table]

        const { error } = await supabaseAdmin
            .from(tableName)
            .update({ is_active })
            .eq('id', id)

        if (error) {
            console.error(`[Admin API] Toggle ${tableName} error:`, error)
            return NextResponse.json({ error: error.message }, { status: 400 })
        }

        return NextResponse.json({ success: true, action: 'toggled' })
    } catch (error: any) {
        console.error('[Admin API] PATCH Exception:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
