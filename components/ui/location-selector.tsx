'use client'

import { useState, useEffect, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

interface Cidade {
    id: number
    nome: string
}

interface LocationSelectorProps {
    onLocationChange: (location: string) => void
    defaultValue?: string
}

// Estados brasileiros em ordem alfabética
const ESTADOS_BRASIL: { sigla: string; nome: string }[] = [
    { sigla: 'AC', nome: 'Acre' },
    { sigla: 'AL', nome: 'Alagoas' },
    { sigla: 'AP', nome: 'Amapá' },
    { sigla: 'AM', nome: 'Amazonas' },
    { sigla: 'BA', nome: 'Bahia' },
    { sigla: 'CE', nome: 'Ceará' },
    { sigla: 'DF', nome: 'Distrito Federal' },
    { sigla: 'ES', nome: 'Espírito Santo' },
    { sigla: 'GO', nome: 'Goiás' },
    { sigla: 'MA', nome: 'Maranhão' },
    { sigla: 'MT', nome: 'Mato Grosso' },
    { sigla: 'MS', nome: 'Mato Grosso do Sul' },
    { sigla: 'MG', nome: 'Minas Gerais' },
    { sigla: 'PA', nome: 'Pará' },
    { sigla: 'PB', nome: 'Paraíba' },
    { sigla: 'PR', nome: 'Paraná' },
    { sigla: 'PE', nome: 'Pernambuco' },
    { sigla: 'PI', nome: 'Piauí' },
    { sigla: 'RJ', nome: 'Rio de Janeiro' },
    { sigla: 'RN', nome: 'Rio Grande do Norte' },
    { sigla: 'RS', nome: 'Rio Grande do Sul' },
    { sigla: 'RO', nome: 'Rondônia' },
    { sigla: 'RR', nome: 'Roraima' },
    { sigla: 'SC', nome: 'Santa Catarina' },
    { sigla: 'SP', nome: 'São Paulo' },
    { sigla: 'SE', nome: 'Sergipe' },
    { sigla: 'TO', nome: 'Tocantins' },
]

export function LocationSelector({ onLocationChange, defaultValue }: LocationSelectorProps) {
    const [estado, setEstado] = useState<string>('')
    const [cidade, setCidade] = useState<string>('')
    const [cidades, setCidades] = useState<Cidade[]>([])
    const [loadingCidades, setLoadingCidades] = useState(false)

    // Ref para guardar a função onLocationChange sem causar re-renders
    const onLocationChangeRef = useRef(onLocationChange)
    onLocationChangeRef.current = onLocationChange

    // Parse default value (formato: "Cidade - UF")
    useEffect(() => {
        if (defaultValue) {
            const parts = defaultValue.split(' - ')
            if (parts.length === 2) {
                setCidade(parts[0])
                setEstado(parts[1])
            }
        }
    }, [defaultValue])

    // Buscar cidades quando estado muda
    useEffect(() => {
        if (!estado) {
            setCidades([])
            return
        }

        const fetchCidades = async () => {
            setLoadingCidades(true)
            try {
                const response = await fetch(
                    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`
                )
                const data = await response.json()
                setCidades(data.map((c: any) => ({ id: c.id, nome: c.nome })))
            } catch (error) {
                console.error('Erro ao buscar cidades:', error)
                setCidades([])
            } finally {
                setLoadingCidades(false)
            }
        }

        fetchCidades()
    }, [estado])

    // Handler para mudança de estado
    const handleEstadoChange = (value: string) => {
        setEstado(value)
        setCidade('')
    }

    // Handler para mudança de cidade
    const handleCidadeChange = (value: string) => {
        setCidade(value)
        // Notificar o pai imediatamente
        if (value && estado) {
            onLocationChangeRef.current(`${value} - ${estado}`)
        }
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Estado */}
            <div>
                <Label className="text-sm">Estado *</Label>
                <Select value={estado} onValueChange={handleEstadoChange}>
                    <SelectTrigger>
                        <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                        {ESTADOS_BRASIL.map((e) => (
                            <SelectItem key={e.sigla} value={e.sigla}>
                                {e.sigla}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Cidade */}
            <div>
                <Label className="text-sm">Cidade *</Label>
                <Select
                    value={cidade}
                    onValueChange={handleCidadeChange}
                    disabled={!estado || loadingCidades}
                >
                    <SelectTrigger>
                        {loadingCidades ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Carregando...</span>
                            </div>
                        ) : (
                            <SelectValue placeholder={estado ? "Selecione" : "Selecione o estado"} />
                        )}
                    </SelectTrigger>
                    <SelectContent>
                        {cidades.map((c) => (
                            <SelectItem key={c.id} value={c.nome}>
                                {c.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}
