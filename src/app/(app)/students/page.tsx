import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getStudents } from '@/lib/actions'
import { StudentAppointmentDialog } from '@/components/student-appointment-dialog'

export default async function StudentsPage() {
  const students = await getStudents()

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Students"
        subtitle={`${students.length} active`}
        action={
          <Button asChild size="icon" className="h-9 w-9">
            <Link href="/students/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 pb-4">
        {students.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <p className="mb-4 text-muted-foreground">No students yet</p>
            <Button asChild>
              <Link href="/students/new">Add your first student</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {students.map(student => (
              <Card key={student.id} className="flex items-center gap-3 p-3">
                <Link href={`/students/${student.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {student.full_name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{student.full_name}</p>
                    {student.goals && (
                      <p className="text-sm text-muted-foreground truncate">
                        {student.goals}
                      </p>
                    )}
                  </div>
                </Link>
                <StudentAppointmentDialog student={student} />
                <Link href={`/students/${student.id}`}>
                  <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
