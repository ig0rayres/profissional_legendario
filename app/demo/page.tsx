'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function DemoIndexPage() {
    const options = [
        {
            title: 'Opção 3 - Avatar Centralizado',
            description: 'Layout simétrico com medalhas orbitando o avatar',
            features: ['Avatar centralizado 90px', '5 medalhas orbitando', 'Stats em linha única', 'Menu horizontal compacto'],
            url: '/demo/header-1',
            height: '240px',
        },
        {
            title: 'Opção C - Menu Horizontal',
            description: 'Avatar à esquerda com trophy showcase integrado',
            features: ['Avatar 85px à esquerda', 'Medalhas orbitando', 'Trophy showcase horizontal', 'Menu com 6 ações'],
            url: '/demo/header-2',
            height: '240px',
        },
        {
            title: 'Opção 5 - Glass Card',
            description: 'Card flutuante com paleta corrigida',
            features: ['Glass morphism com blur', 'Paleta 100% correta', 'Trophy case dedicado', 'Stats inline'],
            url: '/demo/header-3',
            height: '240px',
        },
        {
            title: 'V4 Verde ⭐',
            description: 'Atual Melhorada | Paleta verde floresta + capa',
            features: ['Avatar 128px', 'Stats com delta', 'Medalhas 3D', 'Suporte a capa'],
            url: '/demo/header-4',
            height: '320px',
        },
        {
            title: 'V5 Gray ⭐',
            description: 'Versão Sóbria | Cinza + detalhes verde/laranja + capa',
            features: ['Paleta cinza', 'Verde em ícones', 'Laranja em CTAs', 'Suporte a capa'],
            url: '/demo/header-5',
            height: '320px',
        },
        {
            title: 'V4 Cinza 🆕',
            description: 'Paleta Cinza | Verde e laranja em detalhes + capa',
            features: ['Fundo cinza', 'Verde detalhes', 'Laranja destaques', 'Suporte a capa'],
            url: '/demo/header-v4-gray',
            height: '320px',
        },
        {
            title: 'V5 Verde 🆕',
            description: 'Paleta Verde | Cinza e laranja em detalhes + capa',
            features: ['Fundo verde', 'Cinza detalhes', 'Laranja destaques', 'Suporte a capa'],
            url: '/demo/header-v5-green',
            height: '320px',
        },
    ]

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0F1B1A] to-[#1A2421] pt-20">
            <div className="max-w-7xl mx-auto p-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Headers do Perfil - 7 Opções
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Escolha o design que melhor representa a Rota Business Club
                    </p>
                    <p className="text-emerald-400 text-sm mt-2">
                        ⭐ Versões principais | 🆕 Novas variações de paleta
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {options.map((option, idx) => (
                        <Link
                            key={idx}
                            href={option.url}
                            className="group block bg-[#1A2421] rounded-2xl border border-[#2D3B2D]/50 hover:border-[#D2691E]/50 transition-all duration-300 overflow-hidden hover:shadow-2xl hover:shadow-[#D2691E]/20"
                        >
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-white mb-2 group-hover:text-[#D2691E] transition-colors">
                                            {option.title}
                                        </h2>
                                        <p className="text-gray-400 text-sm">
                                            {option.description}
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-[#D2691E] transform group-hover:translate-x-1 transition-transform" />
                                </div>

                                <div className="space-y-2 mb-4">
                                    {option.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#D2691E]" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-[#2D3B2D]">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider">
                                        Altura: {option.height}
                                    </span>
                                    <span className="text-xs font-bold text-[#D2691E] group-hover:underline">
                                        Visualizar →
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-[#1A2421] rounded-xl border border-[#2D3B2D]">
                    <h3 className="text-white font-bold mb-3">Pilares de Design Aplicados:</h3>
                    <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
                        <div>
                            <div className="font-bold text-[#D2691E] mb-1">C) Glass / Depth</div>
                            <p className="text-gray-400">Camadas com profundidade, sombras suaves, backdrop blur</p>
                        </div>
                        <div>
                            <div className="font-bold text-[#D2691E] mb-1">D) Gamificação Elegante</div>
                            <p className="text-gray-400">Badges, progresso visual, níveis sem parecer game</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
