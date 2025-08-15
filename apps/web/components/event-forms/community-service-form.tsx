'use client'

import { useState } from "react"
import { Button } from "@acu-apex/ui"
import { Input } from "@acu-apex/ui"
import { Label } from "@acu-apex/ui"
import { Textarea } from "@acu-apex/ui"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { processPhotosForSubmission } from "@acu-apex/utils"
import { CommunityServiceSubmissionSchema, type CommunityServiceSubmission } from "@acu-apex/types"
import { z } from "zod"

interface CommunityServiceFormProps {
  onSubmit: (data: CommunityServiceSubmission) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function CommunityServiceForm({ onSubmit, onCancel, isSubmitting = false }: CommunityServiceFormProps) {
  const [formData, setFormData] = useState<Partial<CommunityServiceSubmission>>({
    submission_type: 'community_service',
    hours: 0,
    organization: '',
    supervisor_name: '',
    supervisor_contact: '',
    description: '',
    date_of_service: '',
    photos: [],
    notes: ''
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [photoErrors, setPhotoErrors] = useState<string[]>([])

  const handleInputChange = (field: keyof CommunityServiceSubmission, value: string | number | string[]) => {
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
      const validatedData = CommunityServiceSubmissionSchema.parse(formData)
      await onSubmit(validatedData)
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors with proper typing
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: z.ZodIssue) => {
          const field = err.path.join('.')
          newErrors[field] = err.message
        })
        setErrors(newErrors)
      } else if (error instanceof Error) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: 'An unexpected error occurred' })
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Hours */}
        <div className="space-y-2">
          <Label htmlFor="hours">Hours Served *</Label>
          <Input
            id="hours"
            type="number"
            min="0"
            max="24"
            step="0.5"
            value={formData.hours}
            onChange={(e) => handleInputChange('hours', parseFloat(e.target.value) || 0)}
            placeholder="8.5"
            required
          />
          {errors.hours && <p className="text-sm text-destructive">{errors.hours}</p>}
        </div>

        {/* Date of Service */}
        <div className="space-y-2">
          <Label htmlFor="date_of_service">Date of Service *</Label>
          <Input
            id="date_of_service"
            type="date"
            value={formData.date_of_service}
            onChange={(e) => handleInputChange('date_of_service', e.target.value)}
            required
          />
          {errors.date_of_service && <p className="text-sm text-destructive">{errors.date_of_service}</p>}
        </div>
      </div>

      {/* Organization */}
      <div className="space-y-2">
        <Label htmlFor="organization">Organization *</Label>
        <Input
          id="organization"
          value={formData.organization}
          onChange={(e) => handleInputChange('organization', e.target.value)}
          placeholder="Local Food Bank"
          required
        />
        {errors.organization && <p className="text-sm text-destructive">{errors.organization}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Supervisor Name */}
        <div className="space-y-2">
          <Label htmlFor="supervisor_name">Supervisor Name *</Label>
          <Input
            id="supervisor_name"
            value={formData.supervisor_name}
            onChange={(e) => handleInputChange('supervisor_name', e.target.value)}
            placeholder="Jane Smith"
            required
          />
          {errors.supervisor_name && <p className="text-sm text-destructive">{errors.supervisor_name}</p>}
        </div>

        {/* Supervisor Contact */}
        <div className="space-y-2">
          <Label htmlFor="supervisor_contact">Supervisor Email *</Label>
          <Input
            id="supervisor_contact"
            type="email"
            value={formData.supervisor_contact}
            onChange={(e) => handleInputChange('supervisor_contact', e.target.value)}
            placeholder="jane.smith@organization.org"
            required
          />
          {errors.supervisor_contact && <p className="text-sm text-destructive">{errors.supervisor_contact}</p>}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description of Service *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe what you did during your community service..."
          rows={3}
          required
        />
        <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
      </div>

      {/* Photo Upload */}
      <div className="space-y-3">
        <Label>Photo Evidence (Optional)</Label>
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
                <Image
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  width={80}
                  height={80}
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
          placeholder="Any additional information..."
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