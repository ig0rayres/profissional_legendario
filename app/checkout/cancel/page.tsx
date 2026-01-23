'use client'

import { motion } from 'framer-motion'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'

export default function CheckoutCancelPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-lg"
            >
                <Card className="border-orange-500/30 bg-card/80 backdrop-blur-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-red-500/20 p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
                            className="w-20 h-20 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center mx-auto mb-4"
                        >
                            <XCircle className="w-10 h-10 text-orange-500" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-3xl font-bold text-orange-500 mb-2"
                        >
                            Pagamento Cancelado
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="text-muted-foreground"
                        >
                            Nenhuma cobrança foi realizada
                        </motion.p>
                    </div>

                    <CardContent className="p-8 space-y-6">
                        <div className="space-y-4 text-center">
                            <p className="text-muted-foreground">
                                Você cancelou o processo de checkout. Sua assinatura não foi alterada.
                            </p>

                            <div className="bg-muted/30 border border-muted/50 rounded-lg p-4 text-left">
                                <p className="text-sm text-muted-foreground">
                                    <HelpCircle className="w-4 h-4 inline mr-2" />
                                    Se você teve algum problema durante o pagamento, entre em contato com nosso suporte.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Link href="/dashboard" className="w-full">
                                <Button className="w-full" size="lg">
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Voltar ao Dashboard
                                </Button>
                            </Link>

                            <Link href="/#planos" className="w-full">
                                <Button variant="outline" className="w-full" size="lg">
                                    Ver Planos Novamente
                                </Button>
                            </Link>
                        </div>

                        <p className="text-xs text-center text-muted-foreground">
                            Você pode tentar novamente a qualquer momento.
                        </p>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    )
}
