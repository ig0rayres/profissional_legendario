'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { BrandingSettings, Top, BrandingContextType } from './types'

const BrandingContext = createContext<BrandingContextType | undefined>(undefined)

export function BrandingProvider({ children }: { children: React.ReactNode }) {
    const [branding, setBranding] = useState<BrandingSettings | null>(null)
    const [top, setTop] = useState<Top | null>(null)
    const [isLoading, setIsLoading] = useState(false) // DEMO MODE: No loading needed
    const [error, setError] = useState<Error | null>(null)

    // DEMO MODE: Use default branding, no Supabase calls
    useEffect(() => {
        // Set default branding for demo - Rustic Outdoor theme
        const defaultBranding: BrandingSettings = {
            id: 'demo-branding',
            top_id: 'demo-top',
            primary_color: '#b8652a',      // Burnt orange - earthy
            secondary_color: '#8b5a3c',    // Deep brown-orange
            accent_color: '#d4883e',       // Warm amber - campfire
            background_color: '#14110f',   // Dark earth
            foreground_color: '#f2ede9',   // Natural off-white
            logo_url: null,
            auth_background_url: null,
            dashboard_background_url: null
        }

        setBranding(defaultBranding)
        applyBrandingStyles(defaultBranding)
        setIsLoading(false)
    }, [])

    const updateBranding = async (settings: Partial<BrandingSettings>) => {
        if (!branding?.id) return

        // DEMO MODE: Just update local state
        try {
            const newBranding = { ...branding, ...settings }
            setBranding(newBranding)
            applyBrandingStyles(newBranding)
        } catch (err) {
            console.error('Error updating branding:', err)
            throw err
        }
    }

    return (
        <BrandingContext.Provider value={{ branding, top, isLoading, error, updateBranding }}>
            {children}
        </BrandingContext.Provider>
    )
}

function applyBrandingStyles(settings: BrandingSettings) {
    const root = document.documentElement

    // Helper to convert hex to HSL (simplified)
    // In a real app, we'd use a library or proper conversion
    // For now, we'll assume the values are already HSL or use them as is if they are hex
    // But since Tailwind uses HSL variables, we should ideally convert.
    // For this MVP, let's assume the user inputs valid CSS color values

    // Note: Tailwind config expects HSL values without 'hsl()' wrapper
    // We might need a utility to convert hex to HSL channels

    // Setting CSS variables directly
    // This works if we update tailwind config to use these variables directly
    // or if we use style attribute on body

    root.style.setProperty('--primary-color', settings.primary_color)
    root.style.setProperty('--secondary-color', settings.secondary_color)
    root.style.setProperty('--accent-color', settings.accent_color)
}

export function useBranding() {
    const context = useContext(BrandingContext)
    if (context === undefined) {
        throw new Error('useBranding must be used within a BrandingProvider')
    }
    return context
}
