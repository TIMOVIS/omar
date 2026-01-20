'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export interface Trainer {
  id: string
  full_name: string
  email: string
  role: string
}

export async function getTrainers(): Promise<Trainer[]> {
  const supabase = await createClient()

  // Get current user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (!profile?.organization_id) {
    return []
  }

  // Get all trainers/admins in the organization
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role')
    .eq('organization_id', profile.organization_id)
    .in('role', ['trainer', 'admin'])
    .order('full_name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function inviteTrainer(email: string, fullName: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Get current user's organization
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .single()

  if (!profile?.organization_id) {
    return { success: false, error: 'No organization found' }
  }

  // For now, we'll create a placeholder profile that can be claimed later
  // In a real app, you'd send an invite email
  const { error } = await supabase.rpc('add_trainer_to_org', {
    trainer_email: email,
    trainer_name: fullName,
    org_id: profile.organization_id,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/trainers')
  return { success: true }
}
