'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { createClient } from '@/lib/supabase/client'
import {
    CreditCard, ArrowLeft, Download, ExternalLink,
    CheckCircle2, Clock, AlertCircle, Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'

export default function FinanceiroPage() {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [loading, setLoading] = useState(true)
    const [subscription, setSubscription] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            router.push('/auth/login')
            return
        }
        loadFinancialData()
    }, [user, authLoading])

    async function loadFinancialData() {
        if (!user) return
        setLoading(true)
        const supabase = createClient()

        // Carregar assinatura atual
        const { data: subData } = await supabase
            .from('subscriptions')
            .select('*, plans(*)')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

        setSubscription(subData)

        // Carregar histórico de pagamentos (Mockado por enquanto se não houver tabela)
        // Se houver tabela payments, usar:
        // const { data: payData } = await supabase.from('payments').select('*').eq('user_id', user.id)

        // MOCK DATA para demonstrar a interface
        setPayments([
            { id: 'pay_01', date: '2024-01-15', description: 'Mensalidade - Plano Veterano', amount: 99.90, status: 'paid', invoice_url: '#' },
            { id: 'pay_02', date: '2023-12-15', description: 'Mensalidade - Plano Veterano', amount: 99.90, status: 'paid', invoice_url: '#' },
            { id: 'pay_03', date: '2023-11-15', description: 'Upgrade para Veterano', amount: 49.90, status: 'paid', invoice_url: '#' },
        ])

        setLoading(false)
    }

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-adventure pt-20">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
        )
    }

    const planName = subscription?.plans?.name || 'Recruta'
    const planPrice = subscription?.plans?.price || 0
    const nextBilling = subscription?.current_period_end
        ? new Date(subscription.current_period_end).toLocaleDateString('pt-BR')
        : 'N/A'

    return (
        <div className="min-h-screen bg-adventure">
            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="hover:bg-white/10">
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                            <CreditCard className="w-6 h-6 text-primary" />
                            Financeiro
                        </h1>
                        <p className="text-white/60">Gerencie sua assinatura e histórico de pagamentos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Coluna Esquerda: Assinatura Atual */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-[#1A2421]/90 border-primary/20 backdrop-blur-md shadow-xl">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-white">Meu Plano</CardTitle>
                                <CardDescription className="text-gray-400">Assinatura ativa</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge className="bg-primary hover:bg-primary/90 text-white uppercase tracking-wider font-bold">
                                            {planName}
                                        </Badge>
                                        <Badge variant="outline" className="border-green-500 text-green-500 gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> Ativo
                                        </Badge>
                                    </div>
                                    <div className="mt-2">
                                        <span className="text-2xl font-bold text-white">R$ {planPrice.toFixed(2)}</span>
                                        <span className="text-sm text-gray-400">/mês</span>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Próxima cobrança</span>
                                        <span className="text-white">{nextBilling}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Forma de pagamento</span>
                                        <span className="text-white flex items-center gap-1">
                                            <CreditCard className="w-3 h-3" /> •••• 4242
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-3 pt-2">
                                <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold uppercase tracking-wide">
                                    <Link href="/planos">
                                        Fazer Upgrade / Trocar Plano
                                    </Link>
                                </Button>
                                <Button variant="outline" className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/5">
                                    Gerenciar Cartão
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Card de Fatura Pendente (Exemplo) */}
                        <Card className="bg-orange-500/10 border-orange-500/30">
                            <CardContent className="pt-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-orange-500">Nota Importante</h4>
                                        <p className="text-sm text-gray-300 mt-1">
                                            Sua próxima fatura será gerada em 5 dias. Mantenha seu cartão atualizado para evitar interrupções.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Coluna Direita: Histórico */}
                    <div className="lg:col-span-2">
                        <Card className="bg-[#1A2421]/90 border-white/10 backdrop-blur-md shadow-xl h-full">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-white">Histórico Financeiro</CardTitle>
                                        <CardDescription className="text-gray-400">Suas faturas e pagamentos recentes</CardDescription>
                                    </div>
                                    <Button variant="outline" size="sm" className="border-white/10 text-gray-300">
                                        <Download className="w-4 h-4 mr-2" />
                                        Exportar
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-hidden rounded-xl border border-white/5 bg-black/20 backdrop-blur-md">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-white/5 text-gray-400 font-medium uppercase text-xs tracking-wider">
                                            <tr>
                                                <th className="p-4">Data</th>
                                                <th className="p-4">Descrição</th>
                                                <th className="p-4">Valor</th>
                                                <th className="p-4">Status</th>
                                                <th className="p-4 text-right">Documentos</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {payments.map((payment, idx) => (
                                                <tr
                                                    key={payment.id}
                                                    className="group hover:bg-white/5 transition-colors duration-300"
                                                    style={{ animationDelay: `${idx * 100}ms` }}
                                                >
                                                    <td className="p-4 text-white">
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-[#1E4D40] group-hover:text-[#D4742C] transition-colors" />
                                                            {new Date(payment.date).toLocaleDateString('pt-BR')}
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-gray-300 font-medium">{payment.description}</td>
                                                    <td className="p-4 text-white font-bold text-base">
                                                        R$ {payment.amount.toFixed(2)}
                                                    </td>
                                                    <td className="p-4">
                                                        <Badge
                                                            variant="secondary"
                                                            className="bg-[#1E4D40]/20 text-[#4ADE80] border border-[#1E4D40]/50 shadow-[0_0_10px_rgba(74,222,128,0.1)]"
                                                        >
                                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                                            Pago
                                                        </Badge>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <TooltipProvider>
                                                            <div className="flex items-center justify-end gap-2">
                                                                <Tooltip>
                                                                    <TooltipTrigger asChild>
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="h-8 border-[#D4742C]/30 text-[#D4742C] hover:bg-[#D4742C]/20 hover:text-[#D4742C] hover:border-[#D4742C]"
                                                                            onClick={() => alert("Módulo de Nota Fiscal será integrado em breve")}
                                                                        >
                                                                            <Download className="w-3.5 h-3.5 mr-1.5" />
                                                                            Nota Fiscal
                                                                        </Button>
                                                                    </TooltipTrigger>
                                                                    <TooltipContent>Baixar NF-e</TooltipContent>
                                                                </Tooltip>
                                                            </div>
                                                        </TooltipProvider>
                                                    </td>
                                                </tr>
                                            ))}
                                            {payments.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="p-12 text-center text-gray-500">
                                                        Nenhum pagamento encontrado.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                            <CardFooter className="border-t border-white/10 pt-6">
                                <p className="text-xs text-gray-500 w-full text-center">
                                    Precisa de ajuda com uma cobrança? <a href="#" className="text-primary hover:underline">Entre em contato com o suporte</a>.
                                </p>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
