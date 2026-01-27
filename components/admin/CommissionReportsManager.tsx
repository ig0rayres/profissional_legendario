'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    TrendingUp, DollarSign, Users, Wallet, Loader2, Download,
    Calendar, ArrowUpRight, ArrowDownRight, CheckCircle, Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface MonthlyReport {
    month: number
    year: number
    total_referrals: number
    total_commissions: number
    total_amount: number
    paid_amount: number
    pending_amount: number
}

interface CommissionSummary {
    total_earned: number
    total_paid: number
    total_pending: number
    total_referrals: number
    active_referrers: number
    avg_commission: number
}

export function CommissionReportsManager() {
    const [loading, setLoading] = useState(true)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [monthlyData, setMonthlyData] = useState<MonthlyReport[]>([])
    const [summary, setSummary] = useState<CommissionSummary | null>(null)

    const supabase = createClient()
    const currentYear = new Date().getFullYear()
    const years = [currentYear - 1, currentYear, currentYear + 1]

    useEffect(() => {
        loadReports()
    }, [selectedYear])

    const loadReports = async () => {
        setLoading(true)
        try {
            // Gerar relatório para cada mês do ano selecionado
            const reports: MonthlyReport[] = []

            for (let month = 1; month <= 12; month++) {
                const { data, error } = await supabase.rpc('generate_monthly_commission_report', {
                    p_month: month,
                    p_year: selectedYear
                })

                if (data && data[0]) {
                    reports.push({
                        month,
                        year: selectedYear,
                        total_referrals: Number(data[0].total_referrals) || 0,
                        total_commissions: Number(data[0].total_commissions) || 0,
                        total_amount: Number(data[0].total_amount) || 0,
                        paid_amount: Number(data[0].paid_amount) || 0,
                        pending_amount: Number(data[0].pending_amount) || 0
                    })
                }
            }

            setMonthlyData(reports)

            // Calcular resumo geral
            const { data: summaryData } = await supabase
                .from('referral_commissions')
                .select('commission_amount, status')

            const { data: referralsData } = await supabase
                .from('referrals')
                .select('id, referrer_id')

            if (summaryData && referralsData) {
                const totalEarned = summaryData.reduce((acc, c) => acc + Number(c.commission_amount), 0)
                const totalPaid = summaryData.filter(c => c.status === 'withdrawn').reduce((acc, c) => acc + Number(c.commission_amount), 0)
                const totalPending = summaryData.filter(c => c.status !== 'withdrawn' && c.status !== 'cancelled').reduce((acc, c) => acc + Number(c.commission_amount), 0)
                const uniqueReferrers = new Set(referralsData.map(r => r.referrer_id)).size

                setSummary({
                    total_earned: totalEarned,
                    total_paid: totalPaid,
                    total_pending: totalPending,
                    total_referrals: referralsData.length,
                    active_referrers: uniqueReferrers,
                    avg_commission: summaryData.length > 0 ? totalEarned / summaryData.length : 0
                })
            }
        } catch (error) {
            console.error('Error loading reports:', error)
            toast.error('Erro ao carregar relatórios')
        } finally {
            setLoading(false)
        }
    }

    const getMonthName = (month: number) => {
        const names = ['', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        return names[month]
    }

    const exportToCSV = () => {
        const headers = ['Mês', 'Indicações', 'Comissões', 'Valor Total', 'Pago', 'Pendente']
        const rows = monthlyData.map(r => [
            `${getMonthName(r.month)}/${r.year}`,
            r.total_referrals,
            r.total_commissions,
            r.total_amount.toFixed(2),
            r.paid_amount.toFixed(2),
            r.pending_amount.toFixed(2)
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n')

        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `relatorio_comissoes_${selectedYear}.csv`
        a.click()

        toast.success('Relatório exportado!')
    }

    // Totais do ano
    const yearTotal = monthlyData.reduce((acc, r) => acc + r.total_amount, 0)
    const yearPaid = monthlyData.reduce((acc, r) => acc + r.paid_amount, 0)
    const yearPending = monthlyData.reduce((acc, r) => acc + r.pending_amount, 0)
    const yearReferrals = monthlyData.reduce((acc, r) => acc + r.total_referrals, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header com seletor de ano */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Relatório de Comissões</h2>
                    <p className="text-sm text-muted-foreground">Acompanhe o desempenho do programa de indicações</p>
                </div>
                <div className="flex gap-3">
                    <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                        <SelectTrigger className="w-32">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {years.map(y => (
                                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={exportToCSV}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                    </Button>
                </div>
            </div>

            {/* Cards de resumo geral */}
            {summary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-primary/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-primary mb-1">
                                <Users className="w-4 h-4" />
                                <span className="text-xs">Total Indicações</span>
                            </div>
                            <p className="text-2xl font-bold">{summary.total_referrals}</p>
                            <p className="text-xs text-muted-foreground">{summary.active_referrers} indicadores ativos</p>
                        </CardContent>
                    </Card>
                    <Card className="border-green-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-green-500 mb-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs">Total Gerado</span>
                            </div>
                            <p className="text-2xl font-bold text-green-500">
                                R$ {summary.total_earned.toFixed(2)}
                            </p>
                            <p className="text-xs text-muted-foreground">Média: R$ {summary.avg_commission.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                    <Card className="border-blue-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-blue-500 mb-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Total Pago</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-500">
                                R$ {summary.total_paid.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-yellow-500/20">
                        <CardContent className="pt-4">
                            <div className="flex items-center gap-2 text-yellow-500 mb-1">
                                <Clock className="w-4 h-4" />
                                <span className="text-xs">Pendente</span>
                            </div>
                            <p className="text-2xl font-bold text-yellow-500">
                                R$ {summary.total_pending.toFixed(2)}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabela mensal */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-primary" />
                        Relatório Mensal - {selectedYear}
                    </CardTitle>
                    <CardDescription>
                        Detalhamento mês a mês das comissões geradas
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mês</TableHead>
                                <TableHead className="text-center">Indicações</TableHead>
                                <TableHead className="text-center">Comissões</TableHead>
                                <TableHead className="text-right">Valor Total</TableHead>
                                <TableHead className="text-right">Pago</TableHead>
                                <TableHead className="text-right">Pendente</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {monthlyData.map((row) => (
                                <TableRow key={row.month}>
                                    <TableCell className="font-medium">
                                        {getMonthName(row.month)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {row.total_referrals > 0 ? (
                                            <Badge variant="outline">{row.total_referrals}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {row.total_commissions > 0 ? (
                                            <Badge className="bg-primary/20 text-primary">{row.total_commissions}</Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">
                                        {row.total_amount > 0 ? (
                                            <span className="text-green-500">R$ {row.total_amount.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {row.paid_amount > 0 ? (
                                            <span className="text-blue-500">R$ {row.paid_amount.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {row.pending_amount > 0 ? (
                                            <span className="text-yellow-500">R$ {row.pending_amount.toFixed(2)}</span>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {/* Linha de totais */}
                            <TableRow className="bg-muted/50 font-bold">
                                <TableCell>TOTAL {selectedYear}</TableCell>
                                <TableCell className="text-center">{yearReferrals}</TableCell>
                                <TableCell className="text-center">-</TableCell>
                                <TableCell className="text-right text-green-500">R$ {yearTotal.toFixed(2)}</TableCell>
                                <TableCell className="text-right text-blue-500">R$ {yearPaid.toFixed(2)}</TableCell>
                                <TableCell className="text-right text-yellow-500">R$ {yearPending.toFixed(2)}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
