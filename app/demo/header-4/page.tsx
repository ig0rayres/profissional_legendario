'use client'

import { ImprovedCurrentHeader } from '@/components/profile/headers/improved-current-header'

export default function DemoHeader4Page() {
    const mockProfile = {
        full_name: 'RECRUTA TESTE',
        avatar_url: null,
        bio: 'Estrategista de Negócios | Aventureiro Corporativo',
        pista: 'Belo Horizonte, MG',
        rota_number: '141018',
    }

    const mockGamification = {
        total_points: 375,
        current_rank_id: 'especialista',
        medals_count: 3,
    }

    const mockMedals = [
        { id: '1', icon: 'trophy', name: 'Alistamento Concluído' },
        { id: '2', icon: 'star', name: 'Primeiro Sangue' },
        { id: '3', icon: 'shield', name: 'Guardião' },
        { id: '4', icon: 'flame', name: 'Networker Ativo' },
    ]

    return (
        <div className="min-h-screen bg-[#0F1B1A] pt-20">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Opção 4 - Atual Melhorada</h1>
                    <p className="text-gray-400">Com pilares Glass/Depth + Gamificação Elegante</p>
                </div>

                <div className="bg-[#1A2421] rounded-2xl overflow-hidden shadow-2xl">
                    <ImprovedCurrentHeader
                        profileData={mockProfile}
                        gamification={mockGamification}
                        medals={mockMedals}
                        isOwner={false}
                    />
                </div>

                <div className="mt-6 p-4 bg-[#1A2421] rounded-lg border border-[#2D3B2D]">
                    <h3 className="text-white font-bold mb-2">Melhorias Aplicadas:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                        <li>✅ <strong>Pilar C - Glass/Depth:</strong> Backdrop blur, camadas com sombras suaves</li>
                        <li>✅ <strong>Pilar D - Gamificação Elegante:</strong> Stats com badges, progresso visual, níveis</li>
                        <li>✅ Avatar maior (128px) com shadow profundo</li>
                        <li>✅ Stats em cards glass com delta de progresso</li>
                        <li>✅ Showcase de medalhas com efeito 3D</li>
                        <li>✅ Action bar com backdrop blur</li>
                        <li>✅ Topographic pattern sutil</li>
                        <li>✅ Altura: 280px (mais conteúdo)</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
