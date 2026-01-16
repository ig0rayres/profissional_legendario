import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // 1. Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get user profile to check CPF
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('cpf, verification_status')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.verification_status === 'verified') {
        return NextResponse.json({ message: 'Already verified' })
    }

    // 3. MOCK VALIDATION LOGIC
    // In a real scenario, we would call an external API here.
    // For now, we just check if the CPF is valid mathematically (simplified) or just approve.

    const cpf = profile.cpf.replace(/\D/g, '')

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Mock Rule: Reject specific CPFs for testing, approve others
    const isValid = cpf.length === 11 && cpf !== '00000000000'

    if (!isValid) {
        await supabase
            .from('profiles')
            .update({
                verification_status: 'rejected',
                document_data: {
                    last_check: new Date().toISOString(),
                    reason: 'CPF inválido na base federal (Simulado)'
                }
            })
            .eq('id', user.id)

        return NextResponse.json({ error: 'CPF verification failed' }, { status: 400 })
    }

    // 4. Update profile status
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            verification_status: 'verified',
            document_data: {
                last_check: new Date().toISOString(),
                source: 'MOCK_API_V1'
            }
        })
        .eq('id', user.id)

    if (updateError) {
        return NextResponse.json({ error: 'Failed to update status' }, { status: 500 })
    }

    return NextResponse.json({ success: true, status: 'verified' })
}
