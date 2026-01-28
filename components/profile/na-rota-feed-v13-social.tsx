'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, Loader2, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from '@/components/social/post-card'
import { CreatePostModalV2 } from '@/components/social/create-post-modal-v2'
import { PostsService, Post as ServicePost } from '@/lib/services/posts-service'

interface NaRotaFeedV13Props {
    userId: string
    userName: string
    userAvatar?: string | null
    showCreateButton?: boolean
    feedType?: 'user' | 'global' | 'connections'
}

export function NaRotaFeedV13({
    userId,
    userName,
    userAvatar,
    showCreateButton = true,
    feedType = 'user'
}: NaRotaFeedV13Props) {
    const [posts, setPosts] = useState<ServicePost[]>([])
    const [loading, setLoading] = useState(true)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    const supabase = createClient()
    const postsService = new PostsService(supabase)

    useEffect(() => {
        loadCurrentUser()
    }, [])

    useEffect(() => {
        if (currentUserId !== null) {
            loadPosts()
        }
    }, [userId, feedType, currentUserId])

    async function loadCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
    }

    const loadPosts = useCallback(async () => {
        setLoading(true)
        try {
            const loadedPosts = await postsService.loadPosts({
                feedType,
                userId,
                currentUserId: currentUserId || undefined,
                limit: 20
            })
            setPosts(loadedPosts)
        } catch (error) {
            console.error('Error loading posts:', error)
        } finally {
            setLoading(false)
        }
    }, [feedType, userId, currentUserId])

    const handlePostCreated = () => {
        loadPosts()
    }

    const handlePostDeleted = async (postId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta publicação?')) return

        if (!currentUserId) return

        const success = await postsService.deletePost(postId, currentUserId)
        if (success) {
            setPosts(posts.filter(p => p.id !== postId))
        } else {
            alert('Erro ao excluir publicação')
        }
    }

    const handleLike = async (postId: string) => {
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
            // Reverter
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
        }
    }

    return (
        <>
            <Card className="bg-white border border-gray-200 shadow-md hover:shadow-xl hover:border-[#1E4D40]/30 transition-all duration-300 group overflow-hidden">
                {/* Efeito de brilho no hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <CardContent className="p-5 relative">
                    {/* Header com ícone animado */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D2691E] to-[#B85715] flex items-center justify-center shadow-md transform group-hover:rotate-6 transition-transform duration-300">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#2D3142]">
                                    Na Rota
                                </h3>
                                <p className="text-xs text-gray-600">
                                    {feedType === 'user' ? 'Suas publicações' :
                                        feedType === 'global' ? 'Feed global' :
                                            'Seus elos'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Refresh button */}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={loadPosts}
                                disabled={loading}
                                className="text-gray-500"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </Button>

                            {/* Create button */}
                            {showCreateButton && currentUserId === userId && (
                                <Button
                                    size="sm"
                                    onClick={() => setCreateModalOpen(true)}
                                    className="gap-2 bg-gray-900 hover:bg-gray-800 text-white"
                                >
                                    <Plus className="w-4 h-4" />
                                    Publicar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-[#D2691E]" />
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center py-12 text-gray-600">
                                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
                                <p className="text-sm font-bold uppercase tracking-wide">
                                    Nenhuma publicação ainda
                                </p>
                                <p className="text-xs mt-1">
                                    {feedType === 'user'
                                        ? 'Compartilhe suas experiências!'
                                        : 'Nenhuma publicação para exibir'}
                                </p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <PostCard
                                    key={post.id}
                                    post={post as any}
                                    currentUserId={currentUserId || undefined}
                                    onLike={() => handleLike(post.id)}
                                    onUnlike={() => handleLike(post.id)}
                                    onDelete={() => handlePostDeleted(post.id)}
                                    onRefresh={() => loadPosts()}
                                />
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create Post Modal V2 - Sóbrio */}
            <CreatePostModalV2
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                userId={userId}
                onPostCreated={handlePostCreated}
            />
        </>
    )
}
