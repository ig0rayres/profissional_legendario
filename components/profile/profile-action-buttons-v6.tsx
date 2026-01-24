'use client'

import { ConnectionButton } from './connection-button'
import { MessageButton } from './message-button'
import { ConfraternityButton } from './confraternity-button'
import { PrayerButton } from './prayer-button'
import { RatingButton } from './rating-button'
import { Flame, MessageCircle, UserPlus, Users, Star } from 'lucide-react'

interface ProfileActionButtonsV6Props {
    userId: string
    userName: string
}

/**
 * ProfileActionButtons com VISUAL DO V6
 * Mantém TODA a lógica original, apenas muda o estilo
 */
export function ProfileActionButtonsV6({ userId, userName }: ProfileActionButtonsV6Props) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* ConnectionButton com estilo V6 */}
            <div className="profile-action-btn-v6">
                <ConnectionButton targetUserId={userId} targetUserName={userName} />
            </div>

            {/* MessageButton com estilo V6 */}
            <div className="profile-action-btn-v6">
                <MessageButton targetUserId={userId} targetUserName={userName} />
            </div>

            {/* ConfraternityButton com estilo V6 */}
            <div className="profile-action-btn-v6">
                <ConfraternityButton targetUserId={userId} targetUserName={userName} />
            </div>

            {/* RatingButton com estilo V6 */}
            <div className="profile-action-btn-v6">
                <RatingButton targetUserId={userId} targetUserName={userName} />
            </div>

            {/* PrayerButton com estilo V6 */}
            <div className="profile-action-btn-v6">
                <PrayerButton targetUserId={userId} targetUserName={userName} />
            </div>

            <style jsx>{`
                .profile-action-btn-v6 :global(button) {
                    height: 36px !important;
                    font-size: 13px !important;
                    font-weight: 500 !important;
                    border: 1px solid rgba(45, 59, 45, 0.5) !important;
                    background: transparent !important;
                    color: #F2F4F3 !important;
                    transition: all 0.2s ease !important;
                }
                
                .profile-action-btn-v6 :global(button:hover) {
                    background: rgba(45, 59, 45, 0.8) !important;
                    border-color: rgba(45, 59, 45, 0.8) !important;
                    transform: translateY(-1px);
                }

                /* Ofertar button - Laranja especial */
                .profile-action-btn-v6:first-child :global(button) {
                    background: #D2691E !important;
                    border-color: #D2691E !important;
                }
                
                .profile-action-btn-v6:first-child :global(button:hover) {
                    background: #C85A17 !important;
                    border-color: #C85A17 !important;
                }
            `}</style>
        </div>
    )
}
