/**
 * Capitaliza a primeira letra de cada palavra
 * Ex: "joão silva" → "João Silva"
 */
export function toTitleCase(str: string): string {
    if (!str) return ''

    return str
        .toLowerCase()
        .split(' ')
        .map(word => {
            if (word.length === 0) return ''
            return word.charAt(0).toUpperCase() + word.slice(1)
        })
        .join(' ')
}

/**
 * Extrai o primeiro nome
 * Ex: "João Silva Santos" → "João"
 */
export function getFirstName(fullName: string): string {
    if (!fullName) return ''
    return toTitleCase(fullName.split(' ')[0])
}
