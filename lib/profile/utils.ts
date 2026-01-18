/**
 * Funções utilitárias para URLs de perfil
 */

/**
 * Gera slug a partir do nome do usuário
 * Exemplo: "João Silva" -> "joao-silva"
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim()
}

/**
 * Gera URL completa do perfil do usuário
 * Formato: /nome-usuario/000001
 */
export function getProfileUrl(profile: {
    full_name: string
    slug?: string | null
    rota_number?: string | null
}): string {
    const slug = profile.slug || generateSlug(profile.full_name)
    const rotaNumber = profile.rota_number || '000000'

    return `/${encodeURIComponent(slug)}/${rotaNumber}`
}

/**
 * Gera URL absoluta do perfil (para compartilhamento)
 */
export function getAbsoluteProfileUrl(
    profile: { full_name: string; slug?: string | null; rota_number?: string | null },
    baseUrl: string = typeof window !== 'undefined' ? window.location.origin : ''
): string {
    return `${baseUrl}${getProfileUrl(profile)}`
}
