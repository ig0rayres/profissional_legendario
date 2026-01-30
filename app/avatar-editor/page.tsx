'use client'

import { useState, useEffect } from 'react'
import { DashboardHeaderAvatar } from '@/components/ui/dashboard-header-avatar'
import { getAvatarConfig, updateAvatarConfig } from '@/lib/avatar-config'

const exampleUser = {
    id: '1',
    full_name: 'Igor Ayres',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor',
    rank_id: 'veterano',
    rank_name: 'Veterano',
    rank_icon: 'Shield',
}

export default function AvatarEditorPage() {
    // Desktop
    const [desktopFrameSize, setDesktopFrameSize] = useState(152)
    const [desktopBadgeSize, setDesktopBadgeSize] = useState(44)
    const [desktopBadgeBottom, setDesktopBadgeBottom] = useState(16)
    const [desktopBadgeRight, setDesktopBadgeRight] = useState(16)
    const [desktopBorderWidth, setDesktopBorderWidth] = useState(2)

    // Mobile
    const [mobileFrameSize, setMobileFrameSize] = useState(116)
    const [mobileBadgeSize, setMobileBadgeSize] = useState(36)
    const [mobileBadgeBottom, setMobileBadgeBottom] = useState(8)
    const [mobileBadgeRight, setMobileBadgeRight] = useState(8)
    const [mobileBorderWidth, setMobileBorderWidth] = useState(1.5)

    const [activeMode, setActiveMode] = useState<'desktop' | 'mobile'>('desktop')
    const [activeContext, setActiveContext] = useState<'dashboard' | 'elo'>('dashboard')
    const [isSaving, setIsSaving] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Carregar configurações do banco ao montar e quando mudar o contexto
    useEffect(() => {
        loadConfig()
    }, [activeContext])

    async function loadConfig() {
        setIsLoading(true)
        const configs = await getAvatarConfig()

        const desktopConfig = configs.find(c => c.context === activeContext && c.device === 'desktop')
        const mobileConfig = configs.find(c => c.context === activeContext && c.device === 'mobile')

        if (desktopConfig) {
            setDesktopFrameSize(desktopConfig.frame_size)
            setDesktopBadgeSize(desktopConfig.badge_size)
            setDesktopBadgeBottom(desktopConfig.badge_bottom)
            setDesktopBadgeRight(desktopConfig.badge_right)
            setDesktopBorderWidth(desktopConfig.border_width)
        }

        if (mobileConfig) {
            setMobileFrameSize(mobileConfig.frame_size)
            setMobileBadgeSize(mobileConfig.badge_size)
            setMobileBadgeBottom(mobileConfig.badge_bottom)
            setMobileBadgeRight(mobileConfig.badge_right)
            setMobileBorderWidth(mobileConfig.border_width)
        }

        setIsLoading(false)
    }

    async function saveConfig() {
        setIsSaving(true)

        console.log('[SALVAR] Iniciando salvamento...')
        console.log('[SALVAR] Contexto:', activeContext)
        console.log('[SALVAR] Desktop:', {
            frame_size: desktopFrameSize,
            badge_size: desktopBadgeSize,
            badge_bottom: desktopBadgeBottom,
            badge_right: desktopBadgeRight,
            border_width: desktopBorderWidth,
        })

        // Salvar Desktop
        const desktopSuccess = await updateAvatarConfig(activeContext, 'desktop', {
            frame_size: desktopFrameSize,
            badge_size: desktopBadgeSize,
            badge_bottom: desktopBadgeBottom,
            badge_right: desktopBadgeRight,
            border_width: desktopBorderWidth,
        })

        console.log('[SALVAR] Desktop resultado:', desktopSuccess)

        // Salvar Mobile
        const mobileSuccess = await updateAvatarConfig(activeContext, 'mobile', {
            frame_size: mobileFrameSize,
            badge_size: mobileBadgeSize,
            badge_bottom: mobileBadgeBottom,
            badge_right: mobileBadgeRight,
            border_width: mobileBorderWidth,
        })

        console.log('[SALVAR] Mobile resultado:', mobileSuccess)

        setIsSaving(false)

        if (desktopSuccess && mobileSuccess) {
            alert('✅ Configurações salvas com sucesso! Todos os avatares da plataforma foram atualizados.')
        } else {
            alert('❌ Erro ao salvar configurações. Tente novamente.')
        }
    }

    // Valores atuais baseados no modo
    const currentFrameSize = activeMode === 'desktop' ? desktopFrameSize : mobileFrameSize
    const currentBadgeSize = activeMode === 'desktop' ? desktopBadgeSize : mobileBadgeSize
    const currentBadgeBottom = activeMode === 'desktop' ? desktopBadgeBottom : mobileBadgeBottom
    const currentBadgeRight = activeMode === 'desktop' ? desktopBadgeRight : mobileBadgeRight
    const currentBorderWidth = activeMode === 'desktop' ? desktopBorderWidth : mobileBorderWidth

    const copyCode = () => {
        const code = `// ${activeContext === 'dashboard' ? 'DASHBOARD HEADER' : 'ELO / RANKINGS'}

// DESKTOP
Frame: ${desktopFrameSize}px
Patente: ${desktopBadgeSize}px
Posição: bottom-[${desktopBadgeBottom}px] right-[${desktopBadgeRight}px]
Borda: ${desktopBorderWidth}px

// MOBILE
Frame: ${mobileFrameSize}px
Patente: ${mobileBadgeSize}px
Posição: bottom-[${mobileBadgeBottom}px] right-[${mobileBadgeRight}px]
Borda: ${mobileBorderWidth}px

// Código Frame:
className="w-[${mobileFrameSize}px] h-[${mobileFrameSize}px] md:w-[${desktopFrameSize}px] md:h-[${desktopFrameSize}px]"

// Código Patente:
className="w-[${mobileBadgeSize}px] h-[${mobileBadgeSize}px] md:w-[${desktopBadgeSize}px] md:h-[${desktopBadgeSize}px] border-[${mobileBorderWidth}px] md:border-[${desktopBorderWidth}px] border-white"

// Posição Patente:
className="absolute bottom-[${mobileBadgeBottom}px] right-[${mobileBadgeRight}px] md:bottom-[${desktopBadgeBottom}px] md:right-[${desktopBadgeRight}px]"`

        navigator.clipboard.writeText(code)
        alert('Código copiado!')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#1A2421] to-[#0A0F0D] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-4">
                        🎨 Editor de Avatar
                    </h1>
                    <p className="text-lg text-white/70">
                        Ajuste o tamanho do FRAME e da PATENTE
                    </p>
                </div>

                {/* Context Selector */}
                <div className="flex justify-center mb-6">
                    <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-xl p-4 border border-[#2D6B4F]/30">
                        <label className="text-white/70 text-sm mb-2 block">Onde será usado:</label>
                        <select
                            value={activeContext}
                            onChange={(e) => setActiveContext(e.target.value as 'dashboard' | 'elo')}
                            className="bg-[#0A0F0D] text-white px-6 py-3 rounded-lg font-bold border-2 border-[#2D6B4F] focus:border-[#F59E0B] outline-none cursor-pointer min-w-[350px]"
                        >
                            <option value="dashboard">🏠 Dashboard Header (GRANDE - 152px/116px)</option>
                            <option value="elo">🔗 ELO / Rankings (PEQUENO - 48px/40px)</option>
                        </select>
                    </div>
                </div>

                {/* Mode Selector */}
                <div className="flex gap-4 justify-center mb-8">
                    <button
                        onClick={() => setActiveMode('desktop')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeMode === 'desktop'
                            ? 'bg-[#2D6B4F] text-white'
                            : 'bg-[#1A2421] text-white/50 hover:text-white'
                            }`}
                    >
                        💻 Desktop
                    </button>
                    <button
                        onClick={() => setActiveMode('mobile')}
                        className={`px-6 py-3 rounded-lg font-bold transition ${activeMode === 'mobile'
                            ? 'bg-[#2D6B4F] text-white'
                            : 'bg-[#1A2421] text-white/50 hover:text-white'
                            }`}
                    >
                        📱 Mobile
                    </button>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Preview */}
                    <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#2D6B4F]/30">
                        <h2 className="text-2xl font-black text-white mb-6">
                            {activeMode === 'desktop' ? '💻 Preview Desktop' : '📱 Preview Mobile'}
                        </h2>

                        <div className="flex items-center justify-center min-h-[400px] bg-[#0A0F0D]/50 rounded-xl p-8">
                            <DashboardHeaderAvatar
                                user={exampleUser}
                                customSizes={{
                                    frameSize: currentFrameSize,
                                    badgeSize: currentBadgeSize,
                                    badgeBottom: currentBadgeBottom,
                                    badgeRight: currentBadgeRight,
                                    borderWidth: currentBorderWidth,
                                }}
                            />
                        </div>

                        {/* Current Values */}
                        <div className="mt-6 bg-[#2D6B4F]/20 rounded-lg p-4 border border-[#2D6B4F]/30">
                            <h3 className="text-white font-bold mb-2">VALORES ATUAIS:</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                                <div>Frame: <span className="text-white font-mono">{currentFrameSize}px</span></div>
                                <div>Patente: <span className="text-white font-mono">{currentBadgeSize}px</span></div>
                                <div>Bottom: <span className="text-white font-mono">{currentBadgeBottom}px</span></div>
                                <div>Right: <span className="text-white font-mono">{currentBadgeRight}px</span></div>
                                <div className="col-span-2">Borda: <span className="text-white font-mono">{currentBorderWidth}px</span></div>
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="bg-[#1A2421]/50 backdrop-blur-sm rounded-2xl p-8 border border-[#2D6B4F]/30">
                        <h2 className="text-2xl font-black text-white mb-6">
                            ⚙️ CONTROLES {activeMode === 'desktop' ? 'DESKTOP' : 'MOBILE'}
                        </h2>

                        <div className="space-y-6">
                            {activeMode === 'desktop' ? (
                                <>
                                    {/* 1. FRAME SIZE */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            1️⃣ Tamanho do FRAME: {desktopFrameSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="40"
                                            max="200"
                                            value={desktopFrameSize}
                                            onChange={(e) => setDesktopFrameSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* 2. PATENTE SIZE */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            2️⃣ Tamanho da PATENTE: {desktopBadgeSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="80"
                                            value={desktopBadgeSize}
                                            onChange={(e) => setDesktopBadgeSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* PATENTE Position Bottom */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição PATENTE - Bottom: {desktopBadgeBottom}px
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="40"
                                            value={desktopBadgeBottom}
                                            onChange={(e) => setDesktopBadgeBottom(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* PATENTE Position Right */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição PATENTE - Right: {desktopBadgeRight}px
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="40"
                                            value={desktopBadgeRight}
                                            onChange={(e) => setDesktopBadgeRight(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Border Width */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Borda da PATENTE: {desktopBorderWidth}px
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            step="0.5"
                                            value={desktopBorderWidth}
                                            onChange={(e) => setDesktopBorderWidth(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* 1. FRAME SIZE */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            1️⃣ Tamanho do FRAME: {mobileFrameSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="30"
                                            max="150"
                                            value={mobileFrameSize}
                                            onChange={(e) => setMobileFrameSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* 2. PATENTE SIZE */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            2️⃣ Tamanho da PATENTE: {mobileBadgeSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="60"
                                            value={mobileBadgeSize}
                                            onChange={(e) => setMobileBadgeSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* PATENTE Position Bottom */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição PATENTE - Bottom: {mobileBadgeBottom}px
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="30"
                                            value={mobileBadgeBottom}
                                            onChange={(e) => setMobileBadgeBottom(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* PATENTE Position Right */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição PATENTE - Right: {mobileBadgeRight}px
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="30"
                                            value={mobileBadgeRight}
                                            onChange={(e) => setMobileBadgeRight(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Border Width */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Borda da PATENTE: {mobileBorderWidth}px
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="4"
                                            step="0.5"
                                            value={mobileBorderWidth}
                                            onChange={(e) => setMobileBorderWidth(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={saveConfig}
                            disabled={isSaving || isLoading}
                            className="w-full mt-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 rounded-lg transition shadow-lg"
                        >
                            {isSaving ? '⏳ Salvando...' : '💾 SALVAR CONFIGURAÇÕES'}
                        </button>
                        <p className="text-xs text-white/50 text-center mt-2">
                            Ao salvar, TODOS os avatares da plataforma serão atualizados
                        </p>

                        {/* Reset Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button
                                onClick={loadConfig}
                                disabled={isLoading}
                                className="bg-[#1A2421] hover:bg-[#2D6B4F] disabled:bg-gray-700 text-white font-bold py-2 rounded-lg transition text-sm"
                            >
                                🔄 Recarregar
                            </button>
                            <button
                                onClick={copyCode}
                                className="bg-[#1A2421] hover:bg-[#F59E0B] text-white font-bold py-2 rounded-lg transition text-sm"
                            >
                                📋 Copiar Código
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
