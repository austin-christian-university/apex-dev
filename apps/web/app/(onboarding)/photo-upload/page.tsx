'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Badge } from '@acu-apex/ui'
import { Camera, Upload, X, User, Loader2 } from 'lucide-react'
import { cn } from '@acu-apex/utils'
import { saveOnboardingData, getOnboardingData } from '@/lib/onboarding/storage'

export default function PhotoUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<string>('')
  const [photoData, setPhotoData] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    // Check if user should be on this page
    const onboardingData = getOnboardingData()
    
    if (!onboardingData.role) {
      router.push('/role-selection')
      return
    }

    if (!onboardingData.first_name || !onboardingData.last_name) {
      router.push('/personal-info')
      return
    }

    setRole(onboardingData.role)

    // Load existing photo data
    if (onboardingData.photo) {
      setPhotoData(onboardingData.photo)
      setPreviewUrl(onboardingData.photo)
    }
  }, [router])

  const validateFile = (file: File): boolean => {
    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPEG, PNG, etc.)')
      return false
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError('Image file size must be less than 5MB')
      return false
    }

    return true
  }

  const processImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas to resize image
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Calculate new dimensions (max 400x400)
          const maxSize = 400
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
          const base64 = canvas.toDataURL('image/jpeg', 0.8)
          resolve(base64)
        }
        
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (file: File) => {
    setError('')
    
    if (!validateFile(file)) {
      return
    }

    setIsLoading(true)

    try {
      const base64Data = await processImage(file)
      setPhotoData(base64Data)
      setPreviewUrl(base64Data)
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error('Image processing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemovePhoto = () => {
    setPhotoData('')
    setPreviewUrl('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleContinue = async () => {
    setIsLoading(true)

    try {
      // Save photo data to local storage
      saveOnboardingData({
        photo: photoData || undefined
      })

      // Determine next step based on role
      let nextStep: string
      if (role === 'staff') {
        // Staff skip company selection
        nextStep = '/personality-assessments'
      } else {
        // Students and student leaders go to company selection
        nextStep = '/company-selection'
      }

      router.push(nextStep)
    } catch (error) {
      console.error('Failed to save photo data:', error)
      setError('Failed to save photo. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    router.push('/personal-info')
  }

  const handleSkip = () => {
    // Allow users to skip photo upload
    saveOnboardingData({
      photo: undefined
    })
    
    // Determine next step based on role
    let nextStep: string
    if (role === 'staff') {
      nextStep = '/personality-assessments'
    } else {
      nextStep = '/company-selection'
    }

    router.push(nextStep)
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-secondary/10 rounded-full">
            <Camera className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Profile Photo</h1>
        <p className="text-lg text-muted-foreground">
          Upload a photo for your profile (optional)
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Upload Your Photo</CardTitle>
          <CardDescription>
            Choose a clear, professional photo. This will be used for your profile and company identification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-secondary/20"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0"
                  onClick={handleRemovePhoto}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!previewUrl && (
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                dragActive 
                  ? "border-secondary bg-secondary/5" 
                  : "border-muted-foreground/25 hover:border-secondary/50"
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    {dragActive ? 'Drop your photo here' : 'Drag and drop your photo here'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    or click to browse files
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Choose Photo
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Guidelines */}
          <div className="space-y-3">
            <h3 className="font-medium">Photo Guidelines</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use a clear, professional headshot</li>
              <li>• Good lighting and neutral background</li>
              <li>• File size: Maximum 5MB</li>
              <li>• Formats: JPEG, PNG, GIF</li>
              <li>• Image will be automatically resized to 400x400px</li>
            </ul>
          </div>

          {/* Privacy Note */}
          <Alert>
            <User className="h-4 w-4" />
            <AlertDescription>
              Your photo will only be visible to your company members and program administrators. 
              It helps with identification and building community within your company.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleGoBack}>
          Back
        </Button>
        
        <div className="space-x-3">
          <Button variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button 
            onClick={handleContinue}
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Continue'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
} 