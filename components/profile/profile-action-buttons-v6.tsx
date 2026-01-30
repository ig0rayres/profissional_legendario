'use client'

import { useState } from 'react'
import { ConnectionButton } from './connection-button'
import { MessageButton } from './message-button'
import { ConfraternityButton } from './confraternity-button'
import { PrayerButton } from './prayer-button'
import { RatingButton } from './rating-button'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProfileActionButtonsV6Props {
    userId: string
    userName: string
}

/**
 * ProfileActionButtons com VISUAL DO V6
 * Mobile: menu sanduíche | Desktop: botões inline
 */
export function ProfileActionButtonsV6({ userId, userName }: ProfileActionButtonsV6Props) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <>
            {/* Mobile: Menu Sanduíche */}
            <div className="md:hidden relative">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="h-8 px-3 bg-[#1E4D40] hover:bg-[#2D6B4F] text-white border-0 text-xs"
                >
                    {menuOpen ? <X className="w-4 h-4 mr-1" /> : <Menu className="w-4 h-4 mr-1" />}
                    Ações
                </Button>

                {/* Dropdown Menu - ABRE PARA CIMA */}
                {menuOpen && (
                    <>
                        {/* Overlay para fechar ao clicar fora */}
                        <div
                            className="fixed inset-0 z-[9998]"
                            onClick={() => setMenuOpen(false)}
                        />

                        {/* Menu centralizado */}
                        <div className="fixed left-1/2 -translate-x-1/2 bottom-0 z-[9999] bg-[#1A2421] border border-[#3D6B54]/50 rounded-t-xl shadow-2xl p-3 w-[220px] max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
                            <div className="flex flex-col gap-2">
                                <div className="mobile-action-item" onClick={() => setMenuOpen(false)}>
                                    <ConnectionButton targetUserId={userId} targetUserName={userName} />
                                </div>
                                <div className="mobile-action-item" onClick={() => setMenuOpen(false)}>
                                    <MessageButton targetUserId={userId} targetUserName={userName} />
                                </div>
                                <div className="mobile-action-item" onClick={() => setMenuOpen(false)}>
                                    <ConfraternityButton targetUserId={userId} targetUserName={userName} />
                                </div>
                                <div className="mobile-action-item" onClick={() => setMenuOpen(false)}>
                                    <RatingButton targetUserId={userId} targetUserName={userName} />
                                </div>
                                <div className="mobile-action-item" onClick={() => setMenuOpen(false)}>
                                    <PrayerButton targetUserId={userId} targetUserName={userName} />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Desktop: Botões inline */}
            <div className="hidden md:flex items-center gap-2">
                <div className="profile-action-btn-v6">
                    <ConnectionButton targetUserId={userId} targetUserName={userName} />
                </div>
                <div className="profile-action-btn-v6">
                    <MessageButton targetUserId={userId} targetUserName={userName} />
                </div>
                <div className="profile-action-btn-v6">
                    <ConfraternityButton targetUserId={userId} targetUserName={userName} />
                </div>
                <div className="profile-action-btn-v6">
                    <RatingButton targetUserId={userId} targetUserName={userName} />
                </div>
                <div className="profile-action-btn-v6">
                    <PrayerButton targetUserId={userId} targetUserName={userName} />
                </div>
            </div>

            <style jsx>{`
                /* Mobile dropdown items */
                .mobile-action-item :global(button) {
                    width: 100% !important;
                    justify-content: flex-start !important;
                    height: 40px !important;
                    padding: 0 12px !important;
                    font-size: 13px !important;
                    background: transparent !important;
                    color: #F2F4F3 !important;
                    border: none !important;
                    border-radius: 8px !important;
                }
                
                .mobile-action-item :global(button:hover) {
                    background: rgba(45, 59, 45, 0.5) !important;
                }

                /* Desktop buttons */
                .profile-action-btn-v6 :global(button) {
                    height: 36px !important;
                    padding: 0 12px !important;
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

                /* Primeiro botão desktop - Laranja especial */
                .profile-action-btn-v6:first-child :global(button) {
                    background: #D2691E !important;
                    border-color: #D2691E !important;
                }
                
                .profile-action-btn-v6:first-child :global(button:hover) {
                    background: #C85A17 !important;
                    border-color: #C85A17 !important;
                }
            `}</style>
        </>
    )
}

