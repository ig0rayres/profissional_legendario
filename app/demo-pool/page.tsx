'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Palette } from 'lucide-react'

// V3 - Militar
import { ProjectsCounterV3, ElosDaRotaV3, ConfraternityStatsV3, NaRotaFeedV3 } from '@/components/profile/cards-v3-militar'

// V4 - Executivo
import { ProjectsCounterV4, ElosDaRotaV4, ConfraternityStatsV4, NaRotaFeedV4 } from '@/components/profile/cards-v4-executivo'

// V5 - Elegante
import { ProjectsCounterV5, ElosDaRotaV5, ConfraternityStatsV5, NaRotaFeedV5 } from '@/components/profile/cards-v5-elegante'

// V6 - Hybrid
import { ProjectsCounterV6, ElosDaRotaV6, ConfraternityStatsV6, NaRotaFeedV6 } from '@/components/profile/cards-v6-hybrid'

// V7 - Premium Dark
import { ProjectsCounterV7, ElosDaRotaV7, ConfraternityStatsV7, NaRotaFeedV7 } from '@/components/profile/cards-v7-premium-dark'

// V8 - Glass Emerald
import { ProjectsCounterV8, ElosDaRotaV8, ConfraternityStatsV8, NaRotaFeedV8 } from '@/components/profile/cards-v8-glass-emerald'

// V9 - Glass Sapphire
import { ProjectsCounterV9, ElosDaRotaV9, ConfraternityStatsV9, NaRotaFeedV9 } from '@/components/profile/cards-v9-glass-sapphire'

// V10 - Glass Amber
import { ProjectsCounterV10, ElosDaRotaV10, ConfraternityStatsV10, NaRotaFeedV10 } from '@/components/profile/cards-v10-glass-amber'

// V11 - Glass Violet
import { ProjectsCounterV11, ElosDaRotaV11, ConfraternityStatsV11, NaRotaFeedV11 } from '@/components/profile/cards-v11-glass-violet'

// V12 - Ultra Interactive
import { RotaDoValenteV12, ProjectsCounterV12, ElosDaRotaV12, ConfraternityStatsV12, NaRotaFeedV12 } from '@/components/profile/cards-v12-ultra-interactive'

// V13 - Brand Colors
import { RotaDoValenteV13, ProjectsCounterV13, ElosDaRotaV13, ConfraternityStatsV13, NaRotaFeedV13 } from '@/components/profile/cards-v13-brand-colors'

// V14 - Complete Brand (Rota V1B atual + Cards V13)
import { RotaDoValenteV14, ProjectsCounterV14, ElosDaRotaV14, ConfraternityStatsV14, NaRotaFeedV14 } from '@/components/profile/cards-v14-complete-brand'

