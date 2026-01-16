// ============================================
// Component: AddToCalendarButton
// Botão para adicionar ao Google Calendar
// ============================================

'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { openGoogleCalendar, generateConfraternityCalendarEvent } from '@/lib/utils/calendar'

interface AddToCalendarButtonProps {
    otherMemberName: string
    proposedDate: string
    location?: string
    message?: string
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
    className?: string
}

export function AddToCalendarButton({
    otherMemberName,
    proposedDate,
    location,
    message,
    variant = 'outline',
    size = 'sm',
    className
}: AddToCalendarButtonProps) {
    const handleClick = () => {
        const url = generateConfraternityCalendarEvent(
            otherMemberName,
            proposedDate,
            location,
            message
        )
        openGoogleCalendar(url)
    }

    return (
        <Button
            variant={variant}
            size={size}
            onClick={handleClick}
            className={className}
        >
            <Calendar className="mr-2 h-4 w-4" />
            Adicionar ao Google Calendar
        </Button>
    )
}
