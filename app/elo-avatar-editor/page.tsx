'use client'

import { useState } from 'react'
import Image from 'next/image'

const exampleUser = {
    id: '1',
    full_name: 'Igor Ayres',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Igor',
    rank_id: 'veterano',
}

export default function EloAvatarEditorPage() {
    // Desktop
    const [desktopAvatarSize, setDesktopAvatarSize] = useState(48)
    const [desktopBadgeSize, setDesktopBadgeSize] = useState(20)
    const [desktopBadgeBottom, setDesktopBadgeBottom] = useState(-2)
    const [desktopBadgeRight, setDesktopBadgeRight] = useState(-2)
    const [desktopBorderWidth, setDesktopBorderWidth] = useState(2)

    // Mobile
    const [mobileAvatarSize, setMobileAvatarSize] = useState(40)
    const [mobileBadgeSize, setMobileBadgeSize] = useState(16)
    const [mobileBadgeBottom, setMobileBadgeBottom] = useState(-2)
    const [mobileBadgeRight, setMobileBadgeRight] = useState(-2)
    const [mobileBorderWidth, setMobileBorderWidth] = useState(1.5)

    const [activeMode, setActiveMode] = useState<'desktop' | 'mobile'>('desktop')

    const copyCode = () => {
        const code = `// ELO AVATAR - DESKTOP
Avatar: ${desktopAvatarSize}px
Patente: ${desktopBadgeSize}px
Posição: bottom-[${desktopBadgeBottom}px] right-[${desktopBadgeRight}px]
Borda: ${desktopBorderWidth}px

// ELO AVATAR - MOBILE
Avatar: ${mobileAvatarSize}px
Patente: ${mobileBadgeSize}px
Posição: bottom-[${mobileBadgeBottom}px] right-[${mobileBadgeRight}px]
Borda: ${mobileBorderWidth}px

// Código Avatar:
className="w-[${mobileAvatarSize}px] h-[${mobileAvatarSize}px] md:w-[${desktopAvatarSize}px] md:h-[${desktopAvatarSize}px] rounded-xl"

// Código Badge:
className="w-[${mobileBadgeSize}px] h-[${mobileBadgeSize}px] md:w-[${desktopBadgeSize}px] md:h-[${desktopBadgeSize}px] border-[${mobileBorderWidth}px] md:border-[${desktopBorderWidth}px] border-white"

// Posição Badge:
className="absolute bottom-[${mobileBadgeBottom}px] right-[${mobileBadgeRight}px] md:bottom-[${desktopBadgeBottom}px] md:right-[${desktopBadgeRight}px]"`

        navigator.clipboard.writeText(code)
        alert('Código copiado!')
    }

    const currentAvatarSize = activeMode === 'desktop' ? desktopAvatarSize : mobileAvatarSize
    const currentBadgeSize = activeMode === 'desktop' ? desktopBadgeSize : mobileBadgeSize
    const currentBadgeBottom = activeMode === 'desktop' ? desktopBadgeBottom : mobileBadgeBottom
    const currentBadgeRight = activeMode === 'desktop' ? desktopBadgeRight : mobileBadgeRight
    const currentBorderWidth = activeMode === 'desktop' ? desktopBorderWidth : mobileBorderWidth

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#0A0F0D] via-[#1A2421] to-[#0A0F0D] p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black text-white mb-4">
                        🔗 Editor de Avatar ELO
                    </h1>
                    <p className="text-lg text-white/70">
                        Ajuste o avatar circular para listas de Elos
                    </p>
                    <a href="/avatar-editor" className="text-[#2D6B4F] hover:text-[#3D7B5F] font-bold mt-2 inline-block">
                        ← Voltar para Dashboard Header
                    </a>
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

                        {/* Preview em contexto de lista */}
                        <div className="space-y-4">
                            {/* Preview isolado */}
                            <div className="flex items-center justify-center min-h-[200px] bg-[#0A0F0D]/50 rounded-xl p-8">
                                <div className="relative" style={{ width: `${currentAvatarSize}px`, height: `${currentAvatarSize}px` }}>
                                    {/* Avatar circular */}
                                    <Image
                                        src={exampleUser.avatar_url}
                                        alt={exampleUser.full_name}
                                        width={currentAvatarSize}
                                        height={currentAvatarSize}
                                        className="rounded-xl object-cover border-2 border-[#2D6B4F]"
                                    />

                                    {/* Badge de patente */}
                                    <div
                                        className="absolute z-10"
                                        style={{
                                            bottom: `${currentBadgeBottom}px`,
                                            right: `${currentBadgeRight}px`,
                                        }}
                                    >
                                        <div
                                            className="rounded-full bg-[#2D6B4F] flex items-center justify-center"
                                            style={{
                                                width: `${currentBadgeSize}px`,
                                                height: `${currentBadgeSize}px`,
                                                border: `${currentBorderWidth}px solid white`,
                                            }}
                                        >
                                            <span className="text-white font-bold" style={{ fontSize: `${currentBadgeSize * 0.5}px` }}>
                                                ⭐
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Preview em contexto - Lista de Elos */}
                            <div className="bg-[#0A0F0D]/50 rounded-xl p-4">
                                <h3 className="text-white font-bold mb-3 text-sm">Exemplo em lista:</h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative" style={{ width: `${currentAvatarSize}px`, height: `${currentAvatarSize}px` }}>
                                        <Image
                                            src={exampleUser.avatar_url}
                                            alt={exampleUser.full_name}
                                            width={currentAvatarSize}
                                            height={currentAvatarSize}
                                            className="rounded-xl object-cover border-2 border-[#2D6B4F]"
                                        />
                                        <div
                                            className="absolute z-10"
                                            style={{
                                                bottom: `${currentBadgeBottom}px`,
                                                right: `${currentBadgeRight}px`,
                                            }}
                                        >
                                            <div
                                                className="rounded-full bg-[#2D6B4F] flex items-center justify-center"
                                                style={{
                                                    width: `${currentBadgeSize}px`,
                                                    height: `${currentBadgeSize}px`,
                                                    border: `${currentBorderWidth}px solid white`,
                                                }}
                                            >
                                                <span className="text-white font-bold" style={{ fontSize: `${currentBadgeSize * 0.5}px` }}>
                                                    ⭐
                                                </span>
                                            </div>
                                        </div>
                                    </div>
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

                        {/* Current Values */}
                        <div className="mt-6 bg-[#2D6B4F]/20 rounded-lg p-4 border border-[#2D6B4F]/30">
                            <h3 className="text-white font-bold mb-2">Valores Atuais:</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm text-white/70">
                                <div>Avatar: <span className="text-white font-mono">{currentAvatarSize}px</span></div>
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
                            ⚙️ Controles {activeMode === 'desktop' ? 'Desktop' : 'Mobile'}
                        </h2>

                        <div className="space-y-6">
                            {activeMode === 'desktop' ? (
                                <>
                                    {/* Desktop Avatar Size */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Tamanho do Avatar: {desktopAvatarSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="30"
                                            max="80"
                                            value={desktopAvatarSize}
                                            onChange={(e) => setDesktopAvatarSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Desktop Badge Size */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Tamanho da Patente: {desktopBadgeSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="12"
                                            max="32"
                                            value={desktopBadgeSize}
                                            onChange={(e) => setDesktopBadgeSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Desktop Badge Position Bottom */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição Bottom: {desktopBadgeBottom}px
                                        </label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={desktopBadgeBottom}
                                            onChange={(e) => setDesktopBadgeBottom(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Desktop Badge Position Right */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição Right: {desktopBadgeRight}px
                                        </label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={desktopBadgeRight}
                                            onChange={(e) => setDesktopBadgeRight(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Desktop Border Width */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Espessura da Borda: {desktopBorderWidth}px
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="4"
                                            step="0.5"
                                            value={desktopBorderWidth}
                                            onChange={(e) => setDesktopBorderWidth(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Mobile Avatar Size */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Tamanho do Avatar: {mobileAvatarSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="30"
                                            max="60"
                                            value={mobileAvatarSize}
                                            onChange={(e) => setMobileAvatarSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Mobile Badge Size */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Tamanho da Patente: {mobileBadgeSize}px
                                        </label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="24"
                                            value={mobileBadgeSize}
                                            onChange={(e) => setMobileBadgeSize(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Mobile Badge Position Bottom */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição Bottom: {mobileBadgeBottom}px
                                        </label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={mobileBadgeBottom}
                                            onChange={(e) => setMobileBadgeBottom(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Mobile Badge Position Right */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Posição Right: {mobileBadgeRight}px
                                        </label>
                                        <input
                                            type="range"
                                            min="-10"
                                            max="10"
                                            value={mobileBadgeRight}
                                            onChange={(e) => setMobileBadgeRight(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Mobile Border Width */}
                                    <div>
                                        <label className="text-white font-bold mb-2 block">
                                            Espessura da Borda: {mobileBorderWidth}px
                                        </label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="3"
                                            step="0.5"
                                            value={mobileBorderWidth}
                                            onChange={(e) => setMobileBorderWidth(Number(e.target.value))}
                                            className="w-full"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Copy Button */}
                        <button
                            onClick={copyCode}
                            className="w-full mt-8 bg-[#F59E0B] hover:bg-[#F59E0B]/80 text-white font-bold py-4 rounded-lg transition"
                        >
                            📋 Copiar Código Completo
                        </button>

                        {/* Reset Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button
                                onClick={() => {
                                    if (activeMode === 'desktop') {
                                        setDesktopAvatarSize(48)
                                        setDesktopBadgeSize(20)
                                        setDesktopBadgeBottom(-2)
                                        setDesktopBadgeRight(-2)
                                        setDesktopBorderWidth(2)
                                    } else {
                                        setMobileAvatarSize(40)
                                        setMobileBadgeSize(16)
                                        setMobileBadgeBottom(-2)
                                        setMobileBadgeRight(-2)
                                        setMobileBorderWidth(1.5)
                                    }
                                }}
                                className="bg-[#1A2421] hover:bg-[#2D6B4F] text-white font-bold py-2 rounded-lg transition text-sm"
                            >
                                🔄 Resetar {activeMode === 'desktop' ? 'Desktop' : 'Mobile'}
                            </button>
                            <button
                                onClick={() => {
                                    setDesktopAvatarSize(48)
                                    setDesktopBadgeSize(20)
                                    setDesktopBadgeBottom(-2)
                                    setDesktopBadgeRight(-2)
                                    setDesktopBorderWidth(2)
                                    setMobileAvatarSize(40)
                                    setMobileBadgeSize(16)
                                    setMobileBadgeBottom(-2)
                                    setMobileBadgeRight(-2)
                                    setMobileBorderWidth(1.5)
                                }}
                                className="bg-[#1A2421] hover:bg-red-600 text-white font-bold py-2 rounded-lg transition text-sm"
                            >
                                🔄 Resetar Tudo
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
