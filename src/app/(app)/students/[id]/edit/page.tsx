import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { StudentForm } from '@/components/forms/student-form'
import { getStudent } from '@/lib/actions'

interface EditStudentPageProps {
  params: Promise<{ id: string }>
}

export default async function EditStudentPage({ params }: EditStudentPageProps) {
  const { id } = await params
  const student = await getStudent(id)

  if (!student) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Edit Student"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/students/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <StudentForm student={student} />
    </div>
  )
}
