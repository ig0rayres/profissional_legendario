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
import { CheckCircle, XCircle, Loader2, Edit, Users as UsersIcon } from 'lucide-react'
import { Database } from '@/types/database'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<Profile | null>(null)
    const [editForm, setEditForm] = useState<Partial<Profile>>({})

    const supabase = createClient()

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error loading users:', error)
        }
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

    function handleEditClick(user: Profile) {
        setEditingUser(user)
        setEditForm({
            full_name: user.full_name,
            email: user.email,
            cpf: user.cpf,
            role: user.role,
            rota_number: user.rota_number,
            verification_status: user.verification_status,
        })
    }

    async function handleSaveEdit() {
        if (!editingUser) return

        setProcessing(editingUser.id)
        try {
            const { error } = await supabase
                .from('profiles')
                .update(editForm)
                .eq('id', editingUser.id)

            if (error) throw error

            // Update local state
            setUsers(users.map(u =>
                u.id === editingUser.id ? { ...u, ...editForm } : u
            ))
            setEditingUser(null)
        } catch (error) {
            alert('Erro ao atualizar usuário')
        } finally {
            setProcessing(null)
        }
    }

    const getPlanBadge = (role: string) => {
        const plans: Record<string, { label: string, color: string }> = {
            'admin': { label: 'Admin', color: 'bg-purple-500' },
            'professional': { label: 'Profissional', color: 'bg-blue-500' },
            'user': { label: 'Usuário', color: 'bg-gray-500' },
        }
        const plan = plans[role] || plans['user']
        return <Badge className={`${plan.color} text-white`}>{plan.label}</Badge>
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gerenciar Usuários</h2>
                    <p className="text-muted-foreground flex items-center gap-2 mt-1">
                        <UsersIcon className="w-4 h-4" />
                        {users.length} {users.length === 1 ? 'usuário cadastrado' : 'usuários cadastrados'}
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
                            <TableHead>ID Rota</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                                    Nenhum usuário cadastrado
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">{user.full_name}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.cpf}</TableCell>
                                    <TableCell className="font-mono text-xs">{user.rota_number || '-'}</TableCell>
                                    <TableCell>{getPlanBadge(user.role)}</TableCell>
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
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="h-8 px-3"
                                                onClick={() => handleEditClick(user)}
                                            >
                                                <Edit className="h-3 w-3 mr-1" />
                                                Editar
                                            </Button>
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Usuário</DialogTitle>
                        <DialogDescription>
                            Faça alterações no perfil do usuário
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-name">Nome Completo</Label>
                            <Input
                                id="edit-name"
                                value={editForm.full_name || ''}
                                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email || ''}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-cpf">CPF</Label>
                            <Input
                                id="edit-cpf"
                                value={editForm.cpf || ''}
                                onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-rota">ID Rota Business</Label>
                            <Input
                                id="edit-rota"
                                value={editForm.rota_number || ''}
                                onChange={(e) => setEditForm({ ...editForm, rota_number: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-role">Tipo de Conta</Label>
                            <Select
                                value={editForm.role || 'user'}
                                onValueChange={(value) => setEditForm({ ...editForm, role: value as any })}
                            >
                                <SelectTrigger id="edit-role">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">Usuário</SelectItem>
                                    <SelectItem value="professional">Profissional</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status de Verificação</Label>
                            <Select
                                value={editForm.verification_status || 'pending'}
                                onValueChange={(value) => setEditForm({ ...editForm, verification_status: value as any })}
                            >
                                <SelectTrigger id="edit-status">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendente</SelectItem>
                                    <SelectItem value="verified">Verificado</SelectItem>
                                    <SelectItem value="rejected">Rejeitado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingUser(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={!!processing}>
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                'Salvar Alterações'
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
