'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, ShieldCheck, Settings, LogOut, Flame, Bell, Tags, ShoppingBag, Trophy, DollarSign, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/context'
import { useEffect, useState } from 'react'

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, signOut, loading } = useAuth()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Wait for auth to load before checking
        if (loading) {
            return
        }

        // Se não tem usuário, redireciona para login
        if (!user) {
            router.push('/auth/login')
            return
        }

        // Aguardar o role ser carregado (pode demorar um pouco após o login)
        // Se o role ainda não foi definido, não redireciona ainda
        if (user.role === undefined) {
            // Tentar novamente em 500ms
            const timeout = setTimeout(() => {
                if (user.role !== 'admin') {
                    router.push('/dashboard')
                } else {
                    setIsLoading(false)
                }
            }, 1000)
            return () => clearTimeout(timeout)
        }

        // Verificar se é admin
        if (user.role !== 'admin') {
            router.push('/dashboard')
        } else {
            setIsLoading(false)
        }
    }, [user, router, loading])

    const navigation = [
        { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { name: 'Mensagens', href: '/admin/notifications', icon: Bell },
        { name: 'Categorias', href: '/admin/categories', icon: Tags },
        { name: 'Pistas', href: '/admin/pistas', icon: MapPin },
        { name: 'Marketplace', href: '/admin/marketplace', icon: ShoppingBag },
        { name: 'Financeiro', href: '/admin/financeiro', icon: DollarSign },
        { name: 'Rota do Valente', href: '/admin/rota-valente', icon: Trophy },
        { name: 'Usuários', href: '/admin/users', icon: Users },
        { name: 'Verificações', href: '/admin/verifications', icon: ShieldCheck },
        { name: 'Configurações', href: '/admin/settings', icon: Settings },
    ]

    const handleSignOut = async () => {
        await signOut()
        router.push('/auth/login')
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-adventure">
                <div className="text-primary text-xl font-bold animate-pulse">Carregando Admin...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background flex pt-20">
            {/* Sidebar */}
            <aside className="w-64 border-r border-primary/20 bg-card/30 backdrop-blur-sm hidden md:flex flex-col">
                <div className="p-6 border-b border-primary/20">
                    <div className="flex items-center gap-2">
                        <Flame className="w-6 h-6 text-primary" />
                        <h1 className="text-xl font-bold text-impact text-primary">
                            Profissional Legendário Admin
                        </h1>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${isActive
                                    ? 'bg-primary/20 text-primary border border-primary/20'
                                    : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-primary/20">
                    <div className="mb-4 px-2">
                        <p className="text-xs text-muted-foreground">Logado como</p>
                        <p className="text-sm font-bold text-primary truncate">{user?.full_name}</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={handleSignOut}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-adventure">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
