'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Briefcase, Menu, X, LogOut, Store, Shield, Settings, Users, User, Flame } from 'lucide-react'
import { useAuth } from '@/lib/auth/context'
import { RotabusinessLogo } from '@/components/branding/logo'
import Image from 'next/image'
import { MOCK_USER_GAMIFICATION, MOCK_RANKS } from '@/lib/data/mock'
import { RankInsignia } from '@/components/gamification/rank-insignia'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { CriticalNoticeModal } from '@/components/notifications/critical-notice-modal'

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const { user, signOut } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        await signOut()
        router.push('/auth/login')
    }

    const headerClass = 'bg-card/95 backdrop-blur-md border-b border-primary/20 shadow-lg'

    return (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <RotabusinessLogo size={40} className="text-primary" />
                    </Link>

                    {/* Desktop Menu */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/#sobre" className="text-foreground hover:text-primary transition-colors font-semibold">
                            Sobre
                        </Link>
                        <Link href="/#profissionais" className="text-foreground hover:text-primary transition-colors font-semibold">
                            Profissionais
                        </Link>
                        <Link href="/rota-do-valente" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2">
                            <Shield className="w-4 h-4 text-secondary" />
                            Rota do Valente
                        </Link>
                        {user && (
                            <Link href="/elo-da-rota" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2">
                                <Users className="w-4 h-4 text-purple-500" />
                                Elo da Rota
                            </Link>
                        )}
                        <Link href="/na-rota" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            Na Rota
                        </Link>
                        <Link href="/projects/create" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2">
                            <Briefcase className="w-4 h-4" />
                            Lançar Projeto
                        </Link>
                        <Link href="/#eventos" className="text-foreground hover:text-primary transition-colors font-semibold">
                            Eventos
                        </Link>
                        <Link href="/#depoimentos" className="text-foreground hover:text-primary transition-colors font-semibold">
                            Depoimentos
                        </Link>
                        <Link href="/#planos" className="text-foreground hover:text-primary transition-colors font-semibold">
                            Planos
                        </Link>
                        <Link href="/marketplace" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2 text-primary">
                            <Store className="w-4 h-4" />
                            Marketplace
                        </Link>

                        {user?.role === 'admin' && (
                            <Link href="/admin" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2 text-secondary">
                                <Settings className="w-4 h-4" />
                                Admin
                            </Link>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-primary/20">
                                <div className="flex items-center gap-4">
                                    {/* Avatar com Notificação */}
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full border-2 border-primary/30 overflow-hidden bg-primary/10 flex items-center justify-center">
                                            {user.avatar_url ? (
                                                <Image
                                                    src={user.avatar_url}
                                                    alt={user.full_name}
                                                    width={48}
                                                    height={48}
                                                    className="object-cover w-full h-full"
                                                />
                                            ) : (
                                                <User className="w-6 h-6 text-primary/60" />
                                            )}
                                        </div>
                                        {/* Sino de Notificação na parte debaixo do Avatar */}
                                        <div className="absolute -bottom-4 -right-4">
                                            <NotificationCenter />
                                        </div>
                                    </div>
                                    <CriticalNoticeModal />

                                    {(() => {
                                        const gamif = MOCK_USER_GAMIFICATION.find(g => g.user_id === user.id)
                                        const rank = MOCK_RANKS.find(r => r.id === gamif?.current_rank_id)
                                        // Mostrar nome e sobrenome (até 2 palavras)
                                        const nameParts = user.full_name.split(' ')
                                        const displayName = nameParts.length >= 2
                                            ? `${nameParts[0]} ${nameParts[1]}`
                                            : nameParts[0]

                                        return rank ? (
                                            <div className="flex flex-col ml-2">
                                                <span className="text-sm text-muted-foreground">
                                                    Olá, <span className="text-primary font-bold">{displayName}</span>
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-sm text-muted-foreground ml-2">
                                                Olá, <span className="text-primary font-bold">{displayName}</span>
                                            </span>
                                        )
                                    })()}
                                </div>
                                <Link href="/dashboard">
                                    <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                                        Dashboard
                                    </Button>
                                </Link>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSignOut}
                                    className="border-primary/20 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sair
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link href="/auth/login">
                                    <Button variant="outline" className="border-primary/30">
                                        Entrar
                                    </Button>
                                </Link>
                                <Link href="/auth/register">
                                    <Button className="glow-orange bg-secondary hover:bg-secondary/90 text-white">
                                        Junte-se
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="md:hidden p-2 rounded-lg bg-primary/20 hover:bg-primary/30 transition-colors"
                    >
                        {menuOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="md:hidden pb-4 animate-transform bg-card/95 backdrop-blur-md rounded-b-lg border-b border-primary/20 shadow-lg absolute left-0 right-0 px-4 top-20">
                        <nav className="flex flex-col gap-4 py-4">
                            <Link href="/#sobre" className="text-foreground hover:text-primary transition-colors font-semibold" onClick={() => setMenuOpen(false)}>
                                Sobre
                            </Link>
                            <Link href="/#profissionais" className="text-foreground hover:text-primary transition-colors font-semibold" onClick={() => setMenuOpen(false)}>
                                Profissionais
                            </Link>
                            <Link href="/rota-do-valente" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                                <Shield className="w-4 h-4 text-secondary" />
                                Rota do Valente
                            </Link>
                            {user && (
                                <Link href="/elo-da-rota" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                                    <Users className="w-4 h-4 text-purple-500" />
                                    Elo da Rota
                                </Link>
                            )}
                            <Link href="/na-rota" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                                <Flame className="w-4 h-4 text-orange-500" />
                                Na Rota
                            </Link>
                            <Link href="/projects/create" className="text-foreground hover:text-primary transition-colors font-semibold flex items-center gap-2" onClick={() => setMenuOpen(false)}>
                                <Briefcase className="w-4 h-4" />
                                Lançar Projeto
                            </Link>
                            <Link href="/#eventos" className="text-foreground hover:text-primary transition-colors font-semibold" onClick={() => setMenuOpen(false)}>
                                Eventos
                            </Link>
                            <Link href="/#depoimentos" className="text-foreground hover:text-primary transition-colors font-semibold" onClick={() => setMenuOpen(false)}>
                                Depoimentos
                            </Link>
                            <Link href="/#planos" className="text-foreground hover:text-primary transition-colors font-semibold" onClick={() => setMenuOpen(false)}>
                                Planos
                            </Link>
                            {!user && (
                                <>
                                    <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
                                        <Button variant="outline" className="w-full border-primary/30">
                                            Entrar
                                        </Button>
                                    </Link>
                                    <Link href="/auth/register" onClick={() => setMenuOpen(false)}>
                                        <Button className="w-full glow-orange bg-secondary hover:bg-secondary/90 text-white">
                                            Junte-se
                                        </Button>
                                    </Link>
                                </>
                            )}
                            {user && (
                                <div className="flex flex-col gap-2 pt-2 border-t border-primary/10">
                                    <Link href="/dashboard" onClick={() => setMenuOpen(false)}>
                                        <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                                    </Link>
                                    <Button variant="outline" onClick={handleSignOut} className="w-full justify-start text-destructive border-destructive/20 hover:bg-destructive/10">
                                        <LogOut className="w-4 h-4 mr-2" /> Sair
                                    </Button>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    )
}
