import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata: Metadata = {
    title: "Rota Business Club - O Acampamento Base do Homem de Negócios",
    description: "Infraestrutura de apoio, estratégia e alianças para sua escalada.",
};

import { BrandingProvider } from "@/lib/branding/context";
import { AuthProvider } from "@/lib/auth/context";
import { Header } from "@/components/layout/header";
import { ChatWidget } from "@/components/chat/chat-widget";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR">
            <body className={`${inter.variable} font-sans antialiased`}>
                <AuthProvider>
                    <BrandingProvider>
                        <Header />
                        {children}
                        <ChatWidget />
                    </BrandingProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
