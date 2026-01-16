import { createClient } from '@/lib/supabase/client'

export interface SearchFilters {
    query?: string
    topId?: string
    verificationStatus?: 'verified' | 'pending' | 'rejected'
    minRating?: number
    skills?: string[]
}

export interface SearchResult {
    professionals: any[]
    total: number
}

/**
 * Search professionals with filters
 */
export async function searchProfessionals(
    filters: SearchFilters = {},
    page: number = 1,
    pageSize: number = 12
): Promise<SearchResult> {
    const supabase = createClient()

    let query = supabase
        .from('profiles')
        .select('*, tops(name, slug)', { count: 'exact' })
        .eq('role', 'professional')

    // Text search (name or skills)
    if (filters.query) {
        query = query.or(`full_name.ilike.%${filters.query}%,skills.cs.{${filters.query}}`)
    }

    // Filter by TOP (city)
    if (filters.topId) {
        query = query.eq('top_id', filters.topId)
    }

    // Filter by verification status
    if (filters.verificationStatus) {
        query = query.eq('verification_status', filters.verificationStatus)
    }

    // Filter by minimum rating
    if (filters.minRating) {
        query = query.gte('average_rating', filters.minRating)
    }

    // Filter by skills
    if (filters.skills && filters.skills.length > 0) {
        query = query.contains('skills', filters.skills)
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    // Order by rating (verified first, then by rating)
    query = query.order('verification_status', { ascending: false })
    query = query.order('average_rating', { ascending: false })

    const { data, error, count } = await query

    if (error) {
        console.error('Search error:', error)
        return { professionals: [], total: 0 }
    }

    return {
        professionals: data || [],
        total: count || 0,
    }
}

/**
 * Get all available TOPs for filter dropdown
 */
export async function getAllTops() {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('tops')
        .select('*')
        .order('name')

    if (error) {
        console.error('Error fetching TOPs:', error)
        return []
    }

    return data || []
}

/**
 * Get unique skills from all professionals
 */
export async function getAllSkills(): Promise<string[]> {
    const supabase = createClient()

    const { data, error } = await supabase
        .from('profiles')
        .select('skills')
        .eq('role', 'professional')

    if (error) {
        console.error('Error fetching skills:', error)
        return []
    }

    // Flatten and deduplicate skills
    const allSkills = data
        ?.flatMap(p => p.skills || [])
        .filter((skill, index, self) => self.indexOf(skill) === index)
        .sort()

    return allSkills || []
}
