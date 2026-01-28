'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Send, Trash2, MoreVertical } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Comment {
    id: string
    post_id: string
    user_id: string
    content: string
    created_at: string
    user?: {
        id: string
        full_name: string
        avatar_url: string | null
        slug?: string
        rota_number?: string
    }
}

interface PostCommentsProps {
    postId: string
    currentUserId?: string
    isOpen: boolean
    onClose: () => void
    onCommentAdded?: () => void
}

export function PostComments({
    postId,
    currentUserId,
    isOpen,
    onClose,
    onCommentAdded
}: PostCommentsProps) {
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const supabase = createClient()

    useEffect(() => {
        if (isOpen) {
            loadComments()
            // Focus input after a short delay
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, postId])

    async function loadComments() {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('post_comments')
                .select(`
                    id,
                    post_id,
                    user_id,
                    content,
                    created_at
                `)
                .eq('post_id', postId)
                .order('created_at', { ascending: true })

            if (error) throw error

            // Fetch user profiles separately
            if (data && data.length > 0) {
                const userIds = Array.from(new Set(data.map(c => c.user_id)))
                const { data: profiles } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, slug, rota_number')
                    .in('id', userIds)

                const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

                const commentsWithUsers = data.map(comment => ({
                    ...comment,
                    user: profileMap.get(comment.user_id) || {
                        id: comment.user_id,
                        full_name: 'Usuário',
                        avatar_url: null
                    }
                }))

                setComments(commentsWithUsers)
            } else {
                setComments([])
            }
        } catch (error) {
            console.error('Error loading comments:', error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit() {
        if (!newComment.trim() || !currentUserId) return

        setSubmitting(true)
        try {
            // 1. Inserir comentário
            const { data: insertedComment, error } = await supabase
                .from('post_comments')
                .insert({
                    post_id: postId,
                    user_id: currentUserId,
                    content: newComment.trim()
                })
                .select()
                .single()

            if (error) throw error

            // 2. Creditar pontos via API centralizada (respeita limite diário e multiplicador)
            try {
                await fetch('/api/rota-valente/award', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUserId,
                        actionId: 'post_comment_sent',
                        metadata: {
                            post_id: postId,
                            comment_id: insertedComment?.id
                        }
                    })
                })
            } catch (pointsError) {
                // Não bloqueia a inserção do comentário se falhar a pontuação
                console.error('[PostComments] Erro ao creditar pontos:', pointsError)
            }

            setNewComment('')
            await loadComments()
            onCommentAdded?.()
        } catch (error) {
            console.error('Error adding comment:', error)
            alert('Erro ao adicionar comentário')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(commentId: string) {
        if (!confirm('Excluir comentário?')) return

        try {
            const { error } = await supabase
                .from('post_comments')
                .delete()
                .eq('id', commentId)
                .eq('user_id', currentUserId)

            if (error) throw error

            setComments(comments.filter(c => c.id !== commentId))
            onCommentAdded?.()
        } catch (error) {
            console.error('Error deleting comment:', error)
        }
    }

    const getUserProfileUrl = (user: { id: string; slug?: string; rota_number?: string }) => {
        return user.slug && user.rota_number
            ? `/${user.slug}/${user.rota_number}`
            : `/perfil/${user.id}`
    }

    if (!isOpen) return null

    return (
        <div className="border-t border-gray-100 bg-gray-50/50">
            {/* Comments List */}
            <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                    </div>
                ) : comments.length === 0 ? (
                    <p className="text-center text-gray-500 text-sm py-4">
                        Nenhum comentário ainda. Seja o primeiro!
                    </p>
                ) : (
                    comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                            <Link href={getUserProfileUrl(comment.user || { id: comment.user_id })}>
                                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                    {comment.user?.avatar_url ? (
                                        <Image
                                            src={comment.user.avatar_url}
                                            alt=""
                                            width={32}
                                            height={32}
                                            className="object-cover w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs font-bold">
                                            {comment.user?.full_name?.charAt(0) || '?'}
                                        </div>
                                    )}
                                </div>
                            </Link>
                            <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-lg px-3 py-2 border border-gray-100">
                                    <div className="flex items-center justify-between gap-2">
                                        <Link
                                            href={getUserProfileUrl(comment.user || { id: comment.user_id })}
                                            className="text-sm font-semibold text-gray-900 hover:underline"
                                        >
                                            {comment.user?.full_name || 'Usuário'}
                                        </Link>
                                        {currentUserId === comment.user_id && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                                        <MoreVertical className="w-3 h-3 text-gray-400" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(comment.id)}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                                        {comment.content}
                                    </p>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 px-1">
                                    {formatDistanceToNow(new Date(comment.created_at), {
                                        addSuffix: true,
                                        locale: ptBR
                                    })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment */}
            {currentUserId && (
                <div className="p-3 border-t border-gray-100 bg-white">
                    <div className="flex gap-2">
                        <Textarea
                            ref={inputRef}
                            placeholder="Escreva um comentário..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="flex-1 min-h-[40px] max-h-24 resize-none text-sm"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault()
                                    handleSubmit()
                                }
                            }}
                        />
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={!newComment.trim() || submitting}
                            className="bg-gray-900 hover:bg-gray-800 h-10"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
