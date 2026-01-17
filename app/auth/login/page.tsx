'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LogIn, Loader2 } from 'lucide-react'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    const router = useRouter()
    const { signIn } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            console.log('🔐 Tentando login com:', data.email)
            await signIn(data.email, data.password)
            console.log('✅ Login bem-sucedido! Redirecionando...')
            // Force page reload to ensure auth state syncs
            window.location.href = '/dashboard'
        } catch (err: any) {
            console.error('❌ Erro no login:', err)
            setError(err.message || 'Ocorreu um erro ao fazer login. Tente novamente.')
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full bg-card/80 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-center mb-2">
                    <div className="p-4 rounded-full bg-primary/20 glow-orange">
                        <LogIn className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-3xl text-center text-impact text-primary">
                    Bem-vindo de volta
                </CardTitle>
                <CardDescription className="text-center text-base">
                    Continue sua jornada de transformação
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
                <CardContent className="space-y-4">
                    {error && (
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm animate-slide-down">
                            {error}
                        </div>
                    )}

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
                        <div className="flex items-center justify-between">
                            <label htmlFor="password" className="text-sm font-medium">
                                Senha
                            </label>
                            <Link
                                href="/auth/forgot-password"
                                className="text-xs text-primary hover:underline"
                            >
                                Esqueceu a senha?
                            </Link>
                        </div>
                        <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            {...register('password')}
                            error={errors.password?.message}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            'Entrar'
                        )}
                    </Button>
                    <p className="text-sm text-center text-muted-foreground">
                        Não tem uma conta?{' '}
                        <Link href="/auth/register" className="text-primary hover:underline font-medium">
                            Cadastre-se
                        </Link>
                    </p>
                </CardFooter>
            </form>
        </Card>
    )
}
