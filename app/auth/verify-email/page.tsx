'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, RefreshCw, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function VerifyEmailPage() {
    const [isResending, setIsResending] = useState(false)
    const [resent, setResent] = useState(false)
    const supabase = createClient()

    const resendEmail = async () => {
        setIsResending(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user?.email) {
                await supabase.auth.resend({
                    type: 'signup',
                    email: user.email,
                })
                setResent(true)
            }
        } catch (error) {
            console.error('Erro ao reenviar email:', error)
        } finally {
            setIsResending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 p-4">
            <Card className="w-full max-w-md bg-card/80 backdrop-blur-md border-primary/20 shadow-xl">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Verifique seu email</CardTitle>
                    <CardDescription className="text-base">
                        Enviamos um link de confirmação para o seu email.
                        Clique no link para ativar sua conta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
                        <p className="font-medium mb-2">📧 Não recebeu o email?</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Verifique a pasta de spam</li>
                            <li>Aguarde alguns minutos</li>
                            <li>Clique abaixo para reenviar</li>
                        </ul>
                    </div>

                    {resent ? (
                        <div className="flex items-center gap-2 text-green-500 justify-center py-2">
                            <CheckCircle className="w-5 h-5" />
                            <span>Email reenviado com sucesso!</span>
                        </div>
                    ) : (
                        <Button
                            onClick={resendEmail}
                            disabled={isResending}
                            variant="outline"
                            className="w-full"
                        >
                            {isResending ? (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                    Reenviando...
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reenviar email
                                </>
                            )}
                        </Button>
                    )}

                    <div className="text-center pt-4 border-t">
                        <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-primary">
                            Voltar para login
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
