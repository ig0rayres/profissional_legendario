'use client'

import { RotaValenteCard } from '@/components/profile/rota-valente-card'
import { RotaValenteV1 } from '@/components/profile/rota-valente-v1'
import { RotaValenteV2 } from '@/components/profile/rota-valente-v2'
import { RotaValenteV3 } from '@/components/profile/rota-valente-v3'
import { RotaValenteV4 } from '@/components/profile/rota-valente-v4'
import { RotaValenteV5 } from '@/components/profile/rota-valente-v5'
import { RotaValenteHUD1 } from '@/components/profile/rota-valente-hud1'
import { RotaValenteHUD2 } from '@/components/profile/rota-valente-hud2'
import { RotaValenteHUD3 } from '@/components/profile/rota-valente-hud3'

// DADOS MOCKADOS para visualização
const mockGamification = {
    id: '1',
    user_id: 'mock-user',
    total_points: 120,
    current_rank_id: '1',
    rank: {
        id: '1',
        name: 'Novato',
        icon: 'shield',
        points_required: 0,
        color: '#1E4D40'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
}

const mockSubscription = {
    id: '1',
    user_id: 'mock-user',
    status: 'active',
    plan_tiers: {
        id: '1',
        name: 'RECRUTA',
        price: 0
    }
}

const mockNextRank = {
    id: '2',
    name: 'Especialista',
    icon: 'target',
    points_required: 200,
    color: '#D4742C'
}

const mockMedals = [
    { id: '1', name: 'Alistamento', description: 'Concluiu cadastro', icon: 'check-circle', points_value: 10 },
    { id: '2', name: 'Presente', description: 'Participou de evento', icon: 'calendar', points_value: 15 },
    { id: '3', name: 'Confraria', description: 'Primeira confraria', icon: 'users', points_value: 20 },
    { id: '4', name: 'Anfitrião', description: 'Organizou evento', icon: 'home', points_value: 25 },
    { id: '5', name: 'Cronista', description: 'Postou conteúdo', icon: 'edit', points_value: 15 },
    { id: '6', name: 'Networker', description: 'Conexões ativas', icon: 'link', points_value: 20 },
    { id: '7', name: 'Líder', description: 'Liderou confraria', icon: 'crown', points_value: 30 },
    { id: '8', name: 'Mestre', description: '10+ conexões', icon: 'star', points_value: 25 },
    { id: '9', name: 'Batismo', description: 'Primeiro projeto', icon: 'award', points_value: 20 },
    { id: '10', name: 'Cineasta', description: 'Postou vídeo', icon: 'video', points_value: 15 },
    { id: '11', name: 'Mentor', description: 'Ajudou novato', icon: 'heart', points_value: 25 },
    { id: '12', name: 'Pioneiro', description: 'Membro fundador', icon: 'flag', points_value: 50 },
]

const mockEarnedMedals = [
    { id: '1', user_id: 'mock', medal_id: '1', earned_at: new Date().toISOString() },
    { id: '2', user_id: 'mock', medal_id: '2', earned_at: new Date().toISOString() },
    { id: '3', user_id: 'mock', medal_id: '3', earned_at: new Date().toISOString() },
]

export default function TesteValentePage() {
    const commonProps = {
        gamification: mockGamification as any,
        subscription: mockSubscription as any,
        nextRank: mockNextRank as any,
        allMedals: mockMedals as any,
        earnedMedals: mockEarnedMedals as any
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-black text-white mb-2 text-center">
                    🎮 TESTE: Rota do Valente
                </h1>
                <p className="text-gray-500 text-center mb-8">
                    8 Versões • Dados Mockados (120/200 pts)
                </p>

                <div className="space-y-10">
                    {/* ORIGINAL */}
                    <div>
                        <h2 className="text-sm font-bold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                            <span className="bg-green-400 text-black px-2 py-0.5 rounded text-xs">ATUAL</span>
                            ORIGINAL
                        </h2>
                        <RotaValenteCard {...commonProps} />
                    </div>

                    <div className="border-t border-white/10 pt-8">
                        <h3 className="text-white/30 text-center text-xs uppercase tracking-widest mb-6">— 5 VERSÕES INICIAIS —</h3>
                    </div>

                    {/* V1 */}
                    <div>
                        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-3">
                            V1 - MINIMAL COMPACT (20% mais baixo)
                        </h2>
                        <RotaValenteV1 {...commonProps} />
                    </div>

                    {/* V2 */}
                    <div>
                        <h2 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-3">
                            V2 - PROGRESS FILL (Líquido subindo)
                        </h2>
                        <RotaValenteV2 {...commonProps} />
                    </div>

                    {/* V3 */}
                    <div>
                        <h2 className="text-sm font-bold text-pink-400 uppercase tracking-wider mb-3">
                            V3 - GLASSMORPHISM HORIZONTAL
                        </h2>
                        <RotaValenteV3 {...commonProps} />
                    </div>

                    {/* V4 */}
                    <div>
                        <h2 className="text-sm font-bold text-yellow-400 uppercase tracking-wider mb-3">
                            V4 - MILITARY BADGE STYLE
                        </h2>
                        <RotaValenteV4 {...commonProps} />
                    </div>

                    {/* V5 */}
                    <div>
                        <h2 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-3">
                            V5 - GAMING STATS
                        </h2>
                        <RotaValenteV5 {...commonProps} />
                    </div>

                    <div className="border-t border-white/10 pt-8">
                        <h3 className="text-white/30 text-center text-xs uppercase tracking-widest mb-6">— 3 HUDs DE VIDEO GAME —</h3>
                    </div>

                    {/* HUD 1 - CYBERPUNK */}
                    <div>
                        <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-3">
                            🎯 HUD 1 - CYBERPUNK
                        </h2>
                        <RotaValenteHUD1 {...commonProps} />
                    </div>

                    {/* HUD 2 - RPG */}
                    <div>
                        <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">
                            ⚔️ HUD 2 - RPG MEDIEVAL
                        </h2>
                        <RotaValenteHUD2 {...commonProps} />
                    </div>

                    {/* HUD 3 - TACTICAL */}
                    <div>
                        <h2 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-3">
                            🛡️ HUD 3 - TACTICAL MILITARY
                        </h2>
                        <RotaValenteHUD3 {...commonProps} />
                    </div>
                </div>

                <div className="mt-12 text-center text-gray-600 text-sm">
                    Design por Lucas Mendes • UI/UX Designer
                </div>
            </div>
        </div>
    )
}
