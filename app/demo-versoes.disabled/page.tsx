'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'

// V3 - Militar
import { ProjectsCounterV3, ElosDaRotaV3, ConfraternityStatsV3, NaRotaFeedV3 } from '@/components/profile/cards-v3-militar'
// V4 - Executivo
import { ProjectsCounterV4, ElosDaRotaV4, ConfraternityStatsV4, NaRotaFeedV4 } from '@/components/profile/cards-v4-executivo'
// V5 - Elegante
import { ProjectsCounterV5, ElosDaRotaV5, ConfraternityStatsV5, NaRotaFeedV5 } from '@/components/profile/cards-v5-elegante'

// Dados mockados
const MOCK_CONNECTIONS = [
    { id: '1', full_name: 'João Silva', avatar_url: null, rank_name: 'Comandante' },
    { id: '2', full_name: 'Maria Santos', avatar_url: null, rank_name: 'Guardião' },
    { id: '3', full_name: 'Carlos Oliveira', avatar_url: null, rank_name: 'Especialista' },
    { id: '4', full_name: 'Ana Costa', avatar_url: null, rank_name: 'Novato' },
    { id: '5', full_name: 'Pedro Lima', avatar_url: null, rank_name: 'General' },
    { id: '6', full_name: 'Fernanda Souza', avatar_url: null, rank_name: 'Lenda' },
    { id: '7', full_name: 'Ricardo Alves', avatar_url: null, rank_name: 'Comandante' },
]

const MOCK_CONFRATERNITIES = [
    {
        id: '1',
        proposed_date: new Date(Date.now() + 86400000 * 2).toISOString(),
        location: 'São Paulo, SP',
        partner: { full_name: 'João Silva', avatar_url: null }
    },
    {
        id: '2',
        proposed_date: new Date(Date.now() + 86400000 * 5).toISOString(),
        location: 'Rio de Janeiro, RJ',
        partner: { full_name: 'Maria Santos', avatar_url: null }
    },
]

const MOCK_RATINGS = [
    { id: '1', rating: 5, comment: 'Excelente profissional! Superou todas as expectativas.', created_at: new Date(Date.now() - 3600000).toISOString(), reviewer: { full_name: 'João Silva' } },
    { id: '2', rating: 4, comment: 'Muito bom trabalho, recomendo!', created_at: new Date(Date.now() - 86400000).toISOString(), reviewer: { full_name: 'Maria Santos' } },
]

const VERSIONS = [
    {
        id: 'v3',
        name: 'V3 - Clássico Militar',
        description: 'Design robusto e sóbrio, estilo militar',
        bgClass: 'bg-[#0A0F0D]'
    },
    {
        id: 'v4',
        name: 'V4 - Executivo Premium',
        description: 'Limpo e profissional para empreendedores',
        bgClass: 'bg-[#F5F5F5]'
    },
    {
        id: 'v5',
        name: 'V5 - Elegante Floresta',
        description: 'Minimalista e sofisticado',
        bgClass: 'bg-[#F0F5F0]'
    }
]

