import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { SessionForm } from '@/components/forms/session-form'
import { getSession, getStudents, getLocations, getTrainers } from '@/lib/actions'
import { createClient } from '@/lib/supabase/server'

interface EditSessionPageProps {
  params: Promise<{ id: string }>
}

export default async function EditSessionPage({ params }: EditSessionPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .single()

  const [session, students, locations, trainers] = await Promise.all([
    getSession(id),
    getStudents(),
    getLocations(),
    getTrainers(),
  ])

  if (!session) {
    notFound()
  }

  // Transform session data for form
  const sessionForForm = {
    ...session,
    session_students: session.session_students?.map(ss => ({
      student_id: ss.student.id,
    })),
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Edit Session"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/sessions/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <SessionForm
        session={sessionForForm}
        students={students}
        locations={locations}
        trainers={trainers}
        currentUserId={profile?.id ?? ''}
      />
    </div>
  )
}
