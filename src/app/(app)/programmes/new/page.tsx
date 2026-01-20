import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { ProgrammeForm } from '@/components/forms/programme-form'

export default function NewProgrammePage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="New Programme"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/programmes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <ProgrammeForm />
    </div>
  )
}
