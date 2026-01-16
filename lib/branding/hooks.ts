import { useBranding } from './context'

export function useTop() {
    const { top } = useBranding()
    return top
}

export function useBrandingSettings() {
    const { branding, updateBranding, isLoading } = useBranding()
    return { branding, updateBranding, isLoading }
}
