import { SupabaseClient } from '@supabase/supabase-js'

// ============================================
// Tipos e Interfaces
// ============================================

export interface PostUser {
    id: string
    full_name: string
    avatar_url: string | null
    slug: string | null
    rota_number: string | null
    rank_id?: string | null
    rank_icon?: string | null
}

export interface PostConfraternity {
    id: string
    date_occurred: string | null
    member1: PostUser | null
    member2: PostUser | null
}

export interface Post {
    id: string
    user_id: string
    content: string | null
    media_urls: string[]
    visibility: 'public' | 'connections' | 'private'
    confraternity_id: string | null
    likes_count: number
    comments_count: number
    created_at: string
    updated_at: string
    user: PostUser
    user_has_liked: boolean
    confraternity: PostConfraternity | null
}

export interface PostQueryOptions {
    feedType: 'global' | 'user' | 'connections' | 'marketplace'
    userId?: string
    currentUserId?: string
    limit?: number
    offset?: number
}

export interface SidebarData {
    ranking: RankingUser[]
    recentMedals: RecentMedal[]
    upcomingConfrarias: UpcomingConfraternity[]
    totalMembers: number
    totalMedals: number
    confraternityThisMonth: number
}

export interface RankingUser {
    id: string
    full_name: string
    avatar_url: string | null
    slug: string | null
    rota_number: string | null
    vigor: number
    rank_id: string | null
}

export interface RecentMedal {
    user_id: string
    medal_id: string
    earned_at: string
    user: {
        full_name: string
        avatar_url: string | null
    }
    medal: {
        name: string
        icon_key: string
    }
}

export interface UpcomingConfraternity {
    id: string
    proposed_date: string
    location: string | null
    sender: PostUser
    receiver: PostUser
}

// ============================================
// Serviço de Posts
// ============================================

