'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function DashboardBackground() {
    const [presetName, setPresetName] = useState<string>('light')
    const supabase = createClient()

    useEffect(() => {
        // Load user profile to get cover preferences
        const loadUserTheme = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('cover_url')
                .eq('id', user.id)
                .single()

            console.log('[DashboardBackground] Profile cover_url:', profile?.cover_url)

            if (profile?.cover_url?.startsWith('preset:')) {
                const preset = profile.cover_url.split(':')[1]
                console.log('[DashboardBackground] Setting preset:', preset)
                setPresetName(preset)
            } else {
                console.log('[DashboardBackground] No preset found, using default (light)')
                setPresetName('light')
            }
        }

        loadUserTheme()
    }, [])

    // Styles Rendering Logic - TODOS CLAROS para legibilidade
    const renderBackground = () => {
        switch (presetName) {
            case 'light':
                // Cinza Claro - Padrão Antigo Restaurado
                return <div className="fixed inset-0 -z-10 bg-[#e6e6e6] pointer-events-none" />

            case 'rota_business':
                // Cinza com Logo da Rota Business (sutil)
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#e8e8e8] via-[#d4d4d4] to-[#c0c0c0] pointer-events-none">
                        {/* Logo Watermark */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03]">
                            <svg width="600" height="600" viewBox="0 0 200 200" fill="none">
                                <circle cx="100" cy="100" r="80" stroke="#1A2421" strokeWidth="4" />
                                <path d="M100 40 L140 100 L100 80 L60 100 Z" fill="#1A2421" />
                                <text x="100" y="150" textAnchor="middle" fontSize="24" fill="#1A2421" fontWeight="bold">ROTA</text>
                            </svg>
                        </div>
                        {/* Subtle Grid */}
                        <div className="absolute inset-0 opacity-[0.02]" style={{
                            backgroundImage: "linear-gradient(#1A2421 1px, transparent 1px), linear-gradient(90deg, #1A2421 1px, transparent 1px)",
                            backgroundSize: "50px 50px"
                        }} />
                    </div>
                )

            case 'verde_claro':
                // Verde Claro Suave
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#d4e8d4] via-[#e8f5e8] to-[#c8dcc8] pointer-events-none">
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231A2421' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                        }} />
                    </div>
                )

            case 'laranja_claro':
                // Laranja Claro Vibrante
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#ffe4d4] via-[#ffd4b8] to-[#ffcba0] pointer-events-none">
                        <div className="absolute inset-0 opacity-[0.05]" style={{
                            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(212, 116, 44, 0.1) 0%, transparent 50%)"
                        }} />
                    </div>
                )

            case 'bege_aventura':
                // Bege/Creme - Tema Aventura
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#f5f0e8] via-[#e8dcc8] to-[#d4c8b0] pointer-events-none">
                        {/* Mapa Topográfico Sutil */}
                        <div className="absolute inset-0 opacity-[0.04]" style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7z' fill='%23D4742C' fill-opacity='0.4'/%3E%3C/svg%3E\")"
                        }} />
                    </div>
                )

            case 'azul_claro':
                // Azul Claro Céu
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#d4e8f5] via-[#e0f0ff] to-[#c8dce8] pointer-events-none">
                        {/* Nuvens Sutis */}
                        <div className="absolute inset-0 opacity-[0.06]" style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='200' height='100' viewBox='0 0 200 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cellipse cx='50' cy='50' rx='40' ry='20' fill='white' opacity='0.5'/%3E%3Cellipse cx='150' cy='60' rx='50' ry='25' fill='white' opacity='0.4'/%3E%3C/svg%3E\")",
                            backgroundSize: "400px 200px"
                        }} />
                    </div>
                )

            case 'rosa_claro':
                // Rosa Claro Suave
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#ffd4e8] via-[#ffe8f0] to-[#ffc8dc] pointer-events-none">
                        <div className="absolute inset-0 opacity-[0.04]" style={{
                            backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255, 182, 193, 0.2) 0%, transparent 50%)"
                        }} />
                    </div>
                )

            case 'amarelo_claro':
                // Amarelo Claro Dourado
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#fff8d4] via-[#ffeed4] to-[#ffe4b8] pointer-events-none">
                        <div className="absolute inset-0 opacity-[0.05]" style={{
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10 L35 25 L50 25 L38 35 L43 50 L30 40 L17 50 L22 35 L10 25 L25 25 Z' fill='%23F59E0B' opacity='0.1'/%3E%3C/svg%3E\")",
                            backgroundSize: "120px 120px"
                        }} />
                    </div>
                )

            case 'verde_menta':
                // Verde Menta Refrescante
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#d4f5e8] via-[#e0fff0] to-[#c8ffe0] pointer-events-none">
                        <div className="absolute inset-0 opacity-[0.03]" style={{
                            backgroundImage: "linear-gradient(45deg, rgba(26, 36, 33, 0.02) 25%, transparent 25%, transparent 75%, rgba(26, 36, 33, 0.02) 75%), linear-gradient(45deg, rgba(26, 36, 33, 0.02) 25%, transparent 25%, transparent 75%, rgba(26, 36, 33, 0.02) 75%)",
                            backgroundSize: "60px 60px",
                            backgroundPosition: "0 0, 30px 30px"
                        }} />
                    </div>
                )

            case 'lavanda':
                // Lavanda Claro
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#e8d4f5] via-[#f0e8ff] to-[#dcc8e8] pointer-events-none">
                        <div className="absolute inset-0 opacity-[0.04]" style={{
                            backgroundImage: "radial-gradient(circle at 70% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%)"
                        }} />
                    </div>
                )

            case 'pêssego':
                // Pêssego Claro
                return (
                    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#ffe8d4] via-[#fff0e0] to-[#ffd8c0] pointer-events-none">
                        <div className="absolute inset-0 opacity-[0.05]" style={{
                            backgroundImage: "radial-gradient(circle at 30% 40%, rgba(255, 160, 122, 0.15) 0%, transparent 50%)"
                        }} />
                    </div>
                )

            case 'default':
            default:
                // Default: Cinza Claro (igual ao 'light')
                return <div className="fixed inset-0 -z-10 bg-[#e6e6e6] pointer-events-none" />
        }
    }

    return (
        <>
            {/* Debug indicator */}
            <div className="fixed top-4 left-4 z-50 bg-black/80 text-white px-3 py-2 rounded text-xs font-mono">
                Tema: {presetName}
            </div>
            {renderBackground()}
        </>
    )
}
