'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Button } from '@acu-apex/ui'
import { Loader2 } from 'lucide-react'
import type { CropArea } from '@/lib/photo-crop-utils'
import { getOptimalCropArea, validateCropArea, applyCropToImage } from '@/lib/photo-crop-utils'

interface PhotoCropSelectorProps {
  imageBase64: string
  onCropComplete: (croppedBase64: string) => void
  onCancel: () => void
  isProcessing?: boolean
}

export function PhotoCropSelector({ 
  imageBase64, 
  onCropComplete, 
  onCancel, 
  isProcessing = false 
}: PhotoCropSelectorProps) {
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0.5, y: 0.5, size: 0.8 })
  const [isDragging, setIsDragging] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  // Initialize optimal crop area when image loads
  useEffect(() => {
    if (imageLoaded && imageDimensions.width > 0 && imageDimensions.height > 0) {
      const optimal = getOptimalCropArea(imageDimensions.width, imageDimensions.height)
      setCropArea(optimal)
    }
  }, [imageLoaded, imageDimensions])

  const handleImageLoad = () => {
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight
      })
      setImageLoaded(true)
    }
  }

  const getRelativePosition = (clientX: number, clientY: number) => {
    if (!containerRef.current || !imageRef.current) return { x: 0.5, y: 0.5 }

    const imageRect = imageRef.current.getBoundingClientRect()
    
    // Calculate position relative to the actual image (not container)
    const x = (clientX - imageRect.left) / imageRect.width
    const y = (clientY - imageRect.top) / imageRect.height
    
    return { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const pos = getRelativePosition(e.clientX, e.clientY)
    const newCropArea = { ...cropArea, x: pos.x, y: pos.y }
    const validated = validateCropArea(newCropArea, imageDimensions.width, imageDimensions.height)
    setCropArea(validated)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    
    const pos = getRelativePosition(e.clientX, e.clientY)
    const newCropArea = { ...cropArea, x: pos.x, y: pos.y }
    const validated = validateCropArea(newCropArea, imageDimensions.width, imageDimensions.height)
    setCropArea(validated)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    
    const touch = e.touches[0]
    const pos = getRelativePosition(touch.clientX, touch.clientY)
    const newCropArea = { ...cropArea, x: pos.x, y: pos.y }
    const validated = validateCropArea(newCropArea, imageDimensions.width, imageDimensions.height)
    setCropArea(validated)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()
    
    const touch = e.touches[0]
    const pos = getRelativePosition(touch.clientX, touch.clientY)
    const newCropArea = { ...cropArea, x: pos.x, y: pos.y }
    const validated = validateCropArea(newCropArea, imageDimensions.width, imageDimensions.height)
    setCropArea(validated)
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  const handleCropConfirm = async () => {
    try {
      const result = await applyCropToImage(imageBase64, cropArea)
      if (result.error) {
        console.error('Crop error:', result.error)
        return
      }
      onCropComplete(result.croppedBase64)
    } catch (error) {
      console.error('Failed to apply crop:', error)
    }
  }

  // Calculate crop circle position and size for display
  const getCropCircleStyle = () => {
    if (!imageRef.current) return {}
    
    const imageRect = imageRef.current.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    
    if (!containerRect) return {}
    
    // Calculate the size of the crop circle relative to the displayed image
    const minImageDimension = Math.min(imageRect.width, imageRect.height)
    const circleSize = cropArea.size * minImageDimension
    
    // Position relative to the container
    const left = imageRect.left - containerRect.left + (cropArea.x * imageRect.width) - (circleSize / 2)
    const top = imageRect.top - containerRect.top + (cropArea.y * imageRect.height) - (circleSize / 2)
    
    return {
      position: 'absolute' as const,
      left: `${left}px`,
      top: `${top}px`,
      width: `${circleSize}px`,
      height: `${circleSize}px`,
      border: '3px solid #3b82f6',
      borderRadius: '50%',
      pointerEvents: 'none' as const,
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
      zIndex: 10,
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Adjust Your Photo</h3>
        <p className="text-sm text-muted-foreground">
          Drag to position your photo within the circle
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative bg-gray-100 rounded-lg overflow-hidden touch-none"
        style={{ minHeight: '300px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          ref={imageRef}
          src={imageBase64}
          alt="Photo to crop"
          width={800}
          height={400}
          className="w-full h-auto max-h-[400px] object-contain cursor-move"
          onLoad={handleImageLoad}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          draggable={false}
          unoptimized
        />
        
        {imageLoaded && (
          <div style={getCropCircleStyle()} />
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancel
        </Button>
        
        <Button 
          onClick={handleCropConfirm}
          disabled={!imageLoaded || isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Use This Photo'
          )}
        </Button>
      </div>
    </div>
  )
}
