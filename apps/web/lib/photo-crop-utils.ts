'use client'

/**
 * Photo cropping utilities for circular profile photo crops
 */

export interface CropArea {
  x: number // X position of crop center (0-1 relative to image)
  y: number // Y position of crop center (0-1 relative to image)
  size: number // Size of crop area (0-1 relative to smaller image dimension)
}

export interface CropResult {
  croppedBase64: string
  error?: string
}

/**
 * Apply circular crop to an image based on crop area selection
 */
export function applyCropToImage(
  imageBase64: string,
  cropArea: CropArea,
  outputSize: number = 400
): Promise<CropResult> {
  return new Promise((resolve) => {
    const img = new Image()
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          resolve({ croppedBase64: '', error: 'Could not get canvas context' })
          return
        }

        // Set output canvas size (square)
        canvas.width = outputSize
        canvas.height = outputSize

        // Calculate crop dimensions in pixels
        const minDimension = Math.min(img.width, img.height)
        const cropSizePixels = cropArea.size * minDimension
        const cropX = (cropArea.x * img.width) - (cropSizePixels / 2)
        const cropY = (cropArea.y * img.height) - (cropSizePixels / 2)

        // Create circular clipping path
        ctx.beginPath()
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2)
        ctx.clip()

        // Draw the cropped portion of the image
        ctx.drawImage(
          img,
          cropX, cropY, cropSizePixels, cropSizePixels, // Source rectangle
          0, 0, outputSize, outputSize // Destination rectangle
        )

        // Convert to base64
        const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8)
        resolve({ croppedBase64 })
      } catch (error) {
        resolve({ croppedBase64: '', error: 'Failed to crop image' })
      }
    }
    
    img.onerror = () => resolve({ croppedBase64: '', error: 'Failed to load image for cropping' })
    img.src = imageBase64
  })
}

/**
 * Get optimal initial crop area for an image (centered, largest possible circle)
 */
export function getOptimalCropArea(imageWidth: number, imageHeight: number): CropArea {
  // Center the crop
  const x = 0.5
  const y = 0.5
  
  // Use the largest possible circle that fits in the image
  const minDimension = Math.min(imageWidth, imageHeight)
  const maxDimension = Math.max(imageWidth, imageHeight)
  const size = minDimension / maxDimension
  
  return { x, y, size: Math.min(size, 0.8) } // Cap at 80% to leave some margin
}

/**
 * Validate crop area bounds
 */
export function validateCropArea(cropArea: CropArea, imageWidth: number, imageHeight: number): CropArea {
  const minDimension = Math.min(imageWidth, imageHeight)
  const cropSizePixels = cropArea.size * minDimension
  const halfCrop = cropSizePixels / 2
  
  // Ensure crop doesn't go outside image bounds
  const minX = halfCrop / imageWidth
  const maxX = 1 - (halfCrop / imageWidth)
  const minY = halfCrop / imageHeight
  const maxY = 1 - (halfCrop / imageHeight)
  
  return {
    x: Math.max(minX, Math.min(maxX, cropArea.x)),
    y: Math.max(minY, Math.min(maxY, cropArea.y)),
    size: cropArea.size
  }
}
