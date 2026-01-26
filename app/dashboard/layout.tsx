'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClient()

    useEffect(() => {
        const loadBackground = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('page_background')
                .eq('id', user.id)
                .single()

            const theme = profile?.page_background || 'light'

            const colors: Record<string, string> = {
                'light': '#e6e6e6',
                'azul_claro': '#d4e8f5',
                'verde_claro': '#d4e8d4',
                'laranja': '#ffe4d4',
                'rosa': '#ffd4e8',
                'lavanda': '#e8d4f5',
            }

            document.body.style.background = colors[theme] || '#e6e6e6'
        }

        loadBackground()
    }, [])

    return <>{children}</>
}
