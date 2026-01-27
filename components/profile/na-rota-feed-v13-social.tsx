'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { PostCard } from '@/components/social/post-card'
import { CreatePostModal } from '@/components/social/create-post-modal'

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
    const [posts, setPosts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [createModalOpen, setCreateModalOpen] = useState(false)
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        loadCurrentUser()
        loadPosts()
    }, [userId, feedType])

    async function loadCurrentUser() {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUserId(user?.id || null)
    }

    async function loadPosts() {
        try {
            let query = supabase
                .from('posts')
                .select(`
                    *,
                    user:profiles!posts_user_id_fkey(
                        id,
                        full_name,
                        avatar_url
                    ),
                    user_has_liked:post_likes!post_likes_post_id_fkey(user_id),
                    confraternity:confraternities!posts_confraternity_id_fkey(
                        id,
                        date_occurred,
                        member1:profiles!confraternities_member1_id_fkey(id, full_name, avatar_url),
                        member2:profiles!confraternities_member2_id_fkey(id, full_name, avatar_url)
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(20)

            // Filter based on feed type
            if (feedType === 'user') {
                // Para feed do usuário: posts que ele criou OU confrarias que ele participou
                const { data: confraternityIds } = await supabase
                    .from('confraternities')
                    .select('id')
                    .or(`member1_id.eq.${userId},member2_id.eq.${userId}`)

                const confIds = confraternityIds?.map(c => c.id) || []

                if (confIds.length > 0) {
                    query = query.or(`user_id.eq.${userId},confraternity_id.in.(${confIds.join(',')})`)
                } else {
                    query = query.eq('user_id', userId)
                }
            } else if (feedType === 'global') {
                query = query.eq('visibility', 'public')
            } else if (feedType === 'connections') {
                query = query.in('visibility', ['public', 'connections'])
            }

            const { data, error } = await query

            if (error) throw error

            // Transform data to include user_has_liked boolean
            // Also dedupe posts (in case same confraternity post appears twice)
            const seenIds = new Set<string>()
            const transformedPosts = (data || [])
                .filter(post => {
                    if (seenIds.has(post.id)) return false
                    seenIds.add(post.id)
                    return true
                })
                .map(post => ({
                    ...post,
                    user_has_liked: post.user_has_liked?.some((like: any) => like.user_id === currentUserId)
                }))

            setPosts(transformedPosts)
        } catch (error) {
            console.error('Error loading posts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handlePostCreated = () => {
        loadPosts()
    }

    const handlePostDeleted = async (postId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta publicação?')) return

        try {
            const { error } = await supabase
                .from('posts')
                .delete()
                .eq('id', postId)

            if (error) throw error

            setPosts(posts.filter(p => p.id !== postId))
        } catch (error) {
            console.error('Error deleting post:', error)
            alert('Erro ao excluir publicação')
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

                        {/* Create button */}
                        {showCreateButton && currentUserId === userId && (
                            <Button
                                size="sm"
                                onClick={() => setCreateModalOpen(true)}
                                className="gap-2 bg-[#D2691E] hover:bg-[#B85715] text-white"
                            >
                                <Plus className="w-4 h-4" />
                                Publicar
                            </Button>
                        )}
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
                                    post={post}
                                    currentUserId={currentUserId || undefined}
                                    onDelete={handlePostDeleted}
                                />
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Create Post Modal */}
            <CreatePostModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                userId={userId}
                onPostCreated={handlePostCreated}
            />
        </>
    )
}