const VERSIONS = [
    {
        id: 'v14',
        name: 'V14 - Completo (Rota V1B + Cards V13) 🎨',
        description: 'Rota do Valente ATUAL + Cards com cores do projeto',
        color: 'from-gray-50 via-white to-gray-50',
        featured: true,
        complete: true,
        components: {
            RotaValente: RotaDoValenteV14,
            Projects: ProjectsCounterV14,
            Elos: ElosDaRotaV14,
            Confraternity: ConfraternityStatsV14,
            Feed: NaRotaFeedV14
        }
    },
    {
        id: 'v13',
        name: 'V13 - Brand Colors (Cards) 🎨',
        description: 'Apenas cards com cores do projeto',
        color: 'from-gray-50 via-white to-gray-50',
        components: {
            RotaValente: RotaDoValenteV13,
            Projects: ProjectsCounterV13,
            Elos: ElosDaRotaV13,
            Confraternity: ConfraternityStatsV13,
            Feed: NaRotaFeedV13
        }
    },
    {
        id: 'v12',
        name: 'V12 - Ultra Interactive ⭐',
        description: 'Máxima interatividade com Rota do Valente em destaque',
        color: 'from-emerald-50 via-white to-teal-50',
        featured: true,
        components: {
            RotaValente: RotaDoValenteV12,
            Projects: ProjectsCounterV12,
            Elos: ElosDaRotaV12,
            Confraternity: ConfraternityStatsV12,
            Feed: NaRotaFeedV12
        }
    },
    {
        id: 'v3',
        name: 'V3 - Clássico Militar',
        description: 'Robusto e sóbrio, tons escuros',
        color: 'from-gray-800 to-gray-900',
        components: {
            Projects: ProjectsCounterV3,
            Elos: ElosDaRotaV3,
            Confraternity: ConfraternityStatsV3,
            Feed: NaRotaFeedV3
        }
    },
    {
        id: 'v4',
        name: 'V4 - Executivo Premium',
        description: 'Limpo e profissional, LinkedIn-like',
        color: 'from-gray-50 to-gray-100',
        components: {
            Projects: ProjectsCounterV4,
            Elos: ElosDaRotaV4,
            Confraternity: ConfraternityStatsV4,
            Feed: NaRotaFeedV4
        }
    },
    {
        id: 'v5',
        name: 'V5 - Elegante Floresta',
        description: 'Minimalista e sofisticado, Instagram-like',
        color: 'from-green-50 to-emerald-50',
        components: {
            Projects: ProjectsCounterV5,
            Elos: ElosDaRotaV5,
            Confraternity: ConfraternityStatsV5,
            Feed: NaRotaFeedV5
        }
    },
    {
        id: 'v6',
        name: 'V6 - Executivo Elegante (Hybrid)',
        description: 'Melhor do V4 + V5',
        color: 'from-slate-50 to-blue-50',
        components: {
            Projects: ProjectsCounterV6,
            Elos: ElosDaRotaV6,
            Confraternity: ConfraternityStatsV6,
            Feed: NaRotaFeedV6
        }
    },
    {
        id: 'v7',
        name: 'V7 - Premium Dark',
        description: 'Fundo escuro com acentos dourados',
        color: 'from-gray-900 to-black',
        components: {
            Projects: ProjectsCounterV7,
            Elos: ElosDaRotaV7,
            Confraternity: ConfraternityStatsV7,
            Feed: NaRotaFeedV7
        }
    },
    {
        id: 'v8',
        name: 'V8 - Glass Emerald',
        description: 'Glass morphism verde esmeralda',
        color: 'from-emerald-100 to-teal-100',
        components: {
            Projects: ProjectsCounterV8,
            Elos: ElosDaRotaV8,
            Confraternity: ConfraternityStatsV8,
            Feed: NaRotaFeedV8
        }
    },
    {
        id: 'v9',
        name: 'V9 - Glass Sapphire',
        description: 'Glass morphism azul safira',
        color: 'from-blue-100 to-cyan-100',
        components: {
            Projects: ProjectsCounterV9,
            Elos: ElosDaRotaV9,
            Confraternity: ConfraternityStatsV9,
            Feed: NaRotaFeedV9
        }
    },
    {
        id: 'v10',
        name: 'V10 - Glass Amber',
        description: 'Glass morphism tons quentes',
        color: 'from-amber-100 to-orange-100',
        components: {
            Projects: ProjectsCounterV10,
            Elos: ElosDaRotaV10,
            Confraternity: ConfraternityStatsV10,
            Feed: NaRotaFeedV10
        }
    },
    {
        id: 'v11',
        name: 'V11 - Glass Violet',
        description: 'Glass morphism violeta/roxo',
        color: 'from-violet-100 to-purple-100',
        components: {
            Projects: ProjectsCounterV11,
            Elos: ElosDaRotaV11,
            Confraternity: ConfraternityStatsV11,
            Feed: NaRotaFeedV11
        }
    }
]

// Mock data
const mockData = {
    userId: 'demo-user',
    userName: 'Igor Ayres',
    userAvatar: null,
    completedCount: 12,
    inProgressCount: 3,
    connections: [
        { id: '1', full_name: 'João Silva', avatar_url: null, rank_name: 'Veterano' },
        { id: '2', full_name: 'Maria Santos', avatar_url: null, rank_name: 'Elite' },
        { id: '3', full_name: 'Pedro Costa', avatar_url: null, rank_name: 'Recruta' },
        { id: '4', full_name: 'Ana Lima', avatar_url: null, rank_name: 'Veterano' },
        { id: '5', full_name: 'Carlos Souza', avatar_url: null, rank_name: 'Elite' }
    ],
    pendingCount: 2,
    confraternities: [
        {
            id: '1',
            proposed_date: new Date(Date.now() + 86400000 * 3).toISOString(),
            location: 'Café Central',
            partner: { full_name: 'Roberto Alves', avatar_url: null }
        },
        {
            id: '2',
            proposed_date: new Date(Date.now() + 86400000 * 7).toISOString(),
            location: 'Restaurante Italiano',
            partner: { full_name: 'Fernanda Rocha', avatar_url: null }
        }
    ],
    ratings: [
        {
            id: '1',
            rating: 5,
            comment: 'Excelente profissional!',
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            reviewer: { full_name: 'Lucas Mendes', avatar_url: null }
        }
    ],
    portfolio: [],
    // Dados para Rota do Valente
    rotaValente: {
        currentXP: 850,
        nextLevelXP: 1000,
        currentLevel: 5,
        rankName: 'Veterano',
        totalMedals: 8,
        vigor: 75,
        position: 12
    }
}

