'use client'

import { ImprovedCurrentHeaderGray } from '@/components/profile/headers/improved-current-header-gray'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DemoHeader5Page() {
    const [isOwner, setIsOwner] = useState(true) // Para testar o botão de ajustar capa
    const [coverUrl, setCoverUrl] = useState<string | undefined>(undefined)

    const mockProfile = {
        full_name: 'RECRUTA TESTE',
        avatar_url: null,
        bio: 'Estrategista de Negócios | Aventureiro Corporativo',
        pista: 'Belo Horizonte, MG',
        rota_number: '141018',
        cover_url: coverUrl,
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

    const handleCoverUpdate = () => {
        // Simular upload de capa
        if (coverUrl) {
            setCoverUrl(undefined)
        } else {
            setCoverUrl('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=480&fit=crop')
        }
    }

    return (
        <div className="min-h-screen bg-[#0F1B1A] pt-20">
            <div className="max-w-6xl mx-auto p-6">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold text-white mb-2">Opção 5 - Versão GRAY (Sóbria)</h1>
                    <p className="text-gray-400">Cinza predominante, verde em detalhes (#10B981), laranja em destaques</p>

                    {/* Controles de Teste */}
                    <div className="flex justify-center gap-3 mt-4">
                        <Button
                            size="sm"
                            onClick={() => setIsOwner(!isOwner)}
                            variant={isOwner ? "default" : "outline"}
                        >
                            {isOwner ? "Modo Owner ✓" : "Modo Visitante"}
                        </Button>
                    </div>
                </div>

                <div className="bg-[#1A2421] rounded-2xl overflow-hidden shadow-2xl">
                    <ImprovedCurrentHeaderGray
                        profileData={mockProfile}
                        gamification={mockGamification}
                        medals={mockMedals}
                        isOwner={isOwner}
                        onCoverUpdate={handleCoverUpdate}
                    />
                </div>

                <div className="mt-6 p-4 bg-[#1A2421] rounded-lg border border-[#2D3B2D]">
                    <h3 className="text-white font-bold mb-3">Paleta SÓBRIA:</h3>
                    <ul className="text-gray-300 text-sm space-y-1">
                        <li>🎨 <strong>Cinza:</strong> Background principal (#1C1C1C, #2A2A2A, #3A3A3A)</li>
                        <li>🟢 <strong>Verde:</strong> Apenas detalhes (ícones, localização, social) - #10B981</li>
                        <li>🟠 <strong>Laranja:</strong> Apenas destaques (avatar, patente, Ofertar) - #D2691E</li>
                        <li>⚪ <strong>Branco/Cinza:</strong> Textos e botões secundários</li>
                        <li>✅ Mais profissional e corporativo</li>
                        <li>✅ Menos "aventura outdoor", mais "business premium"</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
