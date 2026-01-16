export interface Location {
    id: string
    label: string
    value: string
    state: string
}

export const LOCATIONS: Location[] = [
    {
        id: '1',
        label: 'Maringá - PR',
        value: 'maringa-pr',
        state: 'PR'
    },
    {
        id: '2',
        label: 'Ribeirão Preto - SP',
        value: 'ribeirao-preto-sp',
        state: 'SP'
    },
    {
        id: '3',
        label: 'São Paulo - SP',
        value: 'sao-paulo-sp',
        state: 'SP'
    }
]
