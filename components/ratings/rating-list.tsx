'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RatingDisplay } from './rating-display'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Loader2, MessageSquare, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Rating {
    id: string
    rating: number
    comment: string | null
    created_at: string
    reviewer_id: string
    profiles: {
        full_name: string
        avatar_url: string | null
    }
    rating_responses: {
        id: string
        response: string
        created_at: string
    } | null
}

interface RatingListProps {
    professionalId: string
    currentUserId?: string
}

export function RatingList({ professionalId, currentUserId }: RatingListProps) {
    const [ratings, setRatings] = useState<Rating[]>([])
    const [loading, setLoading] = useState(true)
    const [respondingTo, setRespondingTo] = useState<string | null>(null)
    const [response, setResponse] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        loadRatings()
    }, [professionalId])

    const loadRatings = async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('ratings')
            .select(`
        *,
        profiles!ratings_reviewer_id_fkey(full_name, avatar_url),
        rating_responses(*)
      `)
            .eq('professional_id', professionalId)
            .order('created_at', { ascending: false })

        if (!error && data) {
            setRatings(data as any)
        }

        setLoading(false)
    }

    const handleSubmitResponse = async (ratingId: string) => {
        if (!response.trim()) return

        setSubmitting(true)
        try {
            const supabase = createClient()

            const { error } = await supabase
                .from('rating_responses')
                .insert({
                    rating_id: ratingId,
                    response: response.trim(),
                })

            if (!error) {
                await loadRatings()
                setRespondingTo(null)
                setResponse('')
            }
        } catch (err) {
            console.error('Error submitting response:', err)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        )
    }

    if (ratings.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma avaliação ainda</p>
                <p className="text-sm mt-1">Seja o primeiro a avaliar!</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {ratings.map((rating) => (
                <Card key={rating.id} className="p-4">
                    {/* Reviewer Info */}
                    <div className="flex items-start gap-3">
                        {rating.profiles.avatar_url ? (
                            <img
                                src={rating.profiles.avatar_url}
                                alt={rating.profiles.full_name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-600" />
                            </div>
                        )}

                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-white">{rating.profiles.full_name}</p>
                                    <p className="text-xs text-gray-500">
                                        {formatDistanceToNow(new Date(rating.created_at), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })}
                                    </p>
                                </div>
                                <RatingDisplay rating={rating.rating} size="sm" showNumber={false} />
                            </div>

                            {/* Comment */}
                            {rating.comment && (
                                <p className="text-gray-300 mt-2 leading-relaxed">{rating.comment}</p>
                            )}

                            {/* Professional Response */}
                            {rating.rating_responses && (
                                <div className="mt-3 pl-4 border-l-2 border-primary/30 bg-primary/5 p-3 rounded-r-md">
                                    <p className="text-xs font-medium text-primary mb-1">Resposta do Profissional</p>
                                    <p className="text-sm text-gray-300">{rating.rating_responses.response}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(new Date(rating.rating_responses.created_at), {
                                            addSuffix: true,
                                            locale: ptBR,
                                        })}
                                    </p>
                                </div>
                            )}

                            {/* Response Form (only for professional) */}
                            {currentUserId === professionalId && !rating.rating_responses && (
                                <div className="mt-3">
                                    {respondingTo === rating.id ? (
                                        <div className="space-y-2">
                                            <textarea
                                                value={response}
                                                onChange={(e) => setResponse(e.target.value)}
                                                placeholder="Escreva sua resposta..."
                                                className="w-full min-h-[80px] px-3 py-2 rounded-md border border-gray-700 bg-gray-900 text-white text-sm resize-none"
                                                maxLength={300}
                                            />
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleSubmitResponse(rating.id)}
                                                    disabled={submitting || !response.trim()}
                                                >
                                                    {submitting ? (
                                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                                    ) : null}
                                                    Enviar
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setRespondingTo(null)
                                                        setResponse('')
                                                    }}
                                                >
                                                    Cancelar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setRespondingTo(rating.id)}
                                        >
                                            <MessageSquare className="w-3 h-3 mr-1" />
                                            Responder
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}
