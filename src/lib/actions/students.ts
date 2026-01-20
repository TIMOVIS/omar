'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { studentSchema, type StudentFormData } from '@/lib/validations'
import type { Student } from '@/lib/supabase/types'

export async function getStudents(): Promise<Student[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('is_active', true)
    .order('full_name')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getStudent(id: string): Promise<Student | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data
}

export async function createStudent(formData: StudentFormData): Promise<{ success: boolean; error?: string; data?: Student }> {
  const validated = studentSchema.safeParse(formData)
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
    ...validated.data,
    organization_id: organizationId,
    email: validated.data.email || null,
    phone: validated.data.phone || null,
    notes: validated.data.notes || null,
    constraints_injuries: validated.data.constraints_injuries || null,
    goals: validated.data.goals || null,
    emergency_contact_name: validated.data.emergency_contact_name || null,
    emergency_contact_phone: validated.data.emergency_contact_phone || null,
  }

  const { data, error } = await supabase
    .from('students')
    .insert(insertData as never)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/students')
  return { success: true, data }
}

export async function updateStudent(id: string, formData: StudentFormData): Promise<{ success: boolean; error?: string }> {
  const validated = studentSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const updateData = {
    ...validated.data,
    email: validated.data.email || null,
    phone: validated.data.phone || null,
    notes: validated.data.notes || null,
    constraints_injuries: validated.data.constraints_injuries || null,
    goals: validated.data.goals || null,
    emergency_contact_name: validated.data.emergency_contact_name || null,
    emergency_contact_phone: validated.data.emergency_contact_phone || null,
  }

  const { error } = await supabase
    .from('students')
    .update(updateData as never)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/students')
  revalidatePath(`/students/${id}`)
  return { success: true }
}

export async function deleteStudent(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Soft delete by setting is_active to false
  const { error } = await supabase
    .from('students')
    .update({ is_active: false } as never)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/students')
  return { success: true }
}
