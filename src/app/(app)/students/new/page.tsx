import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { StudentForm } from '@/components/forms/student-form'

export default function NewStudentPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="New Student"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/students">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <StudentForm />
    </div>
  )
}
