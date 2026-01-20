'use server'

import { createClient } from '@/lib/supabase/server'

export interface StudentSession {
  id: string
  starts_at: string
  duration_minutes: number
  status: string
  notes: string | null
  location: {
    name: string
    address: string | null
    location_type: string
    meeting_point: string | null
  } | null
  trainer: {
    full_name: string
  } | null
}

export async function getStudentSessions(): Promise<StudentSession[]> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Find the student record linked to this user
  const { data: student } = await supabase
    .from('students')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!student) return []

  // Get sessions for this student
  const { data: sessionStudents, error } = await supabase
    .from('session_students')
    .select(`
      session:sessions(
        id,
        starts_at,
        duration_minutes,
        status,
        notes,
        location:locations(name, address, location_type, meeting_point),
        trainer:profiles!sessions_trainer_id_fkey(full_name)
      )
    `)
    .eq('student_id', student.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching student sessions:', error)
    return []
  }

  // Extract and filter sessions
  const sessions = sessionStudents
    ?.map(ss => ss.session)
    .filter((s): s is StudentSession => s !== null)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())

  return sessions ?? []
}

export async function getUpcomingStudentSessions(): Promise<StudentSession[]> {
  const sessions = await getStudentSessions()
  const now = new Date()

  return sessions.filter(s =>
    new Date(s.starts_at) >= now && s.status === 'scheduled'
  )
}
