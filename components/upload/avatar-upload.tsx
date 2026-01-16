'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, User } from 'lucide-react'
import { uploadAvatar, compressImage } from '@/lib/supabase/storage'
import { Button } from '@/components/ui/button'

interface AvatarUploadProps {
    userId: string
    currentAvatarUrl?: string
    onUploadComplete?: (url: string) => void
}

export function AvatarUpload({ userId, currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
    const [preview, setPreview] = useState<string | null>(currentAvatarUrl || null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0]
        if (!file) return

        setError(null)
        setUploading(true)

        try {
            // Create preview
            const objectUrl = URL.createObjectURL(file)
            setPreview(objectUrl)

            // Compress image
            const compressedFile = await compressImage(file, 500, 0.9)

            // Upload to Supabase
            const result = await uploadAvatar(userId, compressedFile)

            if (result.error) {
                setError(result.error)
                setPreview(currentAvatarUrl || null)
            } else {
                onUploadComplete?.(result.url)
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Upload failed')
            setPreview(currentAvatarUrl || null)
        } finally {
            setUploading(false)
        }
    }, [userId, currentAvatarUrl, onUploadComplete])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
        },
        maxFiles: 1,
        maxSize: 5 * 1024 * 1024, // 5MB
    })

    const clearPreview = () => {
        setPreview(currentAvatarUrl || null)
        setError(null)
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                {...getRootProps()}
                className={`
          relative w-32 h-32 rounded-full overflow-hidden border-2 border-dashed
          transition-all cursor-pointer group
          ${isDragActive ? 'border-violet-500 bg-violet-500/10' : 'border-gray-700 hover:border-violet-500'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
            >
                <input {...getInputProps()} disabled={uploading} />

                {preview ? (
                    <img
                        src={preview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <User className="w-12 h-12 text-gray-600" />
                    </div>
                )}

                <div className={`
          absolute inset-0 bg-black/60 flex items-center justify-center
          transition-opacity
          ${isDragActive || uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}>
                    {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
                    ) : (
                        <Upload className="w-8 h-8 text-white" />
                    )}
                </div>
            </div>

            <div className="text-center">
                <p className="text-sm text-gray-400">
                    {isDragActive ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG ou WEBP (máx. 5MB)
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
                    <X className="w-4 h-4" />
                    <span>{error}</span>
                    <button onClick={clearPreview} className="ml-2 underline">
                        Tentar novamente
                    </button>
                </div>
            )}
        </div>
    )
}
