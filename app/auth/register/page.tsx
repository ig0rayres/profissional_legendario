'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, Loader2, CheckCircle } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { GorraOCR } from '@/components/auth/gorra-ocr'

// Tipo para pistas do banco de dados
interface Pista {
    id: string
    name: string
    city: string
    state: string
}

export default function RegisterPage() {
    const router = useRouter()
    const { signUp } = useAuth()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [gorraPhoto, setGorraPhoto] = useState<File | null>(null)
    const [idVerified, setIdVerified] = useState(false)
    const [pistas, setPistas] = useState<Pista[]>([])
    const [loadingPistas, setLoadingPistas] = useState(true)

    // Carregar pistas do banco de dados
    useEffect(() => {
        async function loadPistas() {
            setLoadingPistas(true)
            const { data, error } = await supabase
                .from('pistas')
                .select('id, name, city, state')
                .eq('active', true)
                .order('state')
                .order('city')

            if (data) {
                setPistas(data)
            }
            setLoadingPistas(false)
        }
        loadPistas()
    }, [])

    // Restaurar dados do formulário do sessionStorage
    const getSavedFormData = () => {
        if (typeof window !== 'undefined') {
            const saved = sessionStorage.getItem('registerFormData')
            if (saved) {
                try {
                    return JSON.parse(saved)
                } catch {
                    return {}
                }
            }
        }
        return {}
    }

    const savedData = getSavedFormData()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            isProfessional: false,
            fullName: savedData.fullName || '',
            email: savedData.email || '',
            cpf: savedData.cpf || '',
            pista: savedData.pista || '',
            rotaNumber: savedData.rotaNumber || '',
        }
    })

    // Observar mudanças e salvar no sessionStorage
    const formValues = watch()
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const dataToSave = {
                fullName: formValues.fullName,
                email: formValues.email,
                cpf: formValues.cpf,
                pista: formValues.pista,
                rotaNumber: formValues.rotaNumber,
            }
            sessionStorage.setItem('registerFormData', JSON.stringify(dataToSave))
        }
    }, [formValues.fullName, formValues.email, formValues.cpf, formValues.pista, formValues.rotaNumber])

    // Restaurar pista selecionada
    useEffect(() => {
        if (savedData.pista && pistas.length > 0) {
            setValue('pista', savedData.pista)
        }
    }, [pistas, savedData.pista, setValue])

    // Restaurar ID verificado
    useEffect(() => {
        if (savedData.rotaNumber) {
            setIdVerified(true)
        }
    }, [])

    const onSubmit = async (data: RegisterFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            // Verificar se o rota_number já existe
            const supabase = await import('@/lib/supabase/client').then(m => m.createClient())
            const { data: existingUser, error: checkError } = await supabase
                .from('profiles')
                .select('rota_number')
                .eq('rota_number', data.rotaNumber)
                .maybeSingle()

            if (existingUser) {
                setError('Este ID Rota Business já está em uso. Por favor, use outro.')
                setIsLoading(false)
                return
            }

            // Pass rotaNumber (now required)
            await signUp(data.email, data.password, data.fullName, data.cpf, data.pista, 'recruta', data.rotaNumber)

            // Limpar dados salvos após cadastro bem-sucedido
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('registerFormData')
            }

            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            // Se o erro não for de duplicação, mostrar erro genérico
            if (err.message && !err.message.includes('duplicate key')) {
                setError(err.message || 'Ocorreu um erro ao criar sua conta. Tente novamente.')
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full bg-card/80 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-center mb-2">
                    <div className="p-4 rounded-full bg-primary/20 glow-orange">
                        <UserPlus className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-3xl text-center text-impact text-primary">
                    Torne-se um Membro Rota Business
                </CardTitle>
                <CardDescription className="text-center text-base">
                    Inicie sua jornada de transformação
                </CardDescription>
            </CardHeader>
            <form
                method="post"
                action="#"
                onSubmit={(e) => {
                    e.preventDefault()
                    handleSubmit(onSubmit)(e)
                }}
            >
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-down">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="fullName" className="text-sm font-medium">
                            Nome Completo
                        </label>
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="João Silva"
                            {...register('fullName')}
                            error={errors.fullName?.message}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                            Email
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            {...register('email')}
                            error={errors.email?.message}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="cpf" className="text-sm font-medium">
                            CPF
                        </label>
                        <Input
                            id="cpf"
                            type="text"
                            placeholder="000.000.000-00"
                            {...register('cpf')}
                            error={errors.cpf?.message}
                            disabled={isLoading}
                            maxLength={14}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="pista" className="text-sm font-medium">
                            Unidade (Pista)
                        </label>
                        <Select onValueChange={(value) => setValue('pista', value)} disabled={loadingPistas}>
                            <SelectTrigger className={errors.pista ? "border-destructive" : ""}>
                                <SelectValue placeholder={loadingPistas ? "Carregando..." : "Selecione sua unidade"} />
                            </SelectTrigger>
                            <SelectContent className="bg-background max-h-60">
                                {pistas.length === 0 ? (
                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                        Nenhuma pista disponível
                                    </div>
                                ) : (
                                    <>
                                        {/* Agrupar por estado */}
                                        {Object.entries(
                                            pistas.reduce((acc, pista) => {
                                                if (!acc[pista.state]) acc[pista.state] = []
                                                acc[pista.state].push(pista)
                                                return acc
                                            }, {} as Record<string, Pista[]>)
                                        ).sort().map(([state, statePistas]) => (
                                            <div key={state}>
                                                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                                                    {state}
                                                </div>
                                                {statePistas.map((pista) => (
                                                    <SelectItem key={pista.id} value={pista.id}>
                                                        {pista.city} - {pista.name}
                                                    </SelectItem>
                                                ))}
                                            </div>
                                        ))}
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.pista && (
                            <p className="text-sm text-destructive">{errors.pista.message}</p>
                        )}
                    </div>

                    {/* Verificação por Foto da Gorra */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Verificação de Membro *
                        </label>
                        <GorraOCR
                            onIdExtracted={(id) => {
                                setValue('rotaNumber', id)
                                setIdVerified(true)
                            }}
                            onPhotoCapture={(file) => setGorraPhoto(file)}
                            disabled={isLoading}
                        />

                        {/* Campo ID (preenchido automaticamente pelo OCR) */}
                        <div className="mt-3">
                            <label htmlFor="rotaNumber" className="text-sm font-medium flex items-center gap-2">
                                ID Rota Business
                                {idVerified && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </label>
                            <Input
                                id="rotaNumber"
                                type="text"
                                placeholder="Será preenchido automaticamente"
                                {...register('rotaNumber')}
                                error={errors.rotaNumber?.message}
                                disabled={isLoading}
                                className={idVerified ? 'border-green-500 bg-green-500/10' : ''}
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                {idVerified
                                    ? '✅ ID verificado pela foto da gorra'
                                    : 'Tire uma foto da aba da sua gorra para verificar seu ID'
                                }
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">
                            Senha
                        </label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            error={errors.password?.message}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">
                            Confirmar Senha
                        </label>
                        <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            {...register('confirmPassword')}
                            error={errors.confirmPassword?.message}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Criando conta...
                            </>
                        ) : (
                            'Criar Conta'
                        )}
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                        Já tem uma conta?{' '}
                        <Link
                            href="/auth/login"
                            className="text-primary hover:underline font-medium"
                        >
                            Faça login
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
