'use client'

/**
 * Photo processing utilities for handling image uploads
 * Extracted from photo-upload page for reusability
 */

export interface PhotoProcessingOptions {
  maxSize?: number // in pixels, default 400
  quality?: number // 0-1, default 0.8
  maxFileSize?: number // in MB, default 5
}

export interface PhotoProcessingResult {
  base64Data: string
  error?: string
}

export interface PhotoUploadResult {
  originalBase64: string
  needsCropping: boolean
  error?: string
}

/**
 * Validate if a file is a valid image
 */
export function validateImageFile(file: File, maxFileSize: number = 5): { isValid: boolean; error?: string } {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select an image file (JPEG, PNG, etc.)' }
  }

  // Check file size (max 5MB by default)
  const maxSizeBytes = maxFileSize * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return { isValid: false, error: `Image file size must be less than ${maxFileSize}MB` }
  }

  return { isValid: true }
}

/**
 * Process and compress an image file to base64
 */
export function processImageToBase64(
  file: File, 
  options: PhotoProcessingOptions = {}
): Promise<PhotoProcessingResult> {
  const { maxSize = 400, quality = 0.8, maxFileSize = 5 } = options

  return new Promise((resolve) => {
    // First validate the file
    const validation = validateImageFile(file, maxFileSize)
    if (!validation.isValid) {
      resolve({ base64Data: '', error: validation.error })
      return
    }

    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        try {
          // Create canvas to resize image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            resolve({ base64Data: '', error: 'Could not get canvas context' })
            return
          }

          // Calculate new dimensions (maintain aspect ratio)
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress image
          ctx.drawImage(img, 0, 0, width, height)
          
          // Convert to base64 with compression
          const base64 = canvas.toDataURL('image/jpeg', quality)
          resolve({ base64Data: base64 })
        } catch (error) {
          resolve({ base64Data: '', error: 'Failed to process image' })
        }
      }
      
      img.onerror = () => resolve({ base64Data: '', error: 'Failed to load image' })
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => resolve({ base64Data: '', error: 'Failed to read file' })
    reader.readAsDataURL(file)
  })
}

/**
 * Handle file selection and initial processing (before cropping)
 * Returns the original image for crop selection
 */
export async function handlePhotoUpload(
  file: File,
  options?: PhotoProcessingOptions
): Promise<PhotoUploadResult> {
  const { maxFileSize = 5 } = options || {}

  // First validate the file
  const validation = validateImageFile(file, maxFileSize)
  if (!validation.isValid) {
    return { originalBase64: '', needsCropping: false, error: validation.error }
  }

  return new Promise((resolve) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        try {
          // For crop selection, we want the original image (but potentially resized for performance)
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            resolve({ originalBase64: '', needsCropping: false, error: 'Could not get canvas context' })
            return
          }

          // Resize for performance if image is very large, but maintain aspect ratio
          const maxDisplaySize = 800
          let { width, height } = img
          
          if (width > maxDisplaySize || height > maxDisplaySize) {
            const ratio = Math.min(maxDisplaySize / width, maxDisplaySize / height)
            width = width * ratio
            height = height * ratio
          }

          canvas.width = width
          canvas.height = height
          ctx.drawImage(img, 0, 0, width, height)
          
          const originalBase64 = canvas.toDataURL('image/jpeg', 0.9) // Higher quality for crop selection
          resolve({ originalBase64, needsCropping: true })
        } catch (error) {
          resolve({ originalBase64: '', needsCropping: false, error: 'Failed to process image' })
        }
      }
      
      img.onerror = () => resolve({ originalBase64: '', needsCropping: false, error: 'Failed to load image' })
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => resolve({ originalBase64: '', needsCropping: false, error: 'Failed to read file' })
    reader.readAsDataURL(file)
  })
}

/**
 * Handle file selection and processing (legacy function for backward compatibility)
 * This now goes through the crop flow
 */
export async function handlePhotoSelection(
  file: File,
  options?: PhotoProcessingOptions
): Promise<PhotoProcessingResult> {
  // For backward compatibility, this function processes directly without cropping
  return await processImageToBase64(file, options)
}

