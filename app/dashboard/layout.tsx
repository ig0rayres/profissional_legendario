import { DashboardBackground } from '@/components/dashboard/dashboard-background'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DashboardBackground />
            {children}
        </>
    )
}
