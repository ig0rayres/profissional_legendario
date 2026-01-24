'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function DashboardBackground() {
    const [presetName, setPresetName] = useState<string>('default')
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

            if (profile?.cover_url?.startsWith('preset:')) {
                const preset = profile.cover_url.split(':')[1]
                setPresetName(preset)
            } else {
                setPresetName('default')
            }
        }

        loadUserTheme()
    }, [])

    // Styles Rendering Logic
    const renderBackground = () => {
        switch (presetName) {
            case 'orange':
                return <div className="fixed inset-0 z-0 bg-gradient-to-br from-orange-950/80 via-[#1a1510] to-black pointer-events-none" />

            case 'gray':
                return <div className="fixed inset-0 z-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black pointer-events-none" />

            case 'cyber':
                return (
                    <div className="fixed inset-0 z-0 bg-black pointer-events-none">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0_1px,transparent_1px),linear-gradient(to_bottom,#0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                    </div>
                )

            case 'gold':
                return (
                    <div className="fixed inset-0 z-0 bg-black pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4d3a18] via-[#1a1205] to-black" />
                        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)' }} />
                    </div>
                )

            case 'treasure_map':
                return (
                    <div className="fixed inset-0 z-0 bg-[#1c1917] pointer-events-none">
                        {/* Papel envelhecido dark */}
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')] opacity-10 mix-blend-overlay" />
                        {/* Linhas de Mapa SVG Inline */}
                        <div className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23D4742C' fill-opacity='0.4' fill-rule='evenodd'/%3E%3C/svg%3E\")",
                            }}
                        />
                        {/* X Marks the Spot - Decorative */}
                        <div className="absolute right-20 bottom-20 opacity-10 rotate-12">
                            <svg width="150" height="150" viewBox="0 0 24 24" fill="none" stroke="#D4742C" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </div>
                    </div>
                )

            case 'night_ops':
                return (
                    <div className="fixed inset-0 z-0 bg-[#050a05] pointer-events-none">
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_2px,3px_100%] opacity-20" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2e1a]/30 via-transparent to-[#0f2e1a]/20" />
                        {/* Radar Scanline Animation Class must exist in globals or tailwind, but generic animate-pulse works as fallback */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#00ff00]/5 to-transparent h-full w-full animate-pulse opacity-10" />
                    </div>
                )

            case 'desert':
                return (
                    <div className="fixed inset-0 z-0 bg-[#1c1814] pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#4a3b2a] via-[#261f18] to-[#0f0c0a]" />
                        <div className="absolute inset-0 opacity-[0.05]"
                            style={{
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dcb482' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
                            }}
                        />
                    </div>
                )

            case 'default':
            default:
                // Default theme is handled by global CSS (Verde Legendários)
                return null
        }
    }

    return renderBackground()
}
