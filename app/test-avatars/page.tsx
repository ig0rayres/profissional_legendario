'use client'

import { StandardAvatar } from '@/components/ui/standard-avatar'
import { DashboardHeaderAvatar } from '@/components/ui/dashboard-header-avatar'

// Usuário de exemplo
const exampleUser = {
    id: '1',
    full_name: 'Igor Ayres',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor',
    rank_id: 'veterano',
    rank_name: 'Veterano',
    rank_icon: 'Shield',
    slug: 'igor-ayres',
    rota_number: '#141018'
}

export default function TestAvatarsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#1A2421] to-[#0A0F0D] p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-black text-white mb-4">
                        Sistema de Avatares Padronizados
                    </h1>
                    <p className="text-lg text-white/70 mb-2">
                        Variações otimizadas para Desktop e Mobile
                    </p>
                    <div className="flex gap-4 justify-center mt-6">
                        <a href="#desktop" className="px-6 py-2 bg-[#2D6B4F] text-white rounded-lg font-bold hover:bg-[#3D7B5F] transition">
                            Ver Desktop
                        </a>
                        <a href="#mobile" className="px-6 py-2 bg-[#1E4D40] text-white rounded-lg font-bold hover:bg-[#2D6B4F] transition">
                            Ver Mobile
                        </a>
                    </div>
                </div>

                {/* ========================================
                    GRUPO 1: DESKTOP (PC)
                ======================================== */}
                <section id="desktop" className="scroll-mt-8">
                    <div className="bg-gradient-to-r from-[#2D6B4F]/30 to-[#1E4D40]/30 rounded-2xl p-6 mb-8 border border-[#2D6B4F]/50">
                        <h2 className="text-3xl font-black text-white mb-2">💻 DESKTOP (PC)</h2>
                        <p className="text-white/70">Avatares otimizados para telas grandes</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* DASHBOARD HEADER - Avatar Principal */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#F59E0B]/50 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    ⭐ DASHBOARD HEADER
                                </div>
                                <div className="text-white/70 text-sm">
                                    Avatar do painel do usuário (FINALIZADO)
                                </div>
                            </div>

                            <div className="bg-[#0A0F0D]/50 rounded-xl p-6">
                                <div className="flex gap-6 items-center mb-4">
                                    <DashboardHeaderAvatar user={exampleUser} />
                                    <div>
                                        <h3 className="text-white font-bold text-lg mb-2">Conjunto Completo:</h3>
                                        <div className="space-y-2 text-sm text-white/70">
                                            <div className="bg-[#2D6B4F]/20 rounded p-2 border-l-2 border-[#2D6B4F]">
                                                <p className="font-bold text-white/90 mb-1">1. Moldura Quadrada</p>
                                                <p className="text-xs">Frame com logo da Rota nos cantos</p>
                                            </div>
                                            <div className="bg-[#2D6B4F]/20 rounded p-2 border-l-2 border-[#2D6B4F]">
                                                <p className="font-bold text-white/90 mb-1">2. Foto do Usuário</p>
                                                <p className="text-xs">Dentro da moldura</p>
                                            </div>
                                            <div className="bg-[#F59E0B]/20 rounded p-2 border-l-2 border-[#F59E0B]">
                                                <p className="font-bold text-white/90 mb-1">3. Badge de Patente</p>
                                                <p className="text-xs">Desktop: 44px | Mobile: 36px</p>
                                                <p className="text-xs">Posição: 16px/8px do canto</p>
                                                <p className="text-xs">Borda branca: 2px/1.5px</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-[#2D6B4F]/20 rounded-lg p-3 border border-[#2D6B4F]/30">
                                    <code className="text-xs text-white/80">
                                        &lt;DashboardHeaderAvatar user=&#123;user&#125; /&gt;
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* MEDIUM - Feed, Profissionais */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2D6B4F]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#2D6B4F] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    MEDIUM
                                </div>
                                <div className="text-white/70 text-sm">
                                    Feed "Na Rota", Profissionais
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Exemplo isolado */}
                                <div className="flex items-center gap-4">
                                    <StandardAvatar variant="medium" user={exampleUser} showRank />
                                    <div className="text-white/50 text-sm">
                                        64px • Para posts e cards principais
                                    </div>
                                </div>

                                {/* Exemplo em contexto - Post */}
                                <div className="bg-[#0A0F0D]/50 rounded-xl p-4">
                                    <div className="flex gap-3 mb-3">
                                        <StandardAvatar variant="medium" user={exampleUser} showRank linkToProfile />
                                        <div>
                                            <h3 className="text-white font-bold">Igor Ayres</h3>
                                            <p className="text-sm text-white/50">Há 2 horas</p>
                                        </div>
                                    </div>
                                    <p className="text-white/80 text-sm">
                                        Acabei de fechar um grande negócio! 🎉
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SMALL - Elos, Rankings */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2D6B4F]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#2D6B4F] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    SMALL
                                </div>
                                <div className="text-white/70 text-sm">
                                    Elos, Rankings, Comentários
                                </div>
                            </div>

                            <div className="space-y-4">
                                {/* Exemplo isolado */}
                                <div className="flex items-center gap-4">
                                    <StandardAvatar variant="small" user={exampleUser} showRank />
                                    <div className="text-white/50 text-sm">
                                        48px • Para listas e cards secundários
                                    </div>
                                </div>

                                {/* Exemplo em contexto - Ranking */}
                                <div className="bg-[#0A0F0D]/50 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl font-bold text-[#F59E0B] w-8">#1</div>
                                        <StandardAvatar variant="small" user={exampleUser} showRank linkToProfile />
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold text-sm">Igor Ayres</h4>
                                            <p className="text-xs text-white/50">1,250 pontos</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Exemplo em contexto - Elo */}
                                <div className="bg-[#0A0F0D]/50 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <StandardAvatar variant="small" user={exampleUser} showRank linkToProfile />
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold text-sm">Igor Ayres</h4>
                                            <p className="text-xs text-white/50">#141018</p>
                                        </div>
                                        <button className="text-xs bg-[#2D6B4F] text-white px-3 py-1 rounded">
                                            Elo
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* LARGE - Headers */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2D6B4F]/30 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#2D6B4F] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    LARGE
                                </div>
                                <div className="text-white/70 text-sm">
                                    Headers de perfil, páginas de destaque
                                </div>
                            </div>

                            <div className="bg-[#0A0F0D]/50 rounded-xl p-6">
                                <div className="flex gap-6 items-start">
                                    <StandardAvatar variant="large" user={exampleUser} showRank />
                                    <div className="flex-1">
                                        <h1 className="text-3xl font-black text-white mb-2">Igor Ayres</h1>
                                        <p className="text-[#2D6B4F] font-bold mb-3">#141018</p>
                                        <p className="text-white/70 mb-4 text-sm">
                                            Desenvolvedor apaixonado por criar soluções que impactam vidas.
                                        </p>
                                        <div className="flex gap-6">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white">127</div>
                                                <div className="text-xs text-white/50">Elos</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white">1.2k</div>
                                                <div className="text-xs text-white/50">Vigor</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TINY - Notificações */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#2D6B4F]/30 md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#2D6B4F] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    TINY
                                </div>
                                <div className="text-white/70 text-sm">
                                    Notificações, badges, listas compactas
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#0A0F0D]/50 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <StandardAvatar variant="tiny" user={exampleUser} />
                                        <div>
                                            <p className="text-sm text-white font-medium">Nova notificação</p>
                                            <p className="text-xs text-white/50">Igor comentou no seu post</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ========================================
                    GRUPO 2: MOBILE
                ======================================== */}
                <section id="mobile" className="scroll-mt-8">
                    <div className="bg-gradient-to-r from-[#1E4D40]/30 to-[#2D6B4F]/30 rounded-2xl p-6 mb-8 border border-[#1E4D40]/50">
                        <h2 className="text-3xl font-black text-white mb-2">📱 MOBILE</h2>
                        <p className="text-white/70">Avatares otimizados para telas pequenas</p>
                    </div>

                    <div className="grid gap-8 max-w-md mx-auto">
                        {/* DASHBOARD HEADER Mobile */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#F59E0B]/50">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#F59E0B] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    ⭐ DASHBOARD HEADER
                                </div>
                            </div>

                            <div className="bg-[#0A0F0D]/50 rounded-xl p-4">
                                <div className="flex flex-col items-center gap-4 mb-4">
                                    <DashboardHeaderAvatar user={exampleUser} />
                                    <div className="text-center">
                                        <h3 className="text-white font-bold text-sm mb-2">Mobile: 116px</h3>
                                        <div className="space-y-1 text-xs text-white/70">
                                            <p>Patente: 36px</p>
                                            <p>Posição: 8px do canto</p>
                                            <p>Borda: 1.5px branca</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MEDIUM Mobile - Feed */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#1E4D40]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#1E4D40] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    MEDIUM
                                </div>
                                <div className="text-white/70 text-sm">
                                    Feed, Profissionais
                                </div>
                            </div>

                            <div className="bg-[#0A0F0D]/50 rounded-xl p-4">
                                <div className="flex gap-3 mb-3">
                                    <StandardAvatar variant="medium" user={exampleUser} showRank linkToProfile />
                                    <div>
                                        <h3 className="text-white font-bold text-sm">Igor Ayres</h3>
                                        <p className="text-xs text-white/50">Há 2 horas</p>
                                    </div>
                                </div>
                                <p className="text-white/80 text-sm">
                                    Post no feed mobile 📱
                                </p>
                            </div>
                        </div>

                        {/* SMALL Mobile - Elos, Rankings */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#1E4D40]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#1E4D40] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    SMALL
                                </div>
                                <div className="text-white/70 text-sm">
                                    Elos, Rankings
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="bg-[#0A0F0D]/50 rounded-lg p-3">
                                    <div className="flex items-center gap-3">
                                        <StandardAvatar variant="small" user={exampleUser} showRank />
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold text-sm">Igor Ayres</h4>
                                            <p className="text-xs text-white/50">#141018</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TINY Mobile - Notificações */}
                        <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-6 border border-[#1E4D40]/30">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-[#1E4D40] text-white px-4 py-2 rounded-lg font-bold text-sm">
                                    TINY
                                </div>
                                <div className="text-white/70 text-sm">
                                    Notificações
                                </div>
                            </div>

                            <div className="bg-[#0A0F0D]/50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                    <StandardAvatar variant="tiny" user={exampleUser} />
                                    <div>
                                        <p className="text-xs text-white font-medium">Nova notificação</p>
                                        <p className="text-xs text-white/50">Igor comentou</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Resumo de Uso */}
                <section className="bg-gradient-to-r from-[#2D6B4F]/20 to-[#1E4D40]/20 rounded-2xl p-8 border border-[#2D6B4F]/50">
                    <h2 className="text-2xl font-black text-white mb-6">📊 Guia Rápido de Uso</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-[#0A0F0D]/30 rounded-lg p-4">
                            <div className="text-[#F59E0B] font-bold mb-2">ELOS</div>
                            <code className="text-sm text-white/70">variant="small"</code>
                        </div>
                        <div className="bg-[#0A0F0D]/30 rounded-lg p-4">
                            <div className="text-[#F59E0B] font-bold mb-2">NA ROTA</div>
                            <code className="text-sm text-white/70">variant="medium"</code>
                        </div>
                        <div className="bg-[#0A0F0D]/30 rounded-lg p-4">
                            <div className="text-[#F59E0B] font-bold mb-2">RANKINGS</div>
                            <code className="text-sm text-white/70">variant="small"</code>
                        </div>
                        <div className="bg-[#0A0F0D]/30 rounded-lg p-4">
                            <div className="text-[#F59E0B] font-bold mb-2">PROFISSIONAIS</div>
                            <code className="text-sm text-white/70">variant="medium"</code>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
