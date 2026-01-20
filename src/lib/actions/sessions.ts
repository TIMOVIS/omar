'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { sessionSchema, type SessionFormData } from '@/lib/validations'
import type { Session, SessionWithRelations } from '@/lib/supabase/types'

export async function getSessions(options?: {
  from?: string
  to?: string
  status?: Session['status']
}): Promise<SessionWithRelations[]> {
  const supabase = await createClient()

  let query = supabase
    .from('sessions')
    .select(`
      *,
      location:locations(*),
      session_students(*, student:students(*)),
      session_programmes(*),
      trainer:profiles!sessions_trainer_id_fkey(*)
    `)
    .order('starts_at', { ascending: true })

  if (options?.from) {
    query = query.gte('starts_at', options.from)
  }
  if (options?.to) {
    query = query.lt('starts_at', options.to)
  }
  if (options?.status) {
    query = query.eq('status', options.status)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as SessionWithRelations[]
}

export async function getSession(id: string): Promise<SessionWithRelations | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      location:locations(*),
      session_students(*, student:students(*)),
      session_programmes(*),
      trainer:profiles!sessions_trainer_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as unknown as SessionWithRelations
}

export async function getTodaySessions(): Promise<SessionWithRelations[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 2)

  return getSessions({
    from: today.toISOString(),
    to: tomorrow.toISOString(),
  })
}

export async function createSession(formData: SessionFormData): Promise<{ success: boolean; error?: string; data?: Session }> {
  const validated = sessionSchema.safeParse(formData)
  if (!validated.success) {
    return { success: false, error: validated.error.issues[0].message }
  }

  if (validated.data.student_ids.length > 2) {
    return { success: false, error: 'Maximum 2 students per session' }
  }

  const supabase = await createClient()

  // Get user's profile and organization
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, organization_id')
    .single() as { data: { id: string; organization_id: string | null } | null; error: unknown }

  const organizationId = profileData?.organization_id
  const currentUserId = profileData?.id
  if (profileError || !organizationId || !currentUserId) {
    return { success: false, error: 'No organization found' }
  }

  // Use selected trainer or default to current user
  const trainerId = validated.data.trainer_id || currentUserId

  // Create the session
  const sessionInsertData = {
    organization_id: organizationId,
    trainer_id: trainerId,
    location_id: validated.data.location_id || null,
    starts_at: validated.data.starts_at,
    notes: validated.data.notes || null,
    duration_minutes: 60,
    status: 'scheduled' as const,
  }

  const { data: sessionData, error: sessionError } = await supabase
    .from('sessions')
    .insert(sessionInsertData as never)
    .select()
    .single() as { data: Session | null; error: { message: string; code?: string } | null }

  if (sessionError || !sessionData) {
    // Check for overlap constraint
    if (sessionError?.message.includes('no_trainer_overlap')) {
      return { success: false, error: 'You already have a session at this time' }
    }
    return { success: false, error: sessionError?.message ?? 'Failed to create session' }
  }

  // Add students to session
  if (validated.data.student_ids.length > 0) {
    const studentInserts = validated.data.student_ids.map(student_id => ({
      session_id: sessionData.id,
      student_id,
    }))

    const { error: studentsError } = await supabase
      .from('session_students')
      .insert(studentInserts as never)

    if (studentsError) {
      // Rollback session creation
      await supabase.from('sessions').delete().eq('id', sessionData.id)
      return { success: false, error: studentsError.message }
    }
  }

  revalidatePath('/schedule')
  revalidatePath('/today')
  return { success: true, data: sessionData }
}

export async function updateSession(
  id: string,
  formData: Partial<SessionFormData> & { status?: Session['status'] }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const updates: Record<string, unknown> = {}

  if (formData.starts_at !== undefined) {
    updates.starts_at = formData.starts_at
  }
  if (formData.location_id !== undefined) {
    updates.location_id = formData.location_id || null
  }
  if (formData.notes !== undefined) {
    updates.notes = formData.notes || null
  }
  if (formData.status !== undefined) {
    updates.status = formData.status
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from('sessions')
      .update(updates as never)
      .eq('id', id)

    if (error) {
      if (error.message.includes('no_trainer_overlap')) {
        return { success: false, error: 'You already have a session at this time' }
      }
      return { success: false, error: error.message }
    }
  }

  // Update students if provided
  if (formData.student_ids !== undefined) {
    if (formData.student_ids.length > 2) {
      return { success: false, error: 'Maximum 2 students per session' }
    }

    // Remove existing students
    await supabase.from('session_students').delete().eq('session_id', id)

    // Add new students
    if (formData.student_ids.length > 0) {
      const studentInserts = formData.student_ids.map(student_id => ({
        session_id: id,
        student_id,
      }))

      const { error: studentsError } = await supabase
        .from('session_students')
        .insert(studentInserts as never)

      if (studentsError) {
        return { success: false, error: studentsError.message }
      }
    }
  }

  revalidatePath('/schedule')
  revalidatePath('/today')
  revalidatePath(`/sessions/${id}`)
  return { success: true }
}

export async function deleteSession(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/schedule')
  revalidatePath('/today')
  return { success: true }
}

export async function markSessionComplete(id: string): Promise<{ success: boolean; error?: string }> {
  return updateSession(id, { status: 'completed' })
}

export async function cancelSession(id: string): Promise<{ success: boolean; error?: string }> {
  return updateSession(id, { status: 'cancelled' })
}

export async function getStudentSessions(studentId: string): Promise<SessionWithRelations[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      location:locations(*),
      session_students(*, student:students(*)),
      session_programmes(*),
      trainer:profiles!sessions_trainer_id_fkey(*)
    `)
    .eq('session_students.student_id', studentId)
    .order('starts_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as SessionWithRelations[]
}
