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
    feedType: 'global' | 'user' | 'connections'
    userId?: string
    currentUserId?: string
    limit?: number
    offset?: number
}

export interface SidebarData {
    ranking: RankingUser[]
    recentMedals: RecentMedal[]
    upcomingConfrarias: UpcomingConfraternity[]
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

    // Query SELECT padronizada - usando apenas colunas que existem no banco
    private get basePostSelect() {
        return `
            id,
            user_id,
            content,
            media_urls,
            visibility,
            confraternity_id,
            likes_count,
            comments_count,
            created_at,
            updated_at,
            user:profiles!posts_user_id_fkey(
                id,
                full_name,
                avatar_url,
                slug,
                rota_number
            ),
            confraternity:confraternities!posts_confraternity_id_fkey(
                id,
                date_occurred,
                member1:profiles!confraternities_member1_id_fkey(
                    id, full_name, avatar_url, slug, rota_number
                ),
                member2:profiles!confraternities_member2_id_fkey(
                    id, full_name, avatar_url, slug, rota_number
                )
            )
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
            } else if (feedType === 'user' && userId) {
                // Posts do usuário + posts de confrarias que ele participou
                const confIds = await this.getUserConfraternityIds(userId)

                if (confIds.length > 0) {
                    query = query.or(`user_id.eq.${userId},confraternity_id.in.(${confIds.join(',')})`)
                } else {
                    query = query.eq('user_id', userId)
                }
            } else if (feedType === 'connections' && userId) {
                // Posts públicos ou de conexões
                query = query.in('visibility', ['public', 'connections'])
            }

            const { data, error } = await query

            if (error) throw error
            if (!data) return []

            // Type assertion para array de posts
            const postsData = data as any[]

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
            const posts: Post[] = postsData.map(post => ({
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
                user: post.user as PostUser,
                confraternity: post.confraternity as PostConfraternity | null,
                user_has_liked: likedPostIds.has(post.id)
            }))

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
        const { data } = await this.supabase
            .from('confraternities')
            .select('id')
            .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)

        return data?.map(c => c.id) || []
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
     * Carrega dados para sidebar (ranking, medalhas, agenda)
     */
    async loadSidebarData(): Promise<SidebarData> {
        const [ranking, recentMedals, upcomingConfrarias] = await Promise.all([
            this.loadRanking(),
            this.loadRecentMedals(),
            this.loadUpcomingConfrarias()
        ])

        return { ranking, recentMedals, upcomingConfrarias }
    }

    private async loadRanking(limit = 5): Promise<RankingUser[]> {
        try {
            // Usa user_gamification que é a tabela correta no sistema
            const { data, error } = await this.supabase
                .from('user_gamification')
                .select(`
                    user_id,
                    total_points,
                    current_rank_id,
                    user:profiles!user_id(
                        id, full_name, avatar_url, slug, rota_number
                    )
                `)
                .order('total_points', { ascending: false })
                .limit(limit)

            if (error) throw error

            return (data || []).map(item => ({
                id: item.user_id,
                full_name: (item.user as any)?.full_name || 'Usuário',
                avatar_url: (item.user as any)?.avatar_url,
                slug: (item.user as any)?.slug,
                rota_number: (item.user as any)?.rota_number,
                vigor: item.total_points || 0,
                rank_id: item.current_rank_id
            }))
        } catch (error) {
            console.error('Erro ao carregar ranking:', error)
            return []
        }
    }

    private async loadRecentMedals(limit = 5): Promise<RecentMedal[]> {
        try {
            // Usa user_medals que é a tabela correta no sistema
            const { data, error } = await this.supabase
                .from('user_medals')
                .select(`
                    user_id,
                    medal_id,
                    earned_at,
                    user:profiles!user_id(full_name, avatar_url),
                    medal:medals!medal_id(name, icon)
                `)
                .order('earned_at', { ascending: false })
                .limit(limit)

            if (error) throw error

            return (data || []).map(item => ({
                user_id: item.user_id,
                medal_id: item.medal_id,
                earned_at: item.earned_at,
                user: item.user as any,
                medal: {
                    name: (item.medal as any)?.name || 'Medalha',
                    icon_key: (item.medal as any)?.icon || 'Award'
                }
            }))
        } catch (error) {
            console.error('Erro ao carregar medalhas:', error)
            return []
        }
    }

    private async loadUpcomingConfrarias(limit = 5): Promise<UpcomingConfraternity[]> {
        try {
            const { data, error } = await this.supabase
                .from('confraternity_invites')
                .select(`
                    id,
                    proposed_date,
                    location,
                    sender:profiles!sender_id(id, full_name, avatar_url, slug, rota_number),
                    receiver:profiles!receiver_id(id, full_name, avatar_url, slug, rota_number)
                `)
                .eq('status', 'accepted')
                .gte('proposed_date', new Date().toISOString())
                .order('proposed_date', { ascending: true })
                .limit(limit)

            if (error) throw error

            return (data || []) as any
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
