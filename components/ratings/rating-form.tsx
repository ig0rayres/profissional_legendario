'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RatingInput } from './rating-display'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Star } from 'lucide-react'

interface RatingFormProps {
    professionalId: string
    professionalName: string
    onSuccess?: () => void
}

export function RatingForm({ professionalId, professionalName, onSuccess }: RatingFormProps) {
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (rating === 0) {
            setError('Por favor, selecione uma avaliação')
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setError('Você precisa estar logado para avaliar')
                return
            }

            // Check if user is verified
            const { data: profile } = await supabase
                .from('profiles')
                .select('verification_status')
                .eq('id', user.id)
                .single()

            if (profile?.verification_status !== 'verified') {
                setError('Apenas usuários verificados podem avaliar profissionais')
                return
            }

            // Submit rating
            const { error: insertError } = await supabase
                .from('ratings')
                .insert({
                    professional_id: professionalId,
                    reviewer_id: user.id,
                    rating,
                    comment: comment || null,
                })

            if (insertError) {
                if (insertError.code === '23505') { // Unique constraint violation
                    setError('Você já avaliou este profissional. Você pode editar sua avaliação existente.')
                } else {
                    setError(insertError.message)
                }
                return
            }

            // Success
            setRating(0)
            setComment('')
            onSuccess?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao enviar avaliação')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    Avaliar {professionalName}
                </CardTitle>
                <CardDescription>
                    Compartilhe sua experiência com este profissional
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Rating Input */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Sua Avaliação *
                        </label>
                        <RatingInput value={rating} onChange={setRating} />
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">
                            Comentário (opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Conte-nos sobre sua experiência..."
                            className="w-full min-h-[120px] px-3 py-2 rounded-md border border-gray-700 bg-gray-900 text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                            maxLength={250}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {comment.length}/250 caracteres
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="text-sm text-red-500 bg-red-500/10 px-3 py-2 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <Button type="submit" disabled={submitting || rating === 0} className="w-full">
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            'Enviar Avaliação'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
