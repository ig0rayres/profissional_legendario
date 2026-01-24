'use client'

import { useState } from 'react'
import ImprovedCurrentHeaderV6 from '@/components/profile/headers/improved-current-header-v6'
import { CoverPhotoUpload } from '@/components/profile/cover-photo-upload'

// V6 Header Demo - Minimal Orange Usage
export default function Header6DemoPage() {
    const [isOwner, setIsOwner] = useState(false)
    const [coverUrl, setCoverUrl] = useState('/demo-cover.jpg')
    const [showCropModal, setShowCropModal] = useState(false)

    const handleCoverUpdate = (newUrl: string) => {
        console.log('Cover updated:', newUrl)
        setCoverUrl(newUrl)
        setShowCropModal(false)
    }

    const handleCoverSave = (croppedImageUrl: string) => {
        console.log('Saving cropped cover:', croppedImageUrl)
        handleCoverUpdate(croppedImageUrl)
    }

    const mockProfile = {
        id: 'demo-user-v6',
        avatar_url: '/placeholder.svg',
        full_name: 'Igor Rayres',
        professional_title: 'Desenvolvedor Full Stack',
        location: 'São Paulo, SP',
        rating: 4.9,
        cover_url: coverUrl
    }

    const mockGamification = {
        total_points: 1240,
        current_rank_id: 'elite',
        medals_count: 12
    }

    const mockMedals = [
        { id: '1', name: 'Pioneiro', icon: '🏆', description: 'Primeiro a testar' },
        { id: '2', name: 'Colaborador', icon: '🤝', description: 'Trabalho em equipe' },
        { id: '3', name: 'Inovador', icon: '💡', description: 'Ideias criativas' },
        { id: '4', name: 'Mentor', icon: '🎓', description: 'Ensinou outros' }
    ]

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
            <div className="container mx-auto py-8 px-4">
                <div className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
                    <h1 className="text-3xl font-bold text-white mb-2">V6 - Minimal Orange Usage 🧡</h1>
                    <p className="text-gray-300 mb-4">
                        Versão com laranja <strong>apenas nos elementos PRINCIPAIS</strong>: Avatar border, Badge de Patente e botão CTA &quot;Ofertar&quot;.
                    </p>

                    <div className="space-y-3 text-sm">
                        <div>
                            <h3 className="font-semibold text-white mb-2">✅ Laranja Mantido (Elementos Especiais):</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                                <li>Avatar border (identificação visual)</li>
                                <li>Badge de Patente (destaque de nível)</li>
                                <li>Botão &quot;Ofertar&quot; (CTA principal)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-white mb-2">🔄 Mudado para Verde/Branco:</h3>
                            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
                                <li>Estrelas de avaliação → Verde #1E4D40</li>
                                <li>Ícones de stats (Vigor, Medalhas) → Verde #1E4D40</li>
                                <li>Bordas das medalhas → Verde #1E4D40</li>
                                <li>Ícones sociais (mensagem, Instagram) → Branco</li>
                            </ul>
                        </div>

                        <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                            <h3 className="font-semibold text-white mb-2">🎨 Paleta de Cores:</h3>
                            <div className="flex gap-4 flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded border border-gray-600" style={{ background: '#1E4D40' }}></div>
                                    <span className="text-gray-300">#1E4D40 (Verde Floresta)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded border border-gray-600" style={{ background: '#D2691E' }}></div>
                                    <span className="text-gray-300">#D2691E (Laranja - Detalhes Especiais)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setIsOwner(!isOwner)}
                    className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                    {isOwner ? '👤 Modo Visitante' : '⚙️ Modo Proprietário'}
                </button>

                <div className="bg-gray-800 rounded-xl overflow-hidden shadow-2xl">
                    <ImprovedCurrentHeaderV6
                        profile={mockProfile}
                        gamification={mockGamification}
                        medals={mockMedals}
                        isOwner={isOwner}
                        onCoverUpdate={() => setShowCropModal(true)}
                    />
                </div>
            </div>

            <CoverPhotoUpload
                isOpen={showCropModal}
                onClose={() => setShowCropModal(false)}
                onSave={handleCoverSave}
                currentCoverUrl={coverUrl}
            />
        </div>
    )
}
