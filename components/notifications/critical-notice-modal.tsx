'use client'

import React, { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { MOCK_NOTIFICATIONS, Notification } from '@/lib/data/mock'

export function CriticalNoticeModal() {
    const [criticalNotice, setCriticalNotice] = useState<Notification | null>(null)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // Check for unread critical notifications on load
        const critical = MOCK_NOTIFICATIONS.find(n => n.priority === 'critical' && !n.read_at)
        if (critical) {
            setCriticalNotice(critical)
            setIsOpen(true)
        }
    }, [])

    const handleAcknowledge = () => {
        // In a real app, this would call the API to mark as read
        setIsOpen(false)
        setCriticalNotice(null)
    }

    if (!criticalNotice) return null

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px] glass-strong border-red-500/30 p-0 overflow-hidden shadow-2xl shadow-red-500/10">
                <div className="bg-red-500/10 p-8 flex flex-col items-center text-center border-b border-red-500/20">
                    <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mb-6 animate-pulse">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <DialogHeader className="space-y-2">
                        <div className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-2">Comunicação Crítica</div>
                        <DialogTitle className="text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                            {criticalNotice.title}
                        </DialogTitle>
                    </DialogHeader>
                </div>

                <div className="p-8 pb-10">
                    <DialogDescription className="text-lg text-slate-300 font-medium leading-relaxed text-center mb-8">
                        {criticalNotice.body}
                    </DialogDescription>

                    <DialogFooter className="sm:justify-center">
                        <Button
                            variant="destructive"
                            size="lg"
                            onClick={handleAcknowledge}
                            className="h-14 px-12 text-sm font-black uppercase tracking-widest glow-red group"
                        >
                            <CheckCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                            Compreendido e Ciente
                        </Button>
                    </DialogFooter>

                    <p className="text-[10px] text-center text-slate-500 mt-6 font-bold uppercase tracking-widest opacity-50">
                        O conteúdo acima exige sua ciência obrigatória para prosseguir.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
