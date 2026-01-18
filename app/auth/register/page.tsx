'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserPlus, Loader2 } from 'lucide-react'
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LOCATIONS } from '@/lib/data/locations'

export default function RegisterPage() {
    const router = useRouter()
    const { signUp } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            isProfessional: false
        }
    })

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
                        <Select onValueChange={(value) => setValue('pista', value)}>
                            <SelectTrigger className={errors.pista ? "border-destructive" : ""}>
                                <SelectValue placeholder="Selecione sua unidade" />
                            </SelectTrigger>
                            <SelectContent className="bg-background">
                                {LOCATIONS.map((location) => (
                                    <SelectItem key={location.id} value={location.value}>
                                        {location.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.pista && (
                            <p className="text-sm text-destructive">{errors.pista.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="rotaNumber" className="text-sm font-medium">
                            ID Rota Business *
                        </label>
                        <Input
                            id="rotaNumber"
                            type="text"
                            placeholder="Ex: ROT-12345"
                            {...register('rotaNumber')}
                            error={errors.rotaNumber?.message}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Obrigatório para todos os membros.
                        </p>
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