export class PostsService {
    private supabase: SupabaseClient

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase
    }

    // Query SELECT simplificada - apenas campos do post, joins feitos separadamente
    private get basePostSelect() {
        return `
            id,
            user_id,
            content,
            media_urls,
            visibility,
            confraternity_id,
            tagged_user_ids,
            likes_count,
            comments_count,
            created_at,
            updated_at
        `
    }

    /**
     * Carrega posts baseado no tipo de feed
     */
    async loadPosts(options: PostQueryOptions): Promise<Post[]> {
        const {
            feedType,
            userId,
            currentUserId,
            limit = 20,
            offset = 0
        } = options

        try {
            let query = this.supabase
                .from('posts')
                .select(this.basePostSelect)
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1)

            // Aplicar filtros baseado no tipo
            if (feedType === 'global') {
                query = query.eq('visibility', 'public')
            } else if (feedType === 'marketplace') {
                // 🆕 Apenas posts do marketplace
                query = query.eq('post_type', 'marketplace').eq('visibility', 'public')
            } else if (feedType === 'user' && userId) {
                // Posts do usuário + posts de confrarias que ele participou + posts onde foi marcado
                const confIds = await this.getUserConfraternityIds(userId)

                // Filtros: autor OU confraria OU marcado
                const filters: string[] = [`user_id.eq.${userId}`]

                if (confIds.length > 0) {
                    filters.push(`confraternity_id.in.(${confIds.join(',')})`)
                }

                // Posts onde o usuário foi marcado (tagged_user_ids contém o userId)
                filters.push(`tagged_user_ids.cs.{${userId}}`)

                query = query.or(filters.join(','))
            } else if (feedType === 'connections' && userId) {
                // Posts públicos ou de conexões
                query = query.in('visibility', ['public', 'connections'])
            }

            const { data, error } = await query

            if (error) throw error
            if (!data || data.length === 0) return []

            const postsData = data as any[]

            // Buscar perfis dos autores
            const userIds = Array.from(new Set(postsData.map(p => p.user_id)))
            const { data: profiles } = await this.supabase
                .from('profiles')
                .select('id, full_name, avatar_url, slug, rota_number')
                .in('id', userIds)

            // Buscar rank_id de cada usuário
            const { data: gamification } = await this.supabase
                .from('user_gamification')
                .select('user_id, current_rank_id')
                .in('user_id', userIds)

            const profileMap = new Map<string, any>()
            profiles?.forEach(p => profileMap.set(p.id, p))

            // Mapa de ranks
            const rankMap = new Map<string, string>()
            gamification?.forEach(g => rankMap.set(g.user_id, g.current_rank_id))

            // Buscar confrarias (se houver)
            const confraternityIds = postsData
                .filter(p => p.confraternity_id)
                .map(p => p.confraternity_id)

            let confraternityMap = new Map<string, any>()
            if (confraternityIds.length > 0) {
                const { data: confs } = await this.supabase
                    .from('confraternity_invites')
                    .select('id, proposed_date, sender_id, receiver_id')
                    .in('id', confraternityIds)

                // Buscar membros das confrarias
                const memberIds = Array.from(new Set([
                    ...(confs?.map(c => c.sender_id) || []),
                    ...(confs?.map(c => c.receiver_id) || [])
                ].filter(Boolean)))

                let memberMap = new Map<string, any>()
                if (memberIds.length > 0) {
                    const { data: members } = await this.supabase
                        .from('profiles')
                        .select('id, full_name, avatar_url, slug, rota_number')
                        .in('id', memberIds)

                    // Buscar ranks dos membros
                    const { data: memberGamification } = await this.supabase
                        .from('user_gamification')
                        .select('user_id, current_rank_id')
                        .in('user_id', memberIds)

                    members?.forEach(m => memberMap.set(m.id, m))

                    // Mapa de ranks dos membros
                    const memberRankMap = new Map<string, string>()
                    memberGamification?.forEach(g => memberRankMap.set(g.user_id, g.current_rank_id))

                    // Adicionar rank_id aos perfis dos membros
                    memberIds.forEach(id => {
                        const member = memberMap.get(id)
                        if (member) {
                            member.rank_id = memberRankMap.get(id) || null
                        }
                    })
                }

                confs?.forEach(c => {
                    confraternityMap.set(c.id, {
                        id: c.id,
                        date_occurred: c.proposed_date,
                        member1: memberMap.get(c.sender_id) || null,
                        member2: memberMap.get(c.receiver_id) || null
                    })
                })
            }

            // Buscar likes do usuário atual
            let likedPostIds = new Set<string>()
            if (currentUserId && postsData.length > 0) {
                const { data: likes } = await this.supabase
                    .from('post_likes')
                    .select('post_id')
                    .eq('user_id', currentUserId)
                    .in('post_id', postsData.map(p => p.id))

                likedPostIds = new Set(likes?.map(l => l.post_id) || [])
            }

            // Transformar dados
            const posts: Post[] = postsData.map(post => {
                const profile = profileMap.get(post.user_id)
                const confraternity = confraternityMap.get(post.confraternity_id) || null

                return {
                    id: post.id,
                    user_id: post.user_id,
                    content: post.content,
                    media_urls: post.media_urls || [],
                    visibility: post.visibility,
                    confraternity_id: post.confraternity_id,
                    likes_count: post.likes_count || 0,
                    comments_count: post.comments_count || 0,
                    created_at: post.created_at,
                    updated_at: post.updated_at,
                    user: {
                        id: profile?.id || post.user_id,
                        full_name: profile?.full_name || 'Usuário',
                        avatar_url: profile?.avatar_url || null,
                        slug: profile?.slug || null,
                        rota_number: profile?.rota_number || null,
                        rank_id: rankMap.get(post.user_id) || null
                    },
                    confraternity,
                    user_has_liked: likedPostIds.has(post.id)
                }
            })

            return posts
        } catch (error) {
            console.error('Erro ao carregar posts:', error)
            return []
        }
    }

    /**
     * Busca IDs de confrarias que o usuário participou
     */
    private async getUserConfraternityIds(userId: string): Promise<string[]> {
        try {
            const { data, error } = await this.supabase
                .from('confraternity_invites')
                .select('id')
                .eq('status', 'completed')
                .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

            if (error) {
                console.error('Erro ao buscar confrarias:', error)
                return []
            }

            return data?.map(c => c.id) || []
        } catch (e) {
            console.error('Erro ao buscar confrarias:', e)
            return []
        }
    }

    /**
     * Toggle like em um post
     */
    async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; newCount: number }> {
        // Verificar se já curtiu
        const { data: existingLike } = await this.supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single()

        if (existingLike) {
            // Remover like
            await this.supabase
                .from('post_likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId)

            // Atualizar contador
            const { data: post } = await this.supabase
                .from('posts')
                .select('likes_count')
                .eq('id', postId)
                .single()

            return { liked: false, newCount: Math.max(0, (post?.likes_count || 1) - 1) }
        } else {
            // Adicionar like
            await this.supabase
                .from('post_likes')
                .insert({ post_id: postId, user_id: userId })

            // Atualizar contador
            const { data: post } = await this.supabase
                .from('posts')
                .select('likes_count')
                .eq('id', postId)
                .single()

            return { liked: true, newCount: (post?.likes_count || 0) + 1 }
        }
    }

    /**
     * Deletar post
     */
    async deletePost(postId: string, userId: string): Promise<boolean> {
        const { error } = await this.supabase
            .from('posts')
            .delete()
            .eq('id', postId)
            .eq('user_id', userId)

        return !error
    }

    /**
     * Carrega dados para sidebar (ranking, medalhas, agenda) + contadores
     */
    async loadSidebarData(): Promise<SidebarData> {
        const [ranking, recentMedals, upcomingConfrarias, totalMembers, totalMedals, confraternityThisMonth] = await Promise.all([
            this.loadRanking(),
            this.loadRecentMedals(),
            this.loadUpcomingConfrarias(),
            this.getTotalMembers(),
            this.getTotalMedals(),
            this.getConfraternityThisMonth()
        ])

        return { ranking, recentMedals, upcomingConfrarias, totalMembers, totalMedals, confraternityThisMonth }
    }

    private async getTotalMembers(): Promise<number> {
        try {
            const { count } = await this.supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .not('email', 'in', '("admin@rotabusinessclub.com.br","sistema@rotabusinessclub.com.br","rotabusiness@rotabusinessclub.com.br")')
            return count || 0
        } catch {
            return 0
        }
    }

    private async getTotalMedals(): Promise<number> {
        try {
            const { count } = await this.supabase
                .from('user_medals')
                .select('*', { count: 'exact', head: true })
            return count || 0
        } catch {
            return 0
        }
    }

    private async getConfraternityThisMonth(): Promise<number> {
        try {
            // Primeiro dia do mês atual
            const now = new Date()
            const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

            const { count } = await this.supabase
                .from('confraternity_invites')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'completed')
                .gte('proposed_date', firstDayOfMonth)
            return count || 0
        } catch {
            return 0
        }
    }

    private async loadRanking(limit = 5): Promise<RankingUser[]> {
        try {
            // Query separada - primeiro busca gamification, depois perfis
            const { data: gamificationData, error: gamError } = await this.supabase
                .from('user_gamification')
                .select('user_id, total_points, current_rank_id')
                .order('total_points', { ascending: false })
                .limit(limit)

            if (gamError) throw gamError
            if (!gamificationData || gamificationData.length === 0) return []

            // Buscar perfis separadamente (EXCLUINDO admin/sistema/rotabusiness)
            const userIds = gamificationData.map(g => g.user_id)
            const { data: profiles } = await this.supabase
                .from('profiles')
                .select('id, full_name, avatar_url, slug, rota_number, email')
                .in('id', userIds)
                .not('email', 'in', '("admin@rotabusinessclub.com.br","sistema@rotabusinessclub.com.br","rotabusiness@rotabusinessclub.com.br")')

            // Criar mapa de perfis
            const profileMap = new Map<string, any>()
            profiles?.forEach(p => profileMap.set(p.id, p))

            // Filtrar apenas usuários com perfil válido (exclui admin/sistema)
            return gamificationData
                .map(item => {
                    const profile = profileMap.get(item.user_id)
                    return {
                        id: item.user_id,
                        full_name: profile?.full_name || 'Usuário',
                        avatar_url: profile?.avatar_url || null,
                        slug: profile?.slug || null,
                        rota_number: profile?.rota_number || null,
                        vigor: item.total_points || 0,
                        rank_id: item.current_rank_id,
                        _hasProfile: !!profile // Controle interno
                    }
                })
                .filter(user => user._hasProfile) // Remove sem perfil (admin/sistema)
                .slice(0, limit) // Garantir limite após filtro
        } catch (error) {
            console.error('Erro ao carregar ranking:', error)
            return []
        }
    }

    private async loadRecentMedals(limit = 5): Promise<RecentMedal[]> {
        try {
            // Query separada - primeiro busca user_medals
            const { data: userMedals, error: umError } = await this.supabase
                .from('user_medals')
                .select('user_id, medal_id, earned_at')
                .order('earned_at', { ascending: false })
                .limit(limit)

            if (umError) throw umError
            if (!userMedals || userMedals.length === 0) return []

            // Buscar perfis
            const userIds = Array.from(new Set(userMedals.map(um => um.user_id)))
            const { data: profiles } = await this.supabase
                .from('profiles')
                .select('id, full_name, avatar_url')
                .in('id', userIds)

            // Buscar medalhas
            const medalIds = Array.from(new Set(userMedals.map(um => um.medal_id)))
            const { data: medals } = await this.supabase
                .from('medals')
                .select('id, name, icon')
                .in('id', medalIds)

            // Criar mapas
            const profileMap = new Map<string, any>()
            profiles?.forEach(p => profileMap.set(p.id, p))

            const medalMap = new Map<string, any>()
            medals?.forEach(m => medalMap.set(m.id, m))

            return userMedals.map(item => {
                const profile = profileMap.get(item.user_id)
                const medal = medalMap.get(item.medal_id)
                return {
                    user_id: item.user_id,
                    medal_id: item.medal_id,
                    earned_at: item.earned_at,
                    user: {
                        full_name: profile?.full_name || 'Usuário',
                        avatar_url: profile?.avatar_url || null
                    },
                    medal: {
                        name: medal?.name || 'Medalha',
                        icon_key: medal?.icon || 'Award'
                    }
                }
            })
        } catch (error) {
            console.error('Erro ao carregar medalhas:', error)
            return []
        }
    }

    private async loadUpcomingConfrarias(limit = 5): Promise<UpcomingConfraternity[]> {
        try {
            // Query separada - primeiro busca convites
            const { data: invites, error: invError } = await this.supabase
                .from('confraternity_invites')
                .select('id, proposed_date, location, sender_id, receiver_id')
                .eq('status', 'accepted')
                .gte('proposed_date', new Date().toISOString())
                .order('proposed_date', { ascending: true })
                .limit(limit)

            if (invError) throw invError
            if (!invites || invites.length === 0) return []

            // Buscar perfis de senders e receivers
            const allUserIds = Array.from(new Set([
                ...invites.map(i => i.sender_id),
                ...invites.map(i => i.receiver_id)
            ]))

            const { data: profiles } = await this.supabase
                .from('profiles')
                .select('id, full_name, avatar_url, slug, rota_number')
                .in('id', allUserIds)

            // Criar mapa
            const profileMap = new Map<string, any>()
            profiles?.forEach(p => profileMap.set(p.id, p))

            return invites.map(inv => ({
                id: inv.id,
                proposed_date: inv.proposed_date,
                location: inv.location,
                sender: profileMap.get(inv.sender_id) || { id: inv.sender_id, full_name: 'Usuário' },
                receiver: profileMap.get(inv.receiver_id) || { id: inv.receiver_id, full_name: 'Usuário' }
            }))
        } catch (error) {
            console.error('Erro ao carregar confrarias:', error)
            return []
        }
    }
}

// ============================================
// Utilitário para URLs de perfil
// ============================================

export function getProfileUrl(user: { id: string; slug?: string | null; rota_number?: string | null }): string {
    if (user.slug && user.rota_number) {
        return `/${user.slug}/${user.rota_number}`
    }
    return `/professional/${user.id}`
}

// ============================================
// Função helper para criar instância
// ============================================

export function createPostsService(supabase: SupabaseClient): PostsService {
    return new PostsService(supabase)
}
