'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreatePostModalV2 } from '@/components/social/create-post-modal-v2'
import { PostTypePatch, PostTypeSeal, PostTypeBanner, PostTypeMiniBadge } from '@/components/social/post-type-patch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus } from 'lucide-react'

export default function CreatePostDemoPage() {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const demoUserId = 'd1cd4db4-b79f-4ef1-9724-9d80f458aed8'

    const postTypes = ['confraria', 'em_campo', 'projeto_entregue', 'medalha'] as const

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Sistema de Publicações
                    </h1>
                    <p className="text-gray-600">
                        Patches e selos para classificar tipos de post - Visual sóbrio para empresários
                    </p>
                </div>

                {/* Open Modal Button */}
                <div className="flex justify-center">
                    <Button
                        onClick={() => setIsModalOpen(true)}
                        className="gap-3 h-14 px-8 bg-gray-900 hover:bg-gray-800 text-white"
                    >
                        <Plus className="w-5 h-5" />
                        Abrir Modal de Publicação
                    </Button>
                </div>

                {/* Modal */}
                <CreatePostModalV2
                    open={isModalOpen}
                    onOpenChange={setIsModalOpen}
                    userId={demoUserId}
                    onPostCreated={() => alert('Post criado com sucesso!')}
                />

                {/* Patches */}
                <Card className="bg-white border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-900">Patches Inline</CardTitle>
                        <p className="text-sm text-gray-500">Para uso próximo ao texto do post</p>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {/* Sizes */}
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tamanho SM</h4>
                            <div className="flex flex-wrap gap-3">
                                {postTypes.map(type => (
                                    <PostTypePatch key={type} type={type} size="sm" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tamanho MD</h4>
                            <div className="flex flex-wrap gap-3">
                                {postTypes.map(type => (
                                    <PostTypePatch key={type} type={type} size="md" />
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Tamanho LG</h4>
                            <div className="flex flex-wrap gap-3">
                                {postTypes.map(type => (
                                    <PostTypePatch key={type} type={type} size="lg" />
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Seals */}
                <Card className="bg-white border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-900">Selos Circulares</CardTitle>
                        <p className="text-sm text-gray-500">Para uso no canto do card como insígnia</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-6 justify-center items-end">
                            {postTypes.map(type => (
                                <div key={type} className="flex flex-col items-center gap-3">
                                    <div className="flex items-end gap-2">
                                        <PostTypeSeal type={type} size="sm" />
                                        <PostTypeSeal type={type} size="md" />
                                        <PostTypeSeal type={type} size="lg" />
                                    </div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                                        {type.replace('_', ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Banners */}
                <Card className="bg-white border-gray-200 overflow-hidden">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-900">Banners de Topo</CardTitle>
                        <p className="text-sm text-gray-500">Faixa no topo do card identificando o tipo</p>
                    </CardHeader>
                    <CardContent className="p-0">
                        {postTypes.map(type => (
                            <div key={type}>
                                <PostTypeBanner
                                    type={type}
                                    date={type === 'confraria' ? '27/01/2026' : undefined}
                                />
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Mini Badges */}
                <Card className="bg-white border-gray-200">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-900">Mini Badges</CardTitle>
                        <p className="text-sm text-gray-500">Versão ultra-discreta para uso inline</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex flex-wrap gap-3">
                            {postTypes.map(type => (
                                <PostTypeMiniBadge key={type} type={type} />
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Card */}
                <Card className="bg-white border-gray-200 overflow-hidden">
                    <CardHeader className="border-b border-gray-100">
                        <CardTitle className="text-gray-900">Preview - Como ficará no Feed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                        {/* Confraria Preview */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <PostTypeBanner type="confraria" date="27/01/2026" />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-2">
                                            <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white z-10"></div>
                                            <div className="w-10 h-10 rounded-full bg-gray-400 border-2 border-white"></div>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">João e Maria</p>
                                            <p className="text-xs text-gray-500">há 2 horas</p>
                                        </div>
                                    </div>
                                    <PostTypeSeal type="confraria" size="md" />
                                </div>
                                <p className="text-gray-700 text-sm">
                                    Primeiro café de negócios do ano. Fechamos uma parceria estratégica.
                                </p>
                            </div>
                        </div>

                        {/* Em Campo Preview */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <PostTypeBanner type="em_campo" />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">Carlos Silva</p>
                                            <p className="text-xs text-gray-500">há 30 min</p>
                                        </div>
                                    </div>
                                    <PostTypeSeal type="em_campo" size="md" />
                                </div>
                                <p className="text-gray-700 text-sm">
                                    Instalação de sistema fotovoltaico em andamento. 50kWp de energia limpa.
                                </p>
                            </div>
                        </div>

                        {/* Projeto Entregue Preview */}
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                            <PostTypeBanner type="projeto_entregue" />
                            <div className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                                        <div>
                                            <p className="font-semibold text-sm text-gray-900">Ana Beatriz</p>
                                            <p className="text-xs text-gray-500">ontem</p>
                                        </div>
                                    </div>
                                    <PostTypeSeal type="projeto_entregue" size="md" />
                                </div>
                                <p className="text-gray-700 text-sm">
                                    Projeto entregue. Website institucional finalizado com sucesso. Cliente 100% satisfeito.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Footer */}
                <div className="text-center text-gray-500 text-sm pb-8">
                    Visual sóbrio para empresários 25-65 anos
                </div>
            </div>
        </div>
    )
}
