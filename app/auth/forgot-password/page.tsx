'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const forgotPasswordSchema = z.object({
    email: z.string().email('Email inválido'),
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
                redirectTo: `${window.location.origin}/auth/reset-password`,
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email de recuperação.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <Card className="w-full bg-card/80 backdrop-blur-md border-primary/20 shadow-xl">
                <CardHeader className="space-y-3">
                    <div className="flex items-center justify-center mb-2">
                        <div className="p-4 rounded-full bg-green-500/20 glow-green">
                            <Mail className="w-8 h-8 text-green-500" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl text-center text-impact text-primary">
                        Email Enviado!
                    </CardTitle>
                    <CardDescription className="text-center text-base">
                        Verifique sua caixa de entrada
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-md bg-green-500/10 border border-green-500/20">
                        <p className="text-sm text-center">
                            Enviamos um link de recuperação de senha para seu email.
                            Clique no link para criar uma nova senha.
                        </p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Link href="/auth/login" className="w-full">
                        <Button variant="outline" className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar ao Login
                        </Button>
                    </Link>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card className="w-full bg-card/80 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-center mb-2">
                    <div className="p-4 rounded-full bg-primary/20 glow-orange">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-3xl text-center text-impact text-primary">
                    Recuperar Senha
                </CardTitle>
                <CardDescription className="text-center text-base">
                    Digite seu email para receber o link de recuperação
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
                                Enviando...
                            </>
                        ) : (
                            <>
                                <Mail className="mr-2 h-4 w-4" />
                                Enviar Link de Recuperação
                            </>
                        )}
                    </Button>
                    <Link href="/auth/login" className="w-full">
                        <Button variant="ghost" className="w-full">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Voltar ao Login
                        </Button>
                    </Link>
                </CardFooter>
            </form>
        </Card>
    )
}
