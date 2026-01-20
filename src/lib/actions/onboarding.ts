'use server'

import { createClient } from '@/lib/supabase/server'
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations'

export async function completeOnboarding(formData: OnboardingFormData): Promise<{ success: boolean; error?: string }> {
  const validated = onboardingSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // Check if user already has an organization (from failed signup)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single() as { data: { organization_id: string | null } | null }

  if (existingProfile?.organization_id) {
    // Already has organization, just redirect
    return { success: true }
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: validated.data.organization_name } as never)
    .select()
    .single() as { data: { id: string } | null; error: { message: string } | null }

  if (orgError) {
    console.error('Organization creation error:', orgError)
    return { success: false, error: `Failed to create organization: ${orgError.message}` }
  }

  // Update user's profile with organization_id and full_name
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      organization_id: org!.id,
      full_name: validated.data.full_name,
      role: 'trainer',
    } as never)
    .eq('id', user.id)

  if (profileError) {
    // Rollback: delete the organization if profile update fails
    await supabase.from('organizations').delete().eq('id', org!.id)
    console.error('Profile update error:', profileError)
    return { success: false, error: `Failed to update profile: ${profileError.message}` }
  }

  return { success: true }
}