export default function DemoPoolPage() {
    const [currentVersion, setCurrentVersion] = useState(0)

    const version = VERSIONS[currentVersion]
    const RotaValenteComponent = version.components.RotaValente
    const ProjectsComponent = version.components.Projects
    const ElosComponent = version.components.Elos
    const ConfraternityComponent = version.components.Confraternity
    const FeedComponent = version.components.Feed

    const nextVersion = () => {
        setCurrentVersion((prev) => (prev + 1) % VERSIONS.length)
    }

    const prevVersion = () => {
        setCurrentVersion((prev) => (prev - 1 + VERSIONS.length) % VERSIONS.length)
    }

    return (
        <div className={`min-h-screen bg-gradient-to-br ${version.color} transition-all duration-500`}>
            {/* Header fixo */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                <Palette className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">
                                    Piscina de Templates
                                </h1>
                                <p className="text-xs text-gray-600">
                                    {VERSIONS.length} versões disponíveis
                                </p>
                            </div>
                        </div>

                        {/* Navegação */}
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={prevVersion}
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>

                            <div className="text-center px-4">
                                <p className="text-sm font-bold text-gray-900">
                                    {version.name}
                                </p>
                                <p className="text-xs text-gray-600">
                                    {currentVersion + 1} de {VERSIONS.length}
                                </p>
                            </div>

                            <Button
                                onClick={nextVersion}
                                variant="outline"
                                size="sm"
                                className="rounded-xl"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Descrição */}
                    <div className="mt-3 text-center">
                        <p className="text-sm text-gray-700">
                            {version.description}
                        </p>
                    </div>

                    {/* Seletor rápido */}
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {VERSIONS.map((v, idx) => (
                            <button
                                key={v.id}
                                onClick={() => setCurrentVersion(idx)}
                                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${idx === currentVersion
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-white/50 text-gray-700 hover:bg-white/80'
                                    }`}
                            >
                                {v.name.split(' - ')[0]}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rota do Valente - DESTAQUE (apenas V12) */}
                    {RotaValenteComponent && (
                        <div className="lg:col-span-2 transition-all duration-500">
                            <RotaValenteComponent
                                currentXP={mockData.rotaValente.currentXP}
                                nextLevelXP={mockData.rotaValente.nextLevelXP}
                                currentLevel={mockData.rotaValente.currentLevel}
                                rankName={mockData.rotaValente.rankName}
                                totalMedals={mockData.rotaValente.totalMedals}
                                vigor={mockData.rotaValente.vigor}
                                position={mockData.rotaValente.position}
                            />
                        </div>
                    )}

                    {/* Projetos */}
                    <div className="transition-all duration-500">
                        <ProjectsComponent
                            completedCount={mockData.completedCount}
                            inProgressCount={mockData.inProgressCount}
                            showButton={true}
                            canShowButton={false}
                        />
                    </div>

                    {/* Elos */}
                    <div className="transition-all duration-500">
                        <ElosComponent
                            connections={mockData.connections}
                            pendingCount={mockData.pendingCount}
                            userId={mockData.userId}
                        />
                    </div>

                    {/* Confrarias */}
                    <div className="transition-all duration-500">
                        <ConfraternityComponent
                            confraternities={mockData.confraternities}
                        />
                    </div>

                    {/* Feed */}
                    <div className="transition-all duration-500">
                        <FeedComponent
                            userId={mockData.userId}
                            userName={mockData.userName}
                            userAvatar={mockData.userAvatar}
                            ratings={mockData.ratings}
                            portfolio={mockData.portfolio}
                        />
                    </div>
                </div>

                {/* Info adicional */}
                <Card className="mt-8 bg-white/50 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-2">
                            💡 Dica de Navegação
                        </h3>
                        <p className="text-sm text-gray-700">
                            Use as setas <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">←</kbd> e <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">→</kbd> ou clique nos botões acima para navegar entre as versões.
                            Você também pode clicar diretamente no nome da versão desejada.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
