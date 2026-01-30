'use client'

import { useState, useEffect, useRef } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'

interface Marca {
    nome: string
    valor: string
}

interface Modelo {
    modelo: string
}

interface VehicleSelectorProps {
    onVehicleChange: (data: {
        make: string
        model: string
        yearFab: string
        yearModel: string
        km: string
        color: string
    }) => void
    defaultValues?: {
        make?: string
        model?: string
        yearFab?: string
        yearModel?: string
        km?: string
        color?: string
    }
}

// Gerar anos de 1990 até ano atual + 1
const generateYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear + 1; year >= 1990; year--) {
        years.push(year.toString())
    }
    return years
}

const YEARS = generateYears()

// Cores comuns de veículos
const VEHICLE_COLORS = [
    'Preto',
    'Branco',
    'Prata',
    'Cinza',
    'Vermelho',
    'Azul',
    'Verde',
    'Amarelo',
    'Laranja',
    'Marrom',
    'Bege',
    'Dourado',
    'Vinho',
    'Rosa',
    'Outro'
]

export function VehicleSelector({ onVehicleChange, defaultValues }: VehicleSelectorProps) {
    const [marcas, setMarcas] = useState<Marca[]>([])
    const [modelos, setModelos] = useState<string[]>([])
    const [loadingMarcas, setLoadingMarcas] = useState(true)
    const [loadingModelos, setLoadingModelos] = useState(false)

    const [selectedMarca, setSelectedMarca] = useState<string>(defaultValues?.make || '')
    const [selectedMarcaValor, setSelectedMarcaValor] = useState<string>('')
    const [selectedModelo, setSelectedModelo] = useState<string>(defaultValues?.model || '')
    const [yearFab, setYearFab] = useState<string>(defaultValues?.yearFab || '')
    const [yearModel, setYearModel] = useState<string>(defaultValues?.yearModel || '')
    const [km, setKm] = useState<string>(defaultValues?.km || '')
    const [color, setColor] = useState<string>(defaultValues?.color || '')

    // Ref para callback
    const onVehicleChangeRef = useRef(onVehicleChange)
    onVehicleChangeRef.current = onVehicleChange

    // Buscar marcas ao carregar
    useEffect(() => {
        const fetchMarcas = async () => {
            try {
                const response = await fetch('https://brasilapi.com.br/api/fipe/marcas/v1/carros')
                const data = await response.json()
                // API retorna { nome, valor }
                setMarcas(data.sort((a: Marca, b: Marca) => a.nome.localeCompare(b.nome)))
            } catch (error) {
                console.error('Erro ao buscar marcas:', error)
                // Fallback: marcas mais comuns
                setMarcas([
                    { valor: '23', nome: 'GM - Chevrolet' },
                    { valor: '21', nome: 'Fiat' },
                    { valor: '22', nome: 'Ford' },
                    { valor: '25', nome: 'Honda' },
                    { valor: '26', nome: 'Hyundai' },
                    { valor: '29', nome: 'Jeep' },
                    { valor: '43', nome: 'Nissan' },
                    { valor: '48', nome: 'Renault' },
                    { valor: '56', nome: 'Toyota' },
                    { valor: '59', nome: 'VW - VolksWagen' },
                ])
            } finally {
                setLoadingMarcas(false)
            }
        }
        fetchMarcas()
    }, [])

    // Buscar modelos quando marca muda
    useEffect(() => {
        if (!selectedMarcaValor) {
            setModelos([])
            return
        }

        const fetchModelos = async () => {
            setLoadingModelos(true)
            try {
                const response = await fetch(`https://brasilapi.com.br/api/fipe/veiculos/v1/carros/${selectedMarcaValor}`)
                const data = await response.json()

                // API retorna array com { modelo: "nome do modelo" }
                // Extrair modelos únicos
                const modelosUnicos = new Set<string>()
                data.forEach((item: Modelo) => {
                    if (item.modelo) {
                        modelosUnicos.add(item.modelo)
                    }
                })

                const modelosList = Array.from(modelosUnicos).sort()
                setModelos(modelosList)
            } catch (error) {
                console.error('Erro ao buscar modelos:', error)
                setModelos([])
            } finally {
                setLoadingModelos(false)
            }
        }

        fetchModelos()
    }, [selectedMarcaValor])

    // Handler para mudança de marca
    const handleMarcaChange = (nome: string) => {
        const marca = marcas.find(m => m.nome === nome)
        setSelectedMarca(nome)
        setSelectedMarcaValor(marca?.valor || '')
        setSelectedModelo('')

        // Notificar
        onVehicleChangeRef.current({
            make: nome,
            model: '',
            yearFab,
            yearModel,
            km,
            color
        })
    }

    // Handler para mudança de modelo
    const handleModeloChange = (modelo: string) => {
        setSelectedModelo(modelo)
        onVehicleChangeRef.current({
            make: selectedMarca,
            model: modelo,
            yearFab,
            yearModel,
            km,
            color
        })
    }

    // Handler para outros campos
    const handleFieldChange = (field: string, value: string) => {
        switch (field) {
            case 'yearFab':
                setYearFab(value)
                break
            case 'yearModel':
                setYearModel(value)
                break
            case 'km':
                setKm(value)
                break
            case 'color':
                setColor(value)
                break
        }

        onVehicleChangeRef.current({
            make: selectedMarca,
            model: selectedModelo,
            yearFab: field === 'yearFab' ? value : yearFab,
            yearModel: field === 'yearModel' ? value : yearModel,
            km: field === 'km' ? value : km,
            color: field === 'color' ? value : color
        })
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                {/* Montadora */}
                <div>
                    <Label className="text-sm">Montadora *</Label>
                    <Select
                        value={selectedMarca}
                        onValueChange={handleMarcaChange}
                        disabled={loadingMarcas}
                    >
                        <SelectTrigger>
                            {loadingMarcas ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Carregando...</span>
                                </div>
                            ) : (
                                <SelectValue placeholder="Selecione" />
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            {marcas.map((marca) => (
                                <SelectItem key={marca.valor} value={marca.nome}>
                                    {marca.nome}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Modelo */}
                <div>
                    <Label className="text-sm">Modelo *</Label>
                    <Select
                        value={selectedModelo}
                        onValueChange={handleModeloChange}
                        disabled={!selectedMarca || loadingModelos}
                    >
                        <SelectTrigger>
                            {loadingModelos ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Carregando...</span>
                                </div>
                            ) : (
                                <SelectValue placeholder={selectedMarca ? "Selecione" : "Selecione a montadora"} />
                            )}
                        </SelectTrigger>
                        <SelectContent>
                            {modelos.map((modelo, idx) => (
                                <SelectItem key={`${modelo}-${idx}`} value={modelo}>
                                    {modelo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Ano Fabricação */}
                <div>
                    <Label className="text-sm">Ano Fabricação *</Label>
                    <Select value={yearFab} onValueChange={(v) => handleFieldChange('yearFab', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Fabricação" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((year) => (
                                <SelectItem key={`fab-${year}`} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Ano Modelo */}
                <div>
                    <Label className="text-sm">Ano Modelo *</Label>
                    <Select value={yearModel} onValueChange={(v) => handleFieldChange('yearModel', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Modelo" />
                        </SelectTrigger>
                        <SelectContent>
                            {YEARS.map((year) => (
                                <SelectItem key={`mod-${year}`} value={year}>
                                    {year}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Quilometragem */}
                <div>
                    <Label className="text-sm">Quilometragem</Label>
                    <Input
                        type="number"
                        placeholder="Ex: 50000"
                        value={km}
                        onChange={(e) => handleFieldChange('km', e.target.value)}
                    />
                </div>

                {/* Cor */}
                <div>
                    <Label className="text-sm">Cor</Label>
                    <Select value={color} onValueChange={(v) => handleFieldChange('color', v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                            {VEHICLE_COLORS.map((c) => (
                                <SelectItem key={c} value={c}>
                                    {c}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
