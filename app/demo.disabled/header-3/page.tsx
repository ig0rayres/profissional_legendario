'use client'

import { GlassCardHeader } from '@/components/profile/headers/glass-card-header'

export default function DemoHeader3Page() {
    const mockProfile = {
        full_name: 'ALEXANDRE SILVA',
        avatar_url: null,
        bio: 'Analista Financeiro Senior',
        pista: 'San Francisco, CA',
        rota_number: '141018',
    }

    const mockGamification = {
        total_points: 50,
        current_rank_id: 'novato',
        medals_count: 1,
    }

    const mockMedals = [
        { id: '1', icon: 'trophy', name: 'Leadership' },
        { id: '2', icon: 'star', name: 'Innovation' },
        { id: '3', icon: 'shield', name: 'Partnership' },
    ]

    return (
        <div className="min-h-screen bg-[#0F1B1A] pt-20">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Opção 5 - Glass Card</h1>
                    <p className="text-gray-400">Card flutuante com paleta corrigida</p>
                </div>

                <div className="bg-[#1A2421] rounded-2xl overflow-hidden shadow-2xl">
                    <GlassCardHeader
                        profileData={mockProfile}
                        gamification={mockGamification}
                        medals={mockMedals}
                        isOwner={false}
                    />
                </div>

                <div className="mt-6 p-4 bg-[#1A2421] rounded-lg border border-[#2D3B2D]">
                    <h3 className="text-white font-bold mb-2">Características:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                        <li>✅ Glass morphism com blur</li>
                        <li>✅ Paleta 100% correta (#1A2421, #D2691E, #2D3B2D)</li>
                        <li>✅ Avatar 100px + Trophy case</li>
                        <li>✅ Stats inline compactos</li>
                        <li>✅ Botões em linha única</li>
                        <li>✅ Costa dramática ao fundo</li>
                        <li>✅ Altura: 240px</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
