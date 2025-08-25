'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { Camera, Upload, Edit3, Loader2 } from 'lucide-react'

import { saveOnboardingData, getOnboardingData } from '@/lib/onboarding/storage'
import { handlePhotoUpload } from '@/lib/photo-utils'
import { PhotoCropSelector } from '@/components/photo-crop-selector'

export default function PhotoUploadPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [role, setRole] = useState<string>('')
  const [photoData, setPhotoData] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [showCropSelector, setShowCropSelector] = useState(false)
  const [originalPhotoForCrop, setOriginalPhotoForCrop] = useState<string>('')

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

  const handleFileSelect = async (file: File) => {
    setError('')
    setIsLoading(true)

    try {
      const result = await handlePhotoUpload(file)
      if (result.error) {
        setError(result.error)
        return
      }

      if (result.needsCropping) {
        // Show crop selector
        setOriginalPhotoForCrop(result.originalBase64)
        setShowCropSelector(true)
      }
    } catch (err) {
      setError('Failed to process image. Please try again.')
      console.error('Image processing error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCropComplete = (croppedBase64: string) => {
    setPhotoData(croppedBase64)
    setPreviewUrl(croppedBase64)
    setShowCropSelector(false)
    setOriginalPhotoForCrop('')
  }

  const handleCropCancel = () => {
    setShowCropSelector(false)
    setOriginalPhotoForCrop('')
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }



  // handleRemovePhoto function removed as it's not used

  const handleContinue = async () => {
    setIsLoading(true)

    try {
      // Save photo data to local storage
      saveOnboardingData({
        photo: photoData || undefined
      })

      // Determine next step based on role
      if (role === 'staff') {
        // Staff skip company selection
        router.push('/personality-assessments')
      } else {
        // Students and student leaders go to company selection
        router.push('/company-selection')
      }
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
    if (role === 'staff') {
      router.push('/personality-assessments')
    } else {
      router.push('/company-selection')
    }
  }

  // Show crop selector if needed
  if (showCropSelector && originalPhotoForCrop) {
    return (
      <div className="space-y-6">
        <PhotoCropSelector
          imageBase64={originalPhotoForCrop}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isProcessing={isLoading}
        />
      </div>
    )
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

          {/* Photo Preview */}
          {previewUrl && (
            <div className="flex justify-center">
              <div className="relative">
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover border-4 border-secondary/20"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="absolute -top-2 -right-2 w-8 h-8 rounded-full p-0 bg-background/80 backdrop-blur-sm border-2 hover:bg-background/90"
                  onClick={() => fileInputRef.current?.click()}
                  title="Change photo"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>

            </div>
          )}

          {/* Upload Area */}
          {!previewUrl && (
            <div className="border-2 border-dashed rounded-lg p-8 text-center transition-colors border-muted-foreground/25">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-muted rounded-full">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-lg font-medium">
                    Choose a photo for your profile
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