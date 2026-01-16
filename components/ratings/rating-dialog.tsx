'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { RatingForm } from './rating-form'
import { Star } from 'lucide-react'

interface RatingDialogProps {
    professionalId: string
    professionalName: string
    trigger?: React.ReactNode
}

export function RatingDialog({ professionalId, professionalName, trigger }: RatingDialogProps) {
    const [open, setOpen] = useState(false)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="border-primary/20 hover:bg-primary/10">
                        <Star className="w-4 h-4 mr-2" />
                        Avaliar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-card border-primary/20">
                <RatingForm
                    professionalId={professionalId}
                    professionalName={professionalName}
                    onSuccess={() => setOpen(false)}
                />
            </DialogContent>
        </Dialog>
    )
}
