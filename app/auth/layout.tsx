'use client'

import { useBranding } from '@/lib/branding/context'
import Image from 'next/image'
import { RotabusinessLogo } from '@/components/branding/logo'

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { branding } = useBranding()

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-white">
            {/* Dynamic Background */}
            {branding?.auth_background_url ? (
                <div className="absolute inset-0 z-0">
                    <Image
                        src={branding.auth_background_url}
                        alt="Background"
                        fill
                        className="object-cover opacity-30"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/50 to-background/80 backdrop-blur-sm" />
                </div>
            ) : (
                <>
                    {/* Light outdoor gradient - base camp feel */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white via-adventure/20 to-white" />

                    {/* Subtle warm glows */}
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-3xl opacity-50" />

                    {/* Subtle texture overlay */}
                    <div className="absolute inset-0 opacity-[0.03] texture-stone" />
                </>
            )}

            {/* Content */}
            <div className="relative z-10 w-full max-w-md animate-transform">
                {/* Logo - subtle presence */}
                <div className="flex justify-center mb-8">
                    {branding?.logo_url ? (
                        <div className="relative w-48 h-16">
                            <Image
                                src={branding.logo_url}
                                alt="Rota Business Club"
                                fill
                                className="object-contain drop-shadow-lg"
                                priority
                            />
                        </div>
                    ) : (
                        <div>
                            <RotabusinessLogo className="drop-shadow-sm" size={50} />
                        </div>
                    )}
                </div>

                {/* Tagline - grounded and strong */}
                <div className="text-center mb-6">
                    <p className="text-primary text-sm font-bold tracking-wider uppercase">
                        Amor, Honra e Unidade
                    </p>
                </div>

                {children}
            </div>
        </div>
    )
}
