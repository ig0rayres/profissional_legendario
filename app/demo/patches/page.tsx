'use client'

import { PostTypePatch, PostTypeSeal, PostTypeBanner, PostType } from '@/components/social/post-type-patch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const postTypes: PostType[] = ['confraria', 'em_campo', 'projeto_entregue', 'medalha']

export default function PatchesDemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold text-white">
                        🎖️ Sistema de Selos - Na Rota
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Patches e badges para classificar os tipos de publicação
                    </p>
                </div>

                {/* Section 1: Patch Badges (inline) */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            📍 PostTypePatch - Badges Inline
                        </CardTitle>
                        <p className="text-gray-400 text-sm">
                            Para usar dentro do conteúdo do post, próximo ao texto
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Small */}
                        <div>
                            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Small (sm)</h3>
                            <div className="flex flex-wrap gap-3">
                                {postTypes.map(type => (
                                    <PostTypePatch key={type} type={type} size="sm" />
                                ))}
                            </div>
                        </div>

                        {/* Medium */}
                        <div>
                            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Medium (md) - Padrão</h3>
                            <div className="flex flex-wrap gap-3">
                                {postTypes.map(type => (
                                    <PostTypePatch key={type} type={type} size="md" />
                                ))}
                            </div>
                        </div>

                        {/* Large */}
                        <div>
                            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Large (lg)</h3>
                            <div className="flex flex-wrap gap-3">
                                {postTypes.map(type => (
                                    <PostTypePatch key={type} type={type} size="lg" />
                                ))}
                            </div>
                        </div>

                        {/* Icon only */}
                        <div>
                            <h3 className="text-gray-400 text-sm mb-3 uppercase tracking-wider">Apenas Ícone (showLabel=false)</h3>
                            <div className="flex flex-wrap gap-3">
                                {postTypes.map(type => (
                                    <PostTypePatch key={type} type={type} size="md" showLabel={false} />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 2: Seal (hexagonal) */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            🛡️ PostTypeSeal - Selo Hexagonal
                        </CardTitle>
                        <p className="text-gray-400 text-sm">
                            Para usar no canto do card, como um selo de autenticidade
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* All sizes */}
                        <div>
                            <h3 className="text-gray-400 text-sm mb-4 uppercase tracking-wider">Todos os tamanhos</h3>
                            <div className="grid grid-cols-4 gap-8">
                                {postTypes.map(type => (
                                    <div key={type} className="flex flex-col items-center gap-4">
                                        <span className="text-gray-500 text-xs uppercase">{type.replace('_', ' ')}</span>
                                        <div className="flex items-end gap-2">
                                            <PostTypeSeal type={type} size="sm" />
                                            <PostTypeSeal type={type} size="md" />
                                            <PostTypeSeal type={type} size="lg" />
                                            <PostTypeSeal type={type} size="xl" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Section 3: Banners */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            🎬 PostTypeBanner - Banner de Topo
                        </CardTitle>
                        <p className="text-gray-400 text-sm">
                            Para usar no topo do card, identificando o tipo de publicação
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {postTypes.map(type => (
                            <div key={type} className="rounded-lg overflow-hidden">
                                <PostTypeBanner
                                    type={type}
                                    date={type === 'confraria' ? '27/01/2026' : undefined}
                                />
                                <div className="bg-white p-4">
                                    <p className="text-gray-600 text-sm">
                                        Conteúdo do post apareceria aqui embaixo do banner...
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Section 4: Card Preview */}
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            👀 Preview - Como ficará no Feed
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Confraria Preview */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto">
                            <PostTypeBanner type="confraria" date="27/01/2026" />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        {/* Dual avatars */}
                                        <div className="flex -space-x-2">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white z-10"></div>
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 border-2 border-white"></div>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">João e Maria</p>
                                            <p className="text-xs text-gray-500">há 2 horas</p>
                                        </div>
                                    </div>
                                    <PostTypeSeal type="confraria" size="md" />
                                </div>
                                <p className="text-gray-700 text-sm mb-3">
                                    Primeiro café de negócios do ano! Fechamos uma parceria incrível. 🤝☕
                                </p>
                                <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center">
                                    <span className="text-amber-600/50 text-sm">📷 Foto do encontro</span>
                                </div>
                            </div>
                        </div>

                        {/* Em Campo Preview */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto">
                            <PostTypeBanner type="em_campo" />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">Carlos Silva</p>
                                            <p className="text-xs text-gray-500">há 30 min</p>
                                        </div>
                                    </div>
                                    <PostTypeSeal type="em_campo" size="md" />
                                </div>
                                <p className="text-gray-700 text-sm mb-3">
                                    Instalação de sistema fotovoltaico em andamento! 50kWp de energia limpa. ⚡🌞
                                </p>
                                <div className="aspect-video bg-gradient-to-br from-red-100 to-orange-100 rounded-lg flex items-center justify-center">
                                    <span className="text-red-600/50 text-sm">📷 Foto do trabalho</span>
                                </div>
                            </div>
                        </div>

                        {/* Projeto Entregue Preview */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-2xl max-w-md mx-auto">
                            <PostTypeBanner type="projeto_entregue" />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600"></div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">Ana Beatriz</p>
                                            <p className="text-xs text-gray-500">ontem</p>
                                        </div>
                                    </div>
                                    <PostTypeSeal type="projeto_entregue" size="md" />
                                </div>
                                <p className="text-gray-700 text-sm mb-3">
                                    ✅ Projeto entregue! Website institucional para @empresaxyz finalizado com sucesso. Cliente 100% satisfeito!
                                </p>
                                <div className="aspect-video bg-gradient-to-br from-emerald-100 to-green-100 rounded-lg flex items-center justify-center">
                                    <span className="text-emerald-600/50 text-sm">📷 Foto da entrega</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm pb-8">
                    Criado por Lucas Mendes - UI/UX Designer<br />
                    <span className="text-xs">Passe o mouse nos elementos para ver as animações ✨</span>
                </div>
            </div>
        </div>
    )
}
