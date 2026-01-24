'use client'

import { ImprovedCurrentHeaderV5Green } from '@/components/profile/headers/improved-current-header-v5-green'

export default function HeaderV5GreenDemo() {
    const mockProfile = {
        full_name: 'Carlos Eduardo Silva',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        bio: 'Empreendedor apaixonado por tecnologia e inovação',
        pista: 'São Paulo, SP',
        rota_number: 'RT-2024-001',
        cover_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=480&fit=crop'
    }

    const mockGamification = {
        total_points: 2847,
        current_rank_id: 'Elite',
        medals_count: 12
    }

    const mockMedals = [
        { id: '1', icon: '🏆', name: 'Primeiro Passo' },
        { id: '2', icon: '🎯', name: 'Precisão' },
        { id: '3', icon: '🔥', name: 'Sequência' },
        { id: '4', icon: '⭐', name: 'Destaque' },
        { id: '5', icon: '💎', name: 'Diamante' },
        { id: '6', icon: '🎖️', name: 'Veterano' },
        { id: '7', icon: '🌟', name: 'Brilhante' },
        { id: '8', icon: '👑', name: 'Líder' },
        { id: '9', icon: '🚀', name: 'Foguete' },
        { id: '10', icon: '💪', name: 'Força' },
        { id: '11', icon: '🎓', name: 'Mentor' },
        { id: '12', icon: '🏅', name: 'Campeão' },
    ]

    return (
        <div className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">V5 Verde - Paleta Floresta</h1>
                    <p className="text-gray-400 mb-4">
                        Altura: 320px | Verde principal + Cinza/Laranja em detalhes | Com suporte a capa
                    </p>
                </div>

                <div className="border border-white/10 rounded-lg overflow-hidden shadow-2xl">
                    <ImprovedCurrentHeaderV5Green
                        profileData={mockProfile}
                        gamification={mockGamification}
                        medals={mockMedals}
                        isOwner={false}
                    />
                </div>

                <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Características:</h3>
                    <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
                        <li>Paleta verde floresta (#1A2421, #2D3B2D)</li>
                        <li>Cinza nos ícones de stats e medalhas</li>
                        <li>Laranja nos destaques (borda avatar, patente, botão "Ofertar")</li>
                        <li>Glass morphism com backdrop blur</li>
                        <li>Suporte completo para foto de capa</li>
                        <li>Delta de Vigor com trending up</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
