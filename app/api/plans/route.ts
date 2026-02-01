import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// API pública para listar planos disponíveis para cadastro
// Usa service role key para bypass de RLS
export async function GET() {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('[API Plans] Missing Supabase credentials')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Usar service role para bypass de RLS
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data, error } = await supabase
            .from('plan_config')
            .select('tier, name, monthly_price, benefits, display_order, description')
            .eq('is_active', true)
            .order('display_order')

        if (error) {
            console.error('[API Plans] Error fetching plans:', error)
            return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 })
        }

        // Mapear para formato esperado pelo frontend
        const plans = data.map(plan => ({
            id: plan.tier,
            name: plan.name,
            monthly_price: plan.monthly_price,
            features: plan.benefits || [],
            display_order: plan.display_order,
            description: plan.description
        }))

        return NextResponse.json(plans)
    } catch (err) {
        console.error('[API Plans] Unexpected error:', err)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
