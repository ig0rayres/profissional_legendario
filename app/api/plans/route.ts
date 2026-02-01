import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Client com service_role key que bypassa RLS (criado no nível do módulo)
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

// API pública para listar planos disponíveis para cadastro
// Usa service role key para bypass de RLS
export async function GET() {
    try {
        const { data, error } = await supabaseAdmin
            .from('plan_config')
            .select('tier, name, price, features, display_order, description')
            .eq('is_active', true)
            .order('display_order')

        if (error) {
            console.error('[API Plans] Error fetching plans:', error)
            return NextResponse.json({ error: 'Failed to fetch plans', details: error.message }, { status: 500 })
        }

        if (!data || data.length === 0) {
            console.log('[API Plans] No plans found')
            return NextResponse.json([])
        }

        // Mapear para formato esperado pelo frontend
        const plans = data.map(plan => ({
            id: plan.tier,
            name: plan.name,
            monthly_price: plan.price,  // Renomear price -> monthly_price para frontend
            features: plan.features || [],
            display_order: plan.display_order,
            description: plan.description
        }))

        return NextResponse.json(plans)
    } catch (err: any) {
        console.error('[API Plans] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 })
    }
}
