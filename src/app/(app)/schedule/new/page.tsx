import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { SessionForm } from '@/components/forms/session-form'
import { getStudents, getLocations, getTrainers } from '@/lib/actions'
import { createClient } from '@/lib/supabase/server'

interface NewSessionPageProps {
  searchParams: Promise<{ date?: string; student?: string }>
}

export default async function NewSessionPage({ searchParams }: NewSessionPageProps) {
  const { date, student: defaultStudentId } = await searchParams
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .single() as { data: { id: string } | null }

  const [students, locations, trainers] = await Promise.all([
    getStudents(),
    getLocations(),
    getTrainers(),
  ])

  return (
    <div className="flex flex-col">
      <PageHeader
        title="New Session"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/schedule">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <SessionForm
        students={students}
        locations={locations}
        trainers={trainers}
        currentUserId={profile?.id ?? ''}
        defaultDate={date}
        defaultStudentId={defaultStudentId}
      />
    </div>
  )
}
