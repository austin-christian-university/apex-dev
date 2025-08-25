'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Update user profile photo
 */
export async function updateUserPhoto(
  userId: string,
  photoBase64: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user to verify they can update this profile
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user is updating their own profile or is staff/admin
    if (user.id !== userId) {
      // Check if user is staff/admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError || !userData || !['staff', 'admin'].includes(userData.role)) {
        return { success: false, error: 'Permission denied' }
      }
    }

    // Update the user's photo
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        photo: photoBase64,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Database error updating photo:', updateError)
      return { success: false, error: 'Failed to update photo' }
    }

    // Revalidate the profile page to show the updated photo
    revalidatePath('/profile')
    revalidatePath('/home')

    return { success: true }
  } catch (error) {
    console.error('Error updating user photo:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

/**
 * Update user profile data
 */
export async function updateUserProfile(
  userId: string,
  profileData: {
    first_name?: string
    last_name?: string
    email?: string
    phone_number?: string
    date_of_birth?: string
    disc_profile?: string
    myers_briggs_profile?: string
    enneagram_profile?: string
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()

    // Get current user to verify they can update this profile
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Authentication required' }
    }

    // Verify user is updating their own profile or is staff/admin
    if (user.id !== userId) {
      // Check if user is staff/admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (userError || !userData || !['staff', 'admin'].includes(userData.role)) {
        return { success: false, error: 'Permission denied' }
      }
    }

    // Update the user's profile data
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Database error updating profile:', updateError)
      return { success: false, error: 'Failed to update profile' }
    }

    // Revalidate the profile page to show the updated data
    revalidatePath('/profile')
    revalidatePath('/home')

    return { success: true }
  } catch (error) {
    console.error('Error updating user profile:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    }
  }
}

