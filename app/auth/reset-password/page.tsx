'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
})

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const onSubmit = async (data: ResetPasswordFormData) => {
        setIsLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            })

            if (error) throw error

            // Redirecionar para login com mensagem de sucesso
            router.push('/auth/login?reset=success')
        } catch (err: any) {
            setError(err.message || 'Erro ao redefinir senha.')
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full bg-card/80 backdrop-blur-md border-primary/20 shadow-xl">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-center mb-2">
                    <div className="p-4 rounded-full bg-primary/20 glow-orange">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <CardTitle className="text-3xl text-center text-impact text-primary">
                    Nova Senha
                </CardTitle>
                <CardDescription className="text-center text-base">
                    Digite sua nova senha
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
                        <label htmlFor="password" className="text-sm font-medium">
                            Nova Senha
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
                <CardFooter>
                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-lg py-6"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redefinindo...
                            </>
                        ) : (
                            'Redefinir Senha'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
