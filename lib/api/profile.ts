/**
 * Helper function to check if user's profile is complete
 * Used for gamification - awards badge when 100% complete
 */
export async function checkProfileCompletion(userId: string): Promise<boolean> {
    try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        // Get user profile
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        if (!profile) return false

        // Check required fields
        const requiredFields = [
            'full_name',
            'email',
            'bio',
            'avatar_url',
            'location',
            'phone'
        ]

        const isComplete = requiredFields.every(field => {
            const value = profile[field]
            return value !== null && value !== '' && value !== undefined
        })

        if (isComplete) {
            // Check if user already has the badge
            const { awardBadge, getUserBadges } = await import('@/lib/api/gamification')
            const badges = await getUserBadges(userId)
            const hasBadge = badges.some(b => b.badge_id === 'alistamento_concluido')

            if (!hasBadge) {
                // Profile just became 100% complete!
                await awardBadge(userId, 'alistamento_concluido')
                console.log('✅ Awarded Alistamento Concluído badge to user:', userId)
                return true
            }
        }

        return isComplete
    } catch (error) {
        console.error('Error checking profile completion:', error)
        return false
    }
}
