'use client'

import { MenuHorizontalHeader } from '@/components/profile/headers/menu-horizontal-header'

export default function DemoHeader2Page() {
    const mockProfile = {
        full_name: 'RECRUTA TESTE',
        avatar_url: null,
        bio: 'Outdoor Strategy & Development Lead',
        pista: 'Denver, CO, USA',
        rota_number: '141018',
    }

    const mockGamification = {
        total_points: 50,
        current_rank_id: 'novato',
        medals_count: 1,
    }

    const mockMedals = [
        { id: '1', icon: 'trophy', name: 'Trailblazer Award' },
        { id: '2', icon: 'star', name: 'Community Builder' },
        { id: '3', icon: 'shield', name: 'Strategic Visionary' },
        { id: '4', icon: 'flame', name: 'Peak Performance' },
    ]

    return (
        <div className="min-h-screen bg-[#0F1B1A] pt-20">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Opção C - Menu Horizontal</h1>
                    <p className="text-gray-400">Avatar à esquerda com trophy showcase</p>
                </div>

                <div className="bg-[#1A2421] rounded-2xl overflow-hidden shadow-2xl">
                    <MenuHorizontalHeader
                        profileData={mockProfile}
                        gamification={mockGamification}
                        medals={mockMedals}
                        isOwner={false}
                    />
                </div>

                <div className="mt-6 p-4 bg-[#1A2421] rounded-lg border border-[#2D3B2D]">
                    <h3 className="text-white font-bold mb-2">Características:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                        <li>✅ Avatar 85px à esquerda</li>
                        <li>✅ Med alhas orbitando avatar</li>
                        <li>✅ Stats + Trophy showcase horizontal</li>
                        <li>✅ Menu horizontal com 6 ações</li>
                        <li>✅ Floresta atmosférica ao fundo</li>
                        <li>✅ Altura: 240px</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