export default function DemoAllVersionsPage() {
    const [currentVersion, setCurrentVersion] = useState(0)

    const version = VERSIONS[currentVersion]

    const goNext = () => setCurrentVersion((prev) => (prev + 1) % VERSIONS.length)
    const goPrev = () => setCurrentVersion((prev) => (prev - 1 + VERSIONS.length) % VERSIONS.length)

    return (
        <div className={`min-h-screen ${version.bgClass} transition-colors duration-500`}>
            {/* Header de navegação */}
            <div className="sticky top-0 z-50 bg-gradient-to-r from-[#1E4D40] to-[#2A6B5A] text-white shadow-lg">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5" />
                            <div>
                                <h1 className="font-bold text-sm uppercase tracking-wider">
                                    Lucas UI/UX - Comparador de Versões
                                </h1>
                                <p className="text-xs text-white/70">
                                    3 propostas de design para escolha
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-white hover:bg-white/10"
                                onClick={goPrev}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </Button>

                            <div className="text-center min-w-[160px]">
                                <p className="font-bold">{version.name}</p>
                                <p className="text-xs text-white/70">{currentVersion + 1} de {VERSIONS.length}</p>
                            </div>

                            <Button
                                size="sm"
                                variant="ghost"
                                className="text-white hover:bg-white/10"
                                onClick={goNext}
                            >
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>

                    {/* Indicadores */}
                    <div className="flex justify-center gap-2 mt-2">
                        {VERSIONS.map((v, idx) => (
                            <button
                                key={v.id}
                                onClick={() => setCurrentVersion(idx)}
                                className={`h-1.5 rounded-full transition-all ${idx === currentVersion
                                        ? 'w-8 bg-white'
                                        : 'w-4 bg-white/30 hover:bg-white/50'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="text-center mb-8">
                    <h2 className={`text-2xl font-bold ${version.id === 'v3' ? 'text-[#C5D4C0]' : 'text-[#1E4D40]'}`}>
                        {version.name}
                    </h2>
                    <p className={`text-sm ${version.id === 'v3' ? 'text-[#6B8068]' : 'text-[#6B7280]'}`}>
                        {version.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Na Rota Feed */}
                        {version.id === 'v3' && (
                            <NaRotaFeedV3
                                userName="Lucas Designer"
                                ratings={MOCK_RATINGS}
                                portfolio={[]}
                            />
                        )}
                        {version.id === 'v4' && (
                            <NaRotaFeedV4
                                userId="demo"
                                userName="Lucas Designer"
                                userAvatar={null}
                                ratings={MOCK_RATINGS}
                                portfolio={[]}
                            />
                        )}
                        {version.id === 'v5' && (
                            <NaRotaFeedV5
                                userId="demo"
                                userName="Lucas Designer"
                                userAvatar={null}
                                ratings={MOCK_RATINGS}
                                portfolio={[]}
                            />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Projects Counter */}
                        {version.id === 'v3' && (
                            <ProjectsCounterV3
                                completedCount={15}
                                inProgressCount={3}
                                showButton={true}
                                canShowButton={false}
                            />
                        )}
                        {version.id === 'v4' && (
                            <ProjectsCounterV4
                                completedCount={15}
                                inProgressCount={3}
                                showButton={true}
                                canShowButton={false}
                            />
                        )}
                        {version.id === 'v5' && (
                            <ProjectsCounterV5
                                completedCount={15}
                                inProgressCount={3}
                                showButton={true}
                                canShowButton={false}
                            />
                        )}

                        {/* Elos da Rota */}
                        {version.id === 'v3' && (
                            <ElosDaRotaV3
                                connections={MOCK_CONNECTIONS}
                                pendingCount={2}
                                userId="demo"
                            />
                        )}
                        {version.id === 'v4' && (
                            <ElosDaRotaV4
                                connections={MOCK_CONNECTIONS}
                                pendingCount={2}
                                userId="demo"
                            />
                        )}
                        {version.id === 'v5' && (
                            <ElosDaRotaV5
                                connections={MOCK_CONNECTIONS}
                                pendingCount={2}
                                userId="demo"
                            />
                        )}

                        {/* Confrarias */}
                        {version.id === 'v3' && (
                            <ConfraternityStatsV3 confraternities={MOCK_CONFRATERNITIES} />
                        )}
                        {version.id === 'v4' && (
                            <ConfraternityStatsV4 confraternities={MOCK_CONFRATERNITIES} />
                        )}
                        {version.id === 'v5' && (
                            <ConfraternityStatsV5 confraternities={MOCK_CONFRATERNITIES} />
                        )}
                    </div>
                </div>
            </div>

            {/* Footer de ações */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
                <div className="container mx-auto flex items-center justify-between max-w-7xl">
                    <p className="text-sm text-gray-600">
                        Navegue entre as versões para comparar
                    </p>
                    <div className="flex gap-2">
                        {VERSIONS.map((v, idx) => (
                            <Button
                                key={v.id}
                                size="sm"
                                variant={idx === currentVersion ? 'default' : 'outline'}
                                onClick={() => setCurrentVersion(idx)}
                                className={idx === currentVersion ? 'bg-[#1E4D40]' : ''}
                            >
                                {v.id.toUpperCase()}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
