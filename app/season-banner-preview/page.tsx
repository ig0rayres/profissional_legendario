'use client'

import { SeasonBanner } from '@/components/season'

export default function SeasonBannerPreviewPage() {
    return (
        <div className="min-h-screen bg-black text-white p-8 space-y-12">
            <div className="max-w-6xl mx-auto space-y-12">
                <div>
                    <h1 className="text-3xl font-bold mb-6 text-green-500">Preview do Banner da Temporada</h1>
                    <p className="text-gray-400 mb-8">Visualização em tempo real do componente SeasonBanner em diferentes tamanhos.</p>
                </div>

                {/* Hero Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white/80 border-b border-white/10 pb-2">
                        1. Hero Variant (Full Width | 1200x630)
                    </h2>
                    <p className="text-sm text-gray-500">Usado em topos de página, landing pages e dashboards.</p>

                    {/* Wrapper para Screenshot Limpo */}
                    <div id="preview-hero" className="inline-block w-full max-w-[1200px]">
                        <SeasonBanner variant="hero" />
                    </div>
                </div>

                {/* Card Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white/80 border-b border-white/10 pb-2">
                        2. Card Variant (Instagram Feed | 1080x1080)
                    </h2>
                    <p className="text-sm text-gray-500">Usado dentro de grids ou Instagram.</p>

                    {/* Wrapper Quadrado para Feed */}
                    <div id="preview-card" className="inline-block overflow-hidden relative" style={{ width: '1080px', height: '1080px' }}>
                        {/* Forçamos banner a preencher o quadrado */}
                        <SeasonBanner variant="card" className="w-full h-full" />
                    </div>
                </div>

                {/* Sidebar/Story Variant */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white/80 border-b border-white/10 pb-2">
                        3. Story Variant (9:16 | 1080x1920)
                    </h2>
                    <p className="text-sm text-gray-500">Usado em Stories ou laterais.</p>

                    {/* Wrapper Vertical para Story */}
                    <div id="preview-story" className="inline-block overflow-hidden relative" style={{ width: '1080px', height: '1920px' }}>
                        <SeasonBanner variant="sidebar" showCTA={false} className="w-full h-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}
