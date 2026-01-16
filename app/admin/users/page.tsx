'use client'

import { useEffect, useState, useMemo } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { CheckCircle, XCircle, Loader2, Edit, Users as UsersIcon, Search, Filter, Trash2 } from 'lucide-react'
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
import { RankInsignia } from '@/components/gamification/rank-insignia'

type Profile = Database['public']['Tables']['profiles']['Row']

export default function UsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [processing, setProcessing] = useState<string | null>(null)
    const [editingUser, setEditingUser] = useState<Profile | null>(null)
    const [editForm, setEditForm] = useState<Partial<Profile>>({})

    // Bulk selection
    const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [statusFilter, setStatusFilter] = useState<string>('all')

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(20)

    const supabase = createClient()

    useEffect(() => {
        loadUsers()
    }, [])

    async function loadUsers() {
        try {
            // Query 1: Buscar profiles
            const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (profilesError) {
                console.error('❌ Error loading profiles:', profilesError)
                setLoading(false)
                return
            }

            // Query 2: Buscar subscriptions
            const { data: subscriptions, error: subsError } = await supabase
                .from('subscriptions')
                .select('user_id, plan_id')

            // Query 3: Buscar gamification
            const { data: gamification, error: gamifError } = await supabase
                .from('user_gamification')
                .select('user_id, current_rank_id, total_points, total_medals')

            // Combinar os dados manualmente
            const combined = profiles?.map(profile => ({
                ...profile,
                subscriptions: subscriptions?.find(s => s.user_id === profile.id),
                user_gamification: gamification?.find(g => g.user_id === profile.id)
            })) || []

            console.log('✅ Usuários carregados:', combined.length)
            console.log('📋 Primeiros 3:', combined.slice(0, 3))
            setUsers(combined as any)
        } catch (error) {
            console.error('❌ Unexpected error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtered users
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = !searchTerm ||
                user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.rota_number?.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesRole = roleFilter === 'all' || user.role === roleFilter
            const matchesStatus = statusFilter === 'all' || user.verification_status === statusFilter

            return matchesSearch && matchesRole && matchesStatus
        })
    }, [users, searchTerm, roleFilter, statusFilter])

    // Paginated users
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage
        const endIndex = startIndex + itemsPerPage
        return filteredUsers.slice(startIndex, endIndex)
    }, [filteredUsers, currentPage, itemsPerPage])

    // Total pages
    const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, roleFilter, statusFilter, itemsPerPage])

    // Bulk selection handlers
    const toggleSelectAll = () => {
        if (selectedUsers.size === paginatedUsers.length && paginatedUsers.length > 0) {
            // Deselect all on this page
            const newSelected = new Set(selectedUsers)
            paginatedUsers.forEach(u => newSelected.delete(u.id))
            setSelectedUsers(newSelected)
        } else {
            // Select all on this page
            const newSelected = new Set(selectedUsers)
            paginatedUsers.forEach(u => newSelected.add(u.id))
            setSelectedUsers(newSelected)
        }
    }

    const toggleSelectUser = (userId: string) => {
        const newSelected = new Set(selectedUsers)
        if (newSelected.has(userId)) {
            newSelected.delete(userId)
        } else {
            newSelected.add(userId)
        }
        setSelectedUsers(newSelected)
    }

    async function handleBulkVerify() {
        if (selectedUsers.size === 0) return

        setProcessing('bulk')
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ verification_status: 'verified' })
                .in('id', Array.from(selectedUsers))

            if (error) throw error

            setUsers(users.map(u =>
                selectedUsers.has(u.id) ? { ...u, verification_status: 'verified' } : u
            ))
            setSelectedUsers(new Set())
        } catch (error) {
            alert('Erro ao verificar usuários')
        } finally {
            setProcessing(null)
        }
    }

    async function handleBulkDelete() {
        if (selectedUsers.size === 0) return
        if (!confirm(`Deseja realmente deletar ${selectedUsers.size} usuários?`)) return

        setProcessing('bulk')
        try {
            const { error } = await supabase
                .from('profiles')
                .delete()
                .in('id', Array.from(selectedUsers))

            if (error) throw error

            setUsers(users.filter(u => !selectedUsers.has(u.id)))
            setSelectedUsers(new Set())
        } catch (error) {
            alert('Erro ao deletar usuários')
        } finally {
            setProcessing(null)
        }
    }

    async function handleVerification(userId: string, status: 'verified' | 'rejected') {
        setProcessing(userId)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ verification_status: status })
                .eq('id', userId)

            if (error) throw error

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

    const getPlanBadge = (user: any) => {
        const planId = user.subscriptions?.plan_id || 'recruta'
        const plans: Record<string, { label: string, color: string }> = {
            'recruta': { label: 'Recruta', color: 'bg-gray-500' },
            'veterano': { label: 'Veterano', color: 'bg-blue-500' },
            'elite': { label: 'Elite', color: 'bg-purple-500' },
        }
        const plan = plans[planId] || plans['recruta']
        return <Badge className={`${plan.color} text-white`}>{plan.label}</Badge>
    }

    const getUserRank = (user: any) => {
        return user.user_gamification?.current_rank_id || null
    }

    const getVigorPoints = (user: any) => {
        return user.user_gamification?.total_points || 0
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
                        {filteredUsers.length} de {users.length} {users.length === 1 ? 'usuário' : 'usuários'}
                    </p>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, email ou ID Rota..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrar por plano" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os planos</SelectItem>
                        <SelectItem value="user">Usuário</SelectItem>
                        <SelectItem value="professional">Profissional</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="verified">Verificado</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="rejected">Rejeitado</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Bulk Actions */}
            {selectedUsers.size > 0 && (
                <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-md">
                    <span className="text-sm font-medium">
                        {selectedUsers.size} {selectedUsers.size === 1 ? 'usuário selecionado' : 'usuários selecionados'}
                    </span>
                    <div className="flex gap-2 ml-auto">
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBulkVerify}
                            disabled={processing === 'bulk'}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verificar Selecionados
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleBulkDelete}
                            disabled={processing === 'bulk'}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Deletar Selecionados
                        </Button>
                    </div>
                </div>
            )}

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={paginatedUsers.length > 0 && paginatedUsers.every(u => selectedUsers.has(u.id))}
                                    onCheckedChange={toggleSelectAll}
                                />
                            </TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>CPF</TableHead>
                            <TableHead>ID Rota</TableHead>
                            <TableHead>Patente</TableHead>
                            <TableHead>Plano</TableHead>
                            <TableHead>Vigor</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Data Cadastro</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                                        ? 'Nenhum usuário encontrado com os filtros aplicados'
                                        : 'Nenhum usuário cadastrado'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map((user) => {
                                const rankId = getUserRank(user)
                                const vigorPoints = getVigorPoints(user)

                                return (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedUsers.has(user.id)}
                                                onCheckedChange={() => toggleSelectUser(user.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{user.full_name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.cpf}</TableCell>
                                        <TableCell className="font-mono text-xs">{user.rota_number || '-'}</TableCell>
                                        <TableCell>
                                            {rankId ? (
                                                <RankInsignia rankId={rankId} variant="badge" showLabel={true} />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>{getPlanBadge(user)}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-mono">
                                                {vigorPoints} pts
                                            </Badge>
                                        </TableCell>
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
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
                        </span>
                        <Select value={itemsPerPage.toString()} onValueChange={(v) => setItemsPerPage(Number(v))}>
                            <SelectTrigger className="w-[130px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="20">20 por página</SelectItem>
                                <SelectItem value="50">50 por página</SelectItem>
                                <SelectItem value="100">100 por página</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                        >
                            Primeira
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            Anterior
                        </Button>
                        <span className="text-sm px-4">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Próxima
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                        >
                            Última
                        </Button>
                    </div>
                </div>
            )}

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
