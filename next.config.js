/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                port: '',
                pathname: '/storage/v1/object/public/**',
            },
            {
                protocol: 'https',
                hostname: 'erzprkocwzgdjrsictps.supabase.co',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'api.dicebear.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
    typescript: {
        ignoreBuildErrors: false,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
    // Permitir acesso de dispositivos na rede local
    allowedDevOrigins: ['192.168.5.21'],
    // Excluir Edge Functions do Supabase (usam Deno, não Node)
    webpack: (config) => {
        config.watchOptions = {
            ...config.watchOptions,
            ignored: ['**/supabase/functions/**'],
        }
        return config
    },
}

module.exports = nextConfig
