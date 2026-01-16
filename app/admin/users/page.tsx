'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (data) setUsers(data)
        setLoading(false)
    }

    async function handleVerification(userId: string, status: 'verified' | 'rejected') {
        setProcessing(userId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ verification_status: status })
                .eq('id', userId)

            if (error) throw error

            // Update local state
            setUsers(users.map(u =>
                u.id === userId ? { ...u, verification_status: status } : u
            ))
        } catch (error) {
            alert('Erro ao atualizar status')
        } finally {
            setProcessing(null)
        }
    }

    if (loading) {
        return <div>Carregando usuários...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h2>
                    <p className="text-muted-foreground">
                        Visualize e gerencie os profissionais cadastrados
                    </p>
                </div>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.full_name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>{user.cpf}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            user.verification_status === 'verified' ? 'default' :
                                                user.verification_status === 'rejected' ? 'destructive' : 'secondary'
                                        }
                                        className={
                                            user.verification_status === 'verified' ? 'bg-green-500 hover:bg-green-600' : ''
                                        }
                                    >
                                        {user.verification_status === 'verified' ? 'Verificado' :
                                            user.verification_status === 'rejected' ? 'Rejeitado' : 'Pendente'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        {user.verification_status !== 'verified' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                                onClick={() => handleVerification(user.id, 'verified')}
                                                disabled={processing === user.id}
                                            >
                                                {processing === user.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                        {user.verification_status !== 'rejected' && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                onClick={() => handleVerification(user.id, 'rejected')}
                                                disabled={processing === user.id}
                                            >
                                                {processing === user.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
