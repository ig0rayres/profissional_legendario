'use client'

import { DashboardBackground } from '@/components/dashboard/dashboard-background'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="relative min-h-screen">
            <DashboardBackground />
            {children}
        </div>
    )
}
