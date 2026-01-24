'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export function DashboardBackground() {
    const [bgStyle, setBgStyle] = useState<React.CSSProperties | null>(null)
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
                applyPreset(preset)
            } else {
                setPresetName('default')
                applyPreset('default')
            }
        }

        loadUserTheme()

        // Listen for realtime changes? (Optional, but let's stick to load once for now)
    }, [])

    const applyPreset = (preset: string) => {
        // Define styles based on preset
        // Using a portal or Fixed div logic
    }

    // Styles Rendering Logic
    // We return a fixed div at z-[-50]

    const renderBackground = () => {
        switch (presetName) {
            case 'orange':
                return <div className="fixed inset-0 z-[-50] bg-gradient-to-br from-orange-950/80 via-[#1a1510] to-black pointer-events-none" />
            case 'gray':
                return <div className="fixed inset-0 z-[-50] bg-gradient-to-br from-gray-900 via-gray-950 to-black pointer-events-none" />
            case 'cyber':
                return (
                    <div className="fixed inset-0 z-[-50] bg-black pointer-events-none">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f0_1px,transparent_1px),linear-gradient(to_bottom,#0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
                    </div>
                )
            case 'gold':
                return <div className="fixed inset-0 z-[-50] bg-gradient-to-br from-yellow-950/50 via-[#1a1505] to-black pointer-events-none" />
            case 'treasure_map':
                return (
                    <div className="fixed inset-0 z-[-50] bg-[#151c19] pointer-events-none">
                        <div className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: "repeating-linear-gradient(45deg, #444 0, #444 1px, transparent 0, transparent 50%)",
                                backgroundSize: "30px 30px"
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80" />
                    </div>
                )
            case 'default':
            default:
                // Original 'bg-adventure' color is handled by global css probably, 
                // but we can overlay a subtle gradient to match the requested areas better if needed.
                // The user wants 'default' to be 'standard'.
                // If we don't render anything, it falls back to 'bg-adventure' from body class.
                return null
        }
    }

    return renderBackground()
}
