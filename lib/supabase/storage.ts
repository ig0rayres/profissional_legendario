import { createClient } from '@/lib/supabase/client'
import { awardPoints, awardBadge, getUserBadges } from '@/lib/api/gamification'
import { getActionPoints } from '@/lib/services/point-actions-service'

export interface UploadResult {
    url: string
    path: string
    error?: string
}

/**
 * Upload avatar image to Supabase Storage
 */
export async function uploadAvatar(
    userId: string,
    file: File
): Promise<UploadResult> {
    try {
        const supabase = createClient()

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { url: '', path: '', error: 'File must be an image' }
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return { url: '', path: '', error: 'File size must be less than 5MB' }
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const fileName = `${userId}/avatar.${fileExt}`

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, file, {
                upsert: true,
                contentType: file.type,
            })

        if (uploadError) {
            return { url: '', path: '', error: uploadError.message }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName)

        // Update profile with avatar URL
        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                avatar_url: publicUrl,
                avatar_storage_path: fileName,
            })
            .eq('id', userId)

        if (updateError) {
            return { url: '', path: '', error: updateError.message }
        }

        return { url: publicUrl, path: fileName }
    } catch (error) {
        return {
            url: '',
            path: '',
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Upload portfolio image to Supabase Storage
 */
export async function uploadPortfolioImage(
    userId: string,
    file: File
): Promise<UploadResult> {
    try {
        const supabase = createClient()

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return { url: '', path: '', error: 'File must be an image' }
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return { url: '', path: '', error: 'File size must be less than 10MB' }
        }

        // Create unique filename
        const fileExt = file.name.split('.').pop()
        const timestamp = Date.now()
        const fileName = `${userId}/${timestamp}.${fileExt}`

        // Upload to storage
        const { error: uploadError } = await supabase.storage
            .from('portfolio')
            .upload(fileName, file, {
                contentType: file.type,
            })

        if (uploadError) {
            return { url: '', path: '', error: uploadError.message }
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('portfolio')
            .getPublicUrl(fileName)

        // 🎮 GAMIFICATION: Award points for portfolio upload
        try {
            // Check if this is the first portfolio image
            const userBadges = await getUserBadges(userId)
            const hasPortfolioBadge = userBadges.some(b => b.badge_id === 'cinegrafista_campo')

            if (!hasPortfolioBadge) {
                // First portfolio upload! Award badge and points
                await awardBadge(userId, 'cinegrafista_campo')
                console.log('✅ Awarded Cinegrafista de Campo badge to user:', userId)
            } else {
                // Award points for additional uploads (within daily limit)
                const points = await getActionPoints('portfolio_upload')
                await awardPoints(userId, points, 'portfolio_upload', 'Portfolio image uploaded')
            }
        } catch (gamifError) {
            // Don't fail the upload if gamification fails
            console.error('Gamification error (non-critical):', gamifError)
        }

        return { url: publicUrl, path: fileName }
    } catch (error) {
        return {
            url: '',
            path: '',
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteFile(
    bucket: 'avatars' | 'portfolio',
    path: string
): Promise<{ error?: string }> {
    try {
        const supabase = createClient()

        const { error } = await supabase.storage
            .from(bucket)
            .remove([path])

        if (error) {
            return { error: error.message }
        }

        return {}
    } catch (error) {
        return {
            error: error instanceof Error ? error.message : 'Unknown error'
        }
    }
}

/**
 * Compress image before upload (client-side)
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)

        reader.onload = (event) => {
            const img = new Image()
            img.src = event.target?.result as string

            img.onload = () => {
                const canvas = document.createElement('canvas')
                let width = img.width
                let height = img.height

                // Calculate new dimensions
                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx?.drawImage(img, 0, 0, width, height)

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const compressedFile = new File([blob], file.name, {
                                type: file.type,
                                lastModified: Date.now(),
                            })
                            resolve(compressedFile)
                        } else {
                            reject(new Error('Canvas to Blob conversion failed'))
                        }
                    },
                    file.type,
                    quality
                )
            }

            img.onerror = () => reject(new Error('Image load failed'))
        }

        reader.onerror = () => reject(new Error('FileReader failed'))
    })
}
