/**
 * API: Get Current Season Participants Count
 * Retorna número de participantes ativos EXCLUINDO admin/rotabusiness
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const EXCLUDED_EMAILS = [
    'admin@rotabusinessclub.com.br',
    'sistema@rotabusinessclub.com.br',
    'rotabusiness@rotabusinessclub.com.br'
]

export async function GET() {
    try {
        const supabase = await createClient()

        // Contar profiles excluindo admin/sistema
        const { count, error } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .not('email', 'in', `(${EXCLUDED_EMAILS.join(',')})`)

        if (error) throw error

        return NextResponse.json({
            count: count || 0,
            excludedEmails: EXCLUDED_EMAILS
        })

    } catch (error: any) {
        console.error('Error getting participants count:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
