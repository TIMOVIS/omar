'use server'

import { createClient } from '@/lib/supabase/server'
import { signupSchema, type SignupFormData } from '@/lib/validations'

export async function signUp(formData: SignupFormData): Promise<{ success: boolean; error?: string }> {
  const validated = signupSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // 1. Sign up the user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: validated.data.email,
    password: validated.data.password,
    options: {
      data: {
        full_name: validated.data.full_name,
        organization_name: validated.data.organization_name,
      },
    },
  })

  if (signUpError) {
    console.error('Signup error:', signUpError)
    return { success: false, error: signUpError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Failed to create account' }
  }

  // 2. Sign in immediately to establish session
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: validated.data.email,
    password: validated.data.password,
  })

  if (signInError) {
    console.error('Sign in error:', signInError)
    return { success: false, error: signInError.message }
  }

  // 3. Call the setup_trainer function (bypasses RLS)
  const { error: setupError } = await supabase.rpc('setup_trainer', {
    user_id: authData.user.id,
    user_email: validated.data.email,
    user_full_name: validated.data.full_name,
    org_name: validated.data.organization_name,
  })

  if (setupError) {
    console.error('Setup error:', setupError)
    return { success: false, error: `Failed to set up account: ${setupError.message}` }
  }

  return { success: true }
}
