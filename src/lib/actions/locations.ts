'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { locationSchema, type LocationFormData } from '@/lib/validations'
import type { Location } from '@/lib/supabase/types'

export async function getLocations(): Promise<Location[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getLocation(id: string): Promise<Location | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function createLocation(formData: LocationFormData): Promise<{ success: boolean; error?: string; data?: Location }> {
  const validated = locationSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  // Get user's organization
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('organization_id')
    .single() as { data: { organization_id: string | null } | null; error: unknown }

  const organizationId = profileData?.organization_id
  if (profileError || !organizationId) {
    return { success: false, error: 'No organization found' }
  }

  const insertData = {
    name: validated.data.name,
    address: validated.data.address || null,
    location_type: validated.data.location_type,
    latitude: validated.data.latitude ?? null,
    longitude: validated.data.longitude ?? null,
    meeting_point: validated.data.meeting_point || null,
    equipment_notes: validated.data.equipment_notes || null,
    organization_id: organizationId,
  }

  const { data, error } = await supabase
    .from('locations')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/locations')
  return { success: true, data }
}

export async function updateLocation(id: string, formData: LocationFormData): Promise<{ success: boolean; error?: string }> {
  const validated = locationSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const updateData = {
    name: validated.data.name,
    address: validated.data.address || null,
    location_type: validated.data.location_type,
    latitude: validated.data.latitude ?? null,
    longitude: validated.data.longitude ?? null,
    meeting_point: validated.data.meeting_point || null,
    equipment_notes: validated.data.equipment_notes || null,
  }

  const { error } = await supabase
    .from('locations')
    .update(updateData as never)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/locations')
  return { success: true }
}

export async function deleteLocation(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Soft delete
  const { error } = await supabase
    .from('locations')
    .update({ is_active: false } as never)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/locations')
  return { success: true }
}
