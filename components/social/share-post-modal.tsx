'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2, Share2, Image as ImageIcon, CheckCircle } from 'lucide-react'
import Image from 'next/image'

interface SharePostModalProps {
    userId: string
}

export function SharePostModal({ userId }: SharePostModalProps) {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [sharing, setSharing] = useState(false)
    const [post, setPost] = useState<any>(null)
    const [comment, setComment] = useState('')
    const supabase = createClient()

    const postId = searchParams.get('share_post')

    useEffect(() => {
        if (postId) {
            loadPost(postId)
            setOpen(true)
        }
    }, [postId])

    async function loadPost(id: string) {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('posts')
                .select(`
                    *,
                    user:profiles!posts_user_id_fkey(
                        id, full_name, avatar_url
                    )
                `)
                .eq('id', id)
                .single()

            if (error) throw error
            setPost(data)
        } catch (error) {
            console.error('Error loading post:', error)
            toast.error('Erro ao carregar post')
        } finally {
            setLoading(false)
        }
    }

    function handleClose() {
        setOpen(false)
        // Remove query param
        const url = new URL(window.location.href)
        url.searchParams.delete('share_post')
        router.replace(url.pathname)
    }

    async function handleShare() {
        if (!post) return

        setSharing(true)
        try {
            const response = await fetch('/api/posts/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    originalPostId: post.id,
                    userId: userId,
                    comment: comment || null
                })
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error)
            }

            toast.success('🎉 Post compartilhado!', {
                description: `+${result.pointsAwarded} Vigor ganhos!`
            })

            handleClose()

            // Refresh page to show new post
            router.refresh()
        } catch (error: any) {
            console.error('Error sharing:', error)
            toast.error('Erro ao compartilhar', { description: error.message })
        } finally {
            setSharing(false)
        }
    }

    if (!postId) return null

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-[#D2691E]" />
                        Compartilhar no seu Feed
                    </DialogTitle>
                    <DialogDescription>
                        Compartilhe este post sobre a confraria e ganhe Vigor!
                    </DialogDescription>
                </DialogHeader>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-[#D2691E]" />
                    </div>
                ) : post ? (
                    <div className="space-y-4">
                        {/* Preview do post original */}
                        <div className="bg-gray-50 rounded-lg p-4 border">
                            <div className="flex items-center gap-2 mb-2">
                                {post.user?.avatar_url && (
                                    <Image
                                        src={post.user.avatar_url}
                                        alt=""
                                        width={32}
                                        height={32}
                                        className="rounded-full"
                                    />
                                )}
                                <span className="font-medium text-sm">
                                    {post.user?.full_name}
                                </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-3">
                                {post.content}
                            </p>
                            {post.media_urls?.length > 0 && (
                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                    <ImageIcon className="h-4 w-4" />
                                    {post.media_urls.filter((u: string) => u).length} foto(s)
                                </div>
                            )}
                        </div>

                        {/* Comentário opcional */}
                        <div>
                            <label className="text-sm font-medium mb-1 block">
                                Adicione seu comentário (opcional)
                            </label>
                            <Textarea
                                placeholder="Foi incrível! Agradeço pelo encontro..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows={3}
                            />
                            {comment && (
                                <p className="text-xs text-green-600 mt-1">
                                    +15 Vigor extra pelo comentário!
                                </p>
                            )}
                        </div>

                        {/* Recompensas */}
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <p className="text-sm font-semibold text-green-800 mb-1">
                                🎁 Ao compartilhar você ganha:
                            </p>
                            <ul className="text-xs text-green-700 space-y-1">
                                <li>• +50 Vigor por participação</li>
                                <li>• +{(post.media_urls?.filter((u: string) => u).length || 0) * 20} Vigor pelas fotos</li>
                                {comment && <li>• +15 Vigor pelo comentário</li>}
                            </ul>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">
                        Post não encontrado
                    </p>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={sharing}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleShare}
                        disabled={!post || sharing}
                        className="bg-[#1E4D40] hover:bg-[#163d33]"
                    >
                        {sharing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Compartilhando...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Compartilhar
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
