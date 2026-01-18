'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Loader2, Check } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'

interface PrayerButtonProps {
    targetUserId: string
    targetUserName: string
}

export function PrayerButton({ targetUserId, targetUserName }: PrayerButtonProps) {
    const { user } = useAuth()
    const [open, setOpen] = useState(false)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const supabase = createClient()

    async function sendPrayer() {
        if (!user || !message.trim()) return

        setLoading(true)

        const { error } = await supabase
            .from('prayer_requests')
            .insert({
                from_user_id: user.id,
                to_user_id: targetUserId,
                message: message.trim()
            })

        if (!error) {
            setSent(true)
            setTimeout(() => {
                setOpen(false)
                setSent(false)
                setMessage('')
            }, 1500)
        }

        setLoading(false)
    }

    if (user?.id === targetUserId) return null

    if (!user) {
        return (
            <Button variant="outline" size="sm" disabled className="font-bold text-[10px] h-7 px-2 border-secondary/30">
                <Shield className="w-3 h-3 mr-1" />
                ORAR
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="font-bold text-[10px] h-7 px-2 border-secondary/30 hover:bg-secondary/10 hover:text-secondary hover:scale-105 hover:border-secondary transition-all shadow-sm">
                    <Shield className="w-3 h-3 mr-1" />
                    ORAR
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-sm font-black uppercase tracking-widest">
                        ORAR POR {targetUserName.toUpperCase()}
                    </DialogTitle>
                </DialogHeader>

                {sent ? (
                    <div className="py-8 text-center">
                        <Check className="w-12 h-12 text-green-500 mx-auto mb-3" />
                        <p className="font-bold">ORAÇÃO ENVIADA</p>
                    </div>
                ) : (
                    <>
                        <Textarea
                            placeholder="Escreva sua oração ou palavra de encorajamento..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            maxLength={1000}
                            rows={4}
                            className="resize-none"
                        />
                        <p className="font-bold text-[10px] text-muted-foreground text-right">
                            {message.length}/1000
                        </p>

                        <DialogFooter>
                            <Button
                                onClick={sendPrayer}
                                disabled={loading || !message.trim()}
                                className="w-full"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Shield className="w-4 h-4 mr-2" />
                                )}
                                ENVIAR ORAÇÃO
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
