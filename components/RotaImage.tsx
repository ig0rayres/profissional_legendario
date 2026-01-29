import Image from 'next/image'

interface RotaImageProps {
    src: string
    alt: string
    className?: string
    priority?: boolean
    fill?: boolean
    width?: number
    height?: number
    blurWatermark?: boolean
}

export default function RotaImage({
    src,
    alt,
    className = '',
    priority = false,
    fill = false,
    width,
    height,
    blurWatermark = true
}: RotaImageProps) {
    return (
        <div className={`relative overflow-hidden ${className}`}>
            <Image
                src={src}
                alt={alt}
                fill={fill}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                priority={priority}
                className="object-cover w-full h-full"
            />

            {/* Blur overlay no canto superior direito para cobrir marca d'água "Legendarios" */}
            {blurWatermark && (
                <>
                    <div className="absolute top-0 right-0 w-32 h-24 bg-gradient-to-bl from-black/30 via-black/10 to-transparent backdrop-blur-md" />
                    <div className="absolute bottom-0 left-0 w-48 h-20 bg-gradient-to-tr from-black/40 via-black/10 to-transparent backdrop-blur-sm" />
                </>
            )}
        </div>
    )
}
