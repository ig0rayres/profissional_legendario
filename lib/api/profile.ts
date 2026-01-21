/**
 * Helper function to check if user's profile is complete
 * Used for gamification - awards badge when 100% complete
 * USA TABELA: user_medals (fonte centralizada)
 */
export async function checkProfileCompletion(userId: string): Promise<boolean> {
    console.log('[checkProfileCompletion] Iniciando para userId:', userId)

    try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // Get user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (profileError) {
            console.error('[checkProfileCompletion] Erro ao buscar perfil:', profileError)
            return false
        }

        if (!profile) {
            console.log('[checkProfileCompletion] Perfil não encontrado')
            return false
        }

        // Check required fields for "100% complete" profile
        const requiredFields = [
            'full_name',    // Nome completo
            'bio',          // Biografia
            'avatar_url',   // Foto de perfil
            'phone',        // Telefone
            'pista'         // Localização/Pista
        ]

        console.log('[checkProfileCompletion] Verificando campos:')
        const fieldStatus = requiredFields.map(field => {
            const value = profile[field]
            const filled = value !== null && value !== '' && value !== undefined
            console.log(`  - ${field}: ${filled ? '✅' : '❌'} (${value ? 'preenchido' : 'vazio'})`)
            return filled
        })

        const isComplete = fieldStatus.every(Boolean)
        console.log('[checkProfileCompletion] Perfil completo?', isComplete)

        if (isComplete) {
            // Check if user already has the medal
            const { awardBadge, getUserBadges } = await import('@/lib/api/gamification')
            const medals = await getUserBadges(userId)
            console.log('[checkProfileCompletion] Medalhas do usuário:', medals.map(m => m.badge_id))

            const hasMedal = medals.some(m => m.badge_id === 'alistamento_concluido')
            console.log('[checkProfileCompletion] Já tem alistamento_concluido?', hasMedal)

            if (!hasMedal) {
                // Profile just became 100% complete!
                console.log('[checkProfileCompletion] Concedendo medalha...')
                const result = await awardBadge(userId, 'alistamento_concluido')
                console.log('[checkProfileCompletion] Resultado:', result)
                return true
            }
        }

        return isComplete
    } catch (error) {
        console.error('[checkProfileCompletion] Exception:', error)
        return false
    }
}
