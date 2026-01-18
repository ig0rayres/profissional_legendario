'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Star, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

interface RatingButtonProps {
    targetUserId: string
    targetUserName: string
}

export function RatingButton({ targetUserId, targetUserName }: RatingButtonProps) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [rating, setRating] = useState(0)
    const [hoverRating, setHoverRating] = useState(0)
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const supabase = createClient()

    async function submitRating() {
        if (!user || rating === 0) return

        setLoading(true)

        const { error } = await supabase
            .from('ratings')
            .insert({
                professional_id: targetUserId,
                reviewer_id: user.id,
                rating: rating,
                comment: comment.trim() || null
            })

        if (!error) {
            setSent(true)
            setTimeout(() => {
                setOpen(false)
                setSent(false)
                setRating(0)
                setComment('')
            }, 1500)
        }

        setLoading(false)
    }

    if (user?.id === targetUserId) return null

    if (!user) {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-secondary/30">
                <Star className="w-3 h-3 mr-1" />
                CLASSIFICAR
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="font-bold text-[10px] h-7 px-2 border-secondary/30 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:border-secondary transition-all shadow-sm">
                    <Star className="w-3 h-3 mr-1" />
                    CLASSIFICAR
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-black uppercase tracking-widest">
                        CLASSIFICAR {targetUserName.toUpperCase()}
                    </DialogTitle>
                </DialogHeader>

                {sent ? (
                    <div className="py-8 text-center">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="font-bold">AVALIAÇÃO ENVIADA</p>
                    </div>
                ) : (
                    <>
                        <div className="flex justify-center gap-2 py-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="p-1 transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-8 h-8 ${star <= (hoverRating || rating)
                                            ? 'text-secondary fill-secondary'
                                            : 'text-muted-foreground'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>

                        <Textarea
                            placeholder="Escreva algo sobre este profissional (opcional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                            rows={3}
                            className="resize-none"
                        />
                        <p className="font-bold text-[10px] text-muted-foreground text-right">
                            {comment.length}/500
                        </p>

                        <DialogFooter>
                            <Button
                                onClick={submitRating}
                                disabled={loading || rating === 0}
                                className="w-full"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Star className="w-4 h-4 mr-2" />
                                )}
                                ENVIAR AVALIAÇÃO
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
