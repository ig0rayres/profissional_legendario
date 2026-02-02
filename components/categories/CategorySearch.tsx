'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import * as LucideIcons from 'lucide-react'

export interface ServiceCategory {
    id: string
    name: string
    slug: string
    icon: string
    color: string
    keywords?: string[]
    tags?: string[]
}

interface CategorySearchProps {
    selectedCategories: ServiceCategory[]
    onSelect: (category: ServiceCategory) => void
    onRemove: (categoryId: string) => void
    maxCategories?: number
    placeholder?: string
    disabled?: boolean
}

export function CategorySearch({
    selectedCategories,
    onSelect,
    onRemove,
    maxCategories = -1, // -1 = ilimitado
    placeholder = 'Busque categorias profissionais...',
    disabled = false
}: CategorySearchProps) {
    const [searchTerm, setSearchTerm] = useState('')
    const [results, setResults] = useState<ServiceCategory[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Buscar categorias com debounce
    useEffect(() => {
        if (!searchTerm.trim()) {
            setResults([])
            setShowDropdown(false)
            return
        }

        const timer = setTimeout(async () => {
            setIsSearching(true)
            try {
                const response = await fetch(
                    `/api/categories/search?q=${encodeURIComponent(searchTerm)}&limit=20`
                )

                if (response.ok) {
                    const data = await response.json()
                    // Filtrar categorias já selecionadas
                    const filtered = data.categories.filter(
                        (cat: ServiceCategory) =>
                            !selectedCategories.some(selected => selected.id === cat.id)
                    )
                    setResults(filtered)
                    setShowDropdown(filtered.length > 0)
                }
            } catch (error) {
                console.error('Erro ao buscar categorias:', error)
            } finally {
                setIsSearching(false)
            }
        }, 300) // Debounce de 300ms

        return () => clearTimeout(timer)
    }, [searchTerm, selectedCategories])

    // Verificar se atingiu o limite
    const isLimitReached = maxCategories !== -1 && selectedCategories.length >= maxCategories
    const remainingSlots = maxCategories === -1
        ? Infinity
        : maxCategories - selectedCategories.length

    function handleSelectCategory(category: ServiceCategory) {
        if (isLimitReached) return

        onSelect(category)
        setSearchTerm('')
        setResults([])
        setShowDropdown(false)
        inputRef.current?.focus()
    }

    function handleRemoveCategory(categoryId: string) {
        onRemove(categoryId)
        inputRef.current?.focus()
    }

    // Pegar ícone dinamicamente
    function getCategoryIcon(iconName: string) {
        const Icon = (LucideIcons as any)[iconName]
        return Icon ? <Icon className="h-4 w-4" /> : <LucideIcons.Tag className="h-4 w-4" />
    }

    return (
        <div className="space-y-4">
            {/* Hint de Pesquisa */}
            <p className="text-xs text-gray-500">
                💡 Dica: Use a pesquisa para encontrar categorias rapidamente
            </p>

            {/* Campo de Busca */}
            <div className="relative" ref={dropdownRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        ref={inputRef}
                        type="text"
                        placeholder={isLimitReached ? 'Limite atingido' : placeholder}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        disabled={disabled || isLimitReached}
                        className="pl-10 pr-10"
                        onFocus={() => {
                            if (searchTerm.trim() && results.length > 0) {
                                setShowDropdown(true)
                            }
                        }}
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-[#2E4A3E] rounded-full" />
                        </div>
                    )}
                </div>


                {/* Dropdown de Resultados */}
                {showDropdown && results.length > 0 && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg max-h-[32rem] overflow-y-auto">
                        {results.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleSelectCategory(category)}
                                className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                            >
                                <div className="font-medium text-sm text-gray-900">
                                    {category.name}
                                </div>
                                {category.tags && category.tags.length > 0 && (
                                    <div className="flex gap-2 mt-1">
                                        {category.tags.slice(0, 3).map((tag, i) => (
                                            <span
                                                key={i}
                                                className="text-xs text-gray-500"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {/* Mensagem quando não encontra resultados */}
                {showDropdown && searchTerm.trim() && !isSearching && results.length === 0 && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-300 rounded-md shadow-lg p-4">
                        <p className="text-sm text-gray-500 text-center">
                            Nenhuma categoria encontrada para "{searchTerm}"
                        </p>
                    </div>
                )}
            </div>

            {/* Contador e Limite */}
            <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                    {selectedCategories.length} {selectedCategories.length === 1 ? 'categoria selecionada' : 'categorias selecionadas'}
                </span>
                {maxCategories !== -1 && (
                    <span className={`font-medium ${isLimitReached ? 'text-red-600' : 'text-gray-900'}`}>
                        {selectedCategories.length}/{maxCategories}
                    </span>
                )}
            </div>

            {/* Categorias Selecionadas - ESTILO SÓBRIO */}
            {selectedCategories.length > 0 && (
                <div className="space-y-2">
                    {selectedCategories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm group hover:border-gray-300 transition-colors"
                        >
                            <span className="font-medium text-gray-900">{category.name}</span>
                            <button
                                onClick={() => handleRemoveCategory(category.id)}
                                disabled={disabled}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                                title="Remover categoria"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Aviso de Limite Atingido */}
            {isLimitReached && (
                <Alert variant="default" className="border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        Limite de categorias atingido ({maxCategories}). Para adicionar mais categorias,
                        considere fazer upgrade do seu plano.
                    </AlertDescription>
                </Alert>
            )}

            {/* Mensagem de Incentivo */}
            {!isLimitReached && maxCategories !== -1 && remainingSlots > 0 && remainingSlots <= 3 && (
                <p className="text-sm text-gray-500">
                    Você pode adicionar mais {remainingSlots} {remainingSlots === 1 ? 'categoria' : 'categorias'}.
                </p>
            )}
        </div>
    )
}
