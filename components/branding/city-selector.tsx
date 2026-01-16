'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { createClient } from '@/lib/supabase/client'
import { Top } from '@/lib/branding/types'

interface CitySelectorProps {
    onSelect: (topId: string) => void
    value?: string
    error?: string
}

export function CitySelector({ onSelect, value, error }: CitySelectorProps) {
    const [open, setOpen] = useState(false)
    const [tops, setTops] = useState<Top[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadTops() {
            try {
                const supabase = createClient()
                const { data } = await supabase
                    .from('tops')
                    .select('*')
                    .order('name')

                if (data) {
                    setTops(data)
                }
            } catch (error) {
                console.error('Error loading tops:', error)
            } finally {
                setLoading(false)
            }
        }

        loadTops()
    }, [])

    return (
        <div className="space-y-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between",
                            !value && "text-muted-foreground",
                            error && "border-destructive"
                        )}
                    >
                        {value
                            ? tops.find((top) => top.id === value)?.name
                            : "Selecione sua cidade..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                    <Command>
                        <CommandInput placeholder="Buscar cidade..." />
                        <CommandEmpty>Nenhuma cidade encontrada.</CommandEmpty>
                        <CommandGroup>
                            {tops.map((top) => (
                                <CommandItem
                                    key={top.id}
                                    value={top.name}
                                    onSelect={() => {
                                        onSelect(top.id)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === top.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {top.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
            {error && (
                <p className="text-sm text-destructive animate-slide-down">
                    {error}
                </p>
            )}
        </div>
    )
}
