'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/auth-provider'
import { Card, CardContent } from '@acu-apex/ui'
import { Button } from '@acu-apex/ui'
import { Input } from '@acu-apex/ui'
import { Label } from '@acu-apex/ui'
import { Alert, AlertDescription } from '@acu-apex/ui'
import { User, AlertCircle, Loader2 } from 'lucide-react'
import { saveOnboardingData, getOnboardingData } from '@/lib/onboarding/storage'

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  date_of_birth: string
}

interface FormErrors {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
  date_of_birth?: string
}

export default function PersonalInfoPage() {
  const { supabaseUser } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    date_of_birth: ''
  })

  const [errors, setErrors] = useState<FormErrors>({})

  // Phone number formatting utility functions
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '')
    
    // Limit to 10 digits for US phone numbers
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    
    if (!match) return value
    
    const [, areaCode, exchange, number] = match
    
    if (number) {
      return `(${areaCode})-${exchange}-${number}`
    } else if (exchange) {
      return `(${areaCode})-${exchange}`
    } else if (areaCode) {
      return `(${areaCode}`
    } else {
      return ''
    }
  }

  const isValidPhoneNumber = (phone: string): boolean => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    // US phone numbers should have exactly 10 digits
    return cleaned.length === 10
  }

  useEffect(() => {
    // Load existing data from local storage and auth
    const onboardingData = getOnboardingData()
    
    if (!onboardingData.role) {
      // No role selected, redirect to role selection
      router.push('/role-selection')
      return
    }

    // Pre-populate form with existing data
    setFormData({
      first_name: onboardingData.first_name || '',
      last_name: onboardingData.last_name || '',
      email: onboardingData.email || supabaseUser?.email || '',
      phone_number: onboardingData.phone_number ? formatPhoneNumber(onboardingData.phone_number) : '',
      date_of_birth: onboardingData.date_of_birth || ''
    })
  }, [supabaseUser, router])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Required field validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required'
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required'
    } else if (!isValidPhoneNumber(formData.phone_number)) {
      newErrors.phone_number = 'Please enter a valid 10-digit phone number in format (XXX)-XXX-XXXX'
    }

    if (!formData.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Date of birth is required'
    } else {
      const birthDate = new Date(formData.date_of_birth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      
      if (age < 16 || age > 100) {
        newErrors.date_of_birth = 'Please enter a valid date of birth (age 16-100)'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    let processedValue = value
    
    // Special handling for phone number field
    if (field === 'phone_number') {
      processedValue = formatPhoneNumber(value)
    }
    
    setFormData(prev => ({ ...prev, [field]: processedValue }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleContinue = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      // Save personal info to local storage
      // Store phone number as digits only for consistent storage format
      const cleanPhoneNumber = formData.phone_number.replace(/\D/g, '')
      
      saveOnboardingData({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone_number: cleanPhoneNumber,
        date_of_birth: formData.date_of_birth.trim()
      })

      // All users go to photo upload next
      router.push('/photo-upload')
    } catch (error) {
      console.error('Failed to save personal info:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoBack = () => {
    const onboardingData = getOnboardingData()
    if (onboardingData.role === 'student') {
      router.push('/role-selection')
    } else {
      router.push('/pending-approval')
    }
  }

  const hasErrors = Object.keys(errors).length > 0

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-secondary/10 rounded-full">
            <User className="h-8 w-8 text-secondary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold">Personal Information</h1>
        <p className="text-lg text-muted-foreground">
          Please provide your basic contact information
        </p>
      </div>

      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please correct the errors below before continuing.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                placeholder="Enter your first name"
                className={errors.first_name ? 'border-destructive' : ''}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                placeholder="Enter your last name"
                className={errors.last_name ? 'border-destructive' : ''}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email address"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number *</Label>
            <Input
              id="phone_number"
              type="tel"
              value={formData.phone_number}
              onChange={(e) => handleInputChange('phone_number', e.target.value)}
              placeholder="(555)-123-4567"
              className={errors.phone_number ? 'border-destructive' : ''}
              maxLength={14} // Maximum length for formatted phone number
            />
            {errors.phone_number && (
              <p className="text-sm text-destructive">{errors.phone_number}</p>
            )}
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth *</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
              className={errors.date_of_birth ? 'border-destructive' : ''}
            />
            {errors.date_of_birth && (
              <p className="text-sm text-destructive">{errors.date_of_birth}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={handleGoBack}>
          Back
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
          ) : 'Continue'}
        </Button>
      </div>
    </div>
  )
}