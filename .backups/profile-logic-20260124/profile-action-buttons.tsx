'use client'

import { ConnectionButton } from './connection-button'
import { MessageButton } from './message-button'
import { ConfraternityButton } from './confraternity-button'
import { PrayerButton } from './prayer-button'
import { RatingButton } from './rating-button'

interface ProfileActionButtonsProps {
    userId: string
    userName: string
}

export function ProfileActionButtons({ userId, userName }: ProfileActionButtonsProps) {
    return (
        <div className="flex items-center gap-1 flex-nowrap justify-end">
            <ConnectionButton targetUserId={userId} targetUserName={userName} />
            <MessageButton targetUserId={userId} targetUserName={userName} />
            <ConfraternityButton targetUserId={userId} targetUserName={userName} />
            <PrayerButton targetUserId={userId} targetUserName={userName} />
            <RatingButton targetUserId={userId} targetUserName={userName} />
        </div>
    )
}

// Export vazio para manter compatibilidade (não usado mais)
export function ProfileSecondaryButtons({ userId, userName }: ProfileActionButtonsProps) {
    return null
}
