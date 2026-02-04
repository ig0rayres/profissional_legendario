'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PostsService, Post, SidebarData, PostQueryOptions } from '@/lib/services/posts-service'

interface UsePostsOptions {
    feedType: 'global' | 'user' | 'connections' | 'marketplace'
    userId?: string
    autoLoad?: boolean
}

interface UsePostsReturn {
    posts: Post[]
    loading: boolean
    error: string | null
    hasMore: boolean
    loadPosts: () => Promise<void>
    loadMore: () => Promise<void>
    refresh: () => Promise<void>
    toggleLike: (postId: string) => Promise<void>
    deletePost: (postId: string) => Promise<boolean>
    addPost: (post: Post) => void
}

export function usePosts(options: UsePostsOptions): UsePostsReturn {
    const { feedType, userId, autoLoad = true } = options

    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(true)
    const [offset, setOffset] = useState(0)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const supabase = createClient()
    const postsService = new PostsService(supabase)

    const LIMIT = 20

    // Carregar usuário atual
    useEffect(() => {
        async function loadUser() {
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUserId(user?.id || null)
        }
        loadUser()
    }, [])

    // Carregar posts automaticamente quando as deps mudarem
    useEffect(() => {
        if (autoLoad && currentUserId !== null) {
            loadPosts()
        }
    }, [feedType, userId, currentUserId, autoLoad])

    const loadPosts = useCallback(async () => {
        setLoading(true)
        setError(null)
        setOffset(0)

        try {
            const loadedPosts = await postsService.loadPosts({
                feedType,
                userId,
                currentUserId: currentUserId || undefined,
                limit: LIMIT,
                offset: 0
            })

            setPosts(loadedPosts)
            setHasMore(loadedPosts.length === LIMIT)
        } catch (e) {
            console.error('Erro ao carregar posts:', e)
            setError('Erro ao carregar publicações')
        } finally {
            setLoading(false)
        }
    }, [feedType, userId, currentUserId])

    const loadMore = useCallback(async () => {
        if (!hasMore || loading) return

        const newOffset = offset + LIMIT

        try {
            const morePosts = await postsService.loadPosts({
                feedType,
                userId,
                currentUserId: currentUserId || undefined,
                limit: LIMIT,
                offset: newOffset
            })

            setPosts(prev => [...prev, ...morePosts])
            setOffset(newOffset)
            setHasMore(morePosts.length === LIMIT)
        } catch (e) {
            console.error('Erro ao carregar mais posts:', e)
        }
    }, [feedType, userId, currentUserId, offset, hasMore, loading])

    const refresh = useCallback(async () => {
        await loadPosts()
    }, [loadPosts])

    const toggleLike = useCallback(async (postId: string) => {
        if (!currentUserId) return

        // Optimistic update
        setPosts(prev => prev.map(p => {
            if (p.id === postId) {
                const newLiked = !p.user_has_liked
                return {
                    ...p,
                    user_has_liked: newLiked,
                    likes_count: newLiked ? p.likes_count + 1 : Math.max(0, p.likes_count - 1)
                }
            }
            return p
        }))

        try {
            await postsService.toggleLike(postId, currentUserId)
        } catch (e) {
            // Reverter em caso de erro
            setPosts(prev => prev.map(p => {
                if (p.id === postId) {
                    const revert = !p.user_has_liked
                    return {
                        ...p,
                        user_has_liked: revert,
                        likes_count: revert ? p.likes_count + 1 : Math.max(0, p.likes_count - 1)
                    }
                }
                return p
            }))
            console.error('Erro ao curtir:', e)
        }
    }, [currentUserId])

    const deletePost = useCallback(async (postId: string): Promise<boolean> => {
        if (!currentUserId) return false

        const success = await postsService.deletePost(postId, currentUserId)

        if (success) {
            setPosts(prev => prev.filter(p => p.id !== postId))
        }

        return success
    }, [currentUserId])

    const addPost = useCallback((post: Post) => {
        setPosts(prev => [post, ...prev])
    }, [])

    return {
        posts,
        loading,
        error,
        hasMore,
        loadPosts,
        loadMore,
        refresh,
        toggleLike,
        deletePost,
        addPost
    }
}

// ============================================
// Hook para Sidebar Data
// ============================================

interface UseSidebarReturn {
    data: SidebarData | null
    loading: boolean
    refresh: () => Promise<void>
}

export function useSidebarData(): UseSidebarReturn {
    const [data, setData] = useState<SidebarData | null>(null)
    const [loading, setLoading] = useState(true)

    const supabase = createClient()
    const postsService = new PostsService(supabase)

    const load = useCallback(async () => {
        setLoading(true)
        try {
            const sidebarData = await postsService.loadSidebarData()
            setData(sidebarData)
        } catch (e) {
            console.error('Erro ao carregar sidebar:', e)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        load()
    }, [])

    return {
        data,
        loading,
        refresh: load
    }
}
