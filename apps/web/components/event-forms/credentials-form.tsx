'use client'

import { useState } from "react"
import { Button } from "@acu-apex/ui"
import { Input } from "@acu-apex/ui"
import { Label } from "@acu-apex/ui"
import { Textarea } from "@acu-apex/ui"
import { Upload, X } from "lucide-react"
import { processPhotosForSubmission } from "@acu-apex/utils"
import { CredentialsSubmissionSchema, type CredentialsSubmission } from "@acu-apex/types"

interface CredentialsFormProps {
  onSubmit: (data: CredentialsSubmission) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CredentialsForm({ onSubmit, onCancel, isSubmitting = false }: CredentialsFormProps) {
  const [formData, setFormData] = useState<Partial<CredentialsSubmission>>({
    submission_type: 'credentials',
    credential_name: '',
    granting_organization: '',
    description: '',
    date_of_credential: '',
    photos: [],
    notes: ''
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoErrors, setPhotoErrors] = useState<string[]>([])

  const handleInputChange = (field: keyof CredentialsSubmission, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    try {
      const { photos: newPhotos, errors: uploadErrors } = await processPhotosForSubmission(files)
      
      if (uploadErrors.length > 0) {
        setPhotoErrors(uploadErrors)
      } else {
        setPhotoErrors([])
      }
      
      // Limit to 5 photos total
      const totalPhotos = [...photos, ...newPhotos]
      if (totalPhotos.length > 5) {
        setPhotoErrors(['Maximum 5 photos allowed'])
        return
      }
      
      setPhotos(totalPhotos)
      setFormData(prev => ({
        ...prev,
        photos: totalPhotos
      }))
    } catch (error) {
      console.error('Photo upload error:', error)
      setPhotoErrors(['Failed to process photos'])
    }
  }

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    setPhotos(newPhotos)
    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Validate the form data
      const validatedData = CredentialsSubmissionSchema.parse(formData)
      await onSubmit(validatedData)
    } catch (error) {
      if (error instanceof Error) {
        // Handle Zod validation errors
        const zodError = error as any
        if (zodError.errors) {
          const newErrors: Record<string, string> = {}
          zodError.errors.forEach((err: any) => {
            const field = err.path.join('.')
            newErrors[field] = err.message
          })
          setErrors(newErrors)
        } else {
          setErrors({ general: error.message })
        }
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Credential Name */}
        <div className="space-y-2">
          <Label htmlFor="credential_name">Credential Name *</Label>
          <Input
            id="credential_name"
            value={formData.credential_name}
            onChange={(e) => handleInputChange('credential_name', e.target.value)}
            placeholder="AWS Certified Developer"
            required
          />
          {errors.credential_name && <p className="text-sm text-destructive">{errors.credential_name}</p>}
        </div>

        {/* Date of Credential */}
        <div className="space-y-2">
          <Label htmlFor="date_of_credential">Date Received *</Label>
          <Input
            id="date_of_credential"
            type="date"
            value={formData.date_of_credential}
            onChange={(e) => handleInputChange('date_of_credential', e.target.value)}
            required
          />
          {errors.date_of_credential && <p className="text-sm text-destructive">{errors.date_of_credential}</p>}
        </div>
      </div>

      {/* Granting Organization */}
      <div className="space-y-2">
        <Label htmlFor="granting_organization">Granting Organization *</Label>
        <Input
          id="granting_organization"
          value={formData.granting_organization}
          onChange={(e) => handleInputChange('granting_organization', e.target.value)}
          placeholder="Amazon Web Services"
          required
        />
        {errors.granting_organization && <p className="text-sm text-destructive">{errors.granting_organization}</p>}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe what this credential represents, skills gained, or achievements..."
          rows={3}
        />
        <p className="text-xs text-muted-foreground">Describe the significance of this credential</p>
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      {/* Photo Upload */}
      <div className="space-y-3">
        <Label>Photo Evidence (Optional)</Label>
        <p className="text-xs text-muted-foreground">
          Upload photos of certificates, licenses, diplomas, or other credential documentation
        </p>
        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
          <input
            type="file"
            id="photo-upload"
            accept="image/*"
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <label htmlFor="photo-upload" className="cursor-pointer">
            <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-1">
              Click to upload photos or take new ones
            </p>
            <p className="text-xs text-muted-foreground">
              Max 5 photos • JPG, PNG, WebP • Max 5MB each
            </p>
          </label>
        </div>

        {/* Photo Preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {photoErrors.length > 0 && (
          <div className="space-y-1">
            {photoErrors.map((error, index) => (
              <p key={index} className="text-sm text-destructive">{error}</p>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Additional Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any additional information about this credential..."
          rows={2}
        />
      </div>

      {/* General Errors */}
      {errors.general && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm text-destructive">{errors.general}</p>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </Button>
      </div>
    </form>
  )
}