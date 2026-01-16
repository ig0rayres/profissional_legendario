export interface BrandingSettings {
    id: string
    top_id: string
    logo_url: string | null
    auth_background_url: string | null
    dashboard_background_url: string | null
    primary_color: string
    secondary_color: string
    accent_color: string
    background_color: string
    foreground_color: string
}

export interface Top {
    id: string
    name: string
    slug: string
}

export interface BrandingContextType {
    branding: BrandingSettings | null
    top: Top | null
    isLoading: boolean
    error: Error | null
    updateBranding: (settings: Partial<BrandingSettings>) => Promise<void>
}
