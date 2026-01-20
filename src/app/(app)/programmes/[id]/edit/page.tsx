import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { ProgrammeForm } from '@/components/forms/programme-form'
import { getProgramme } from '@/lib/actions'

interface EditProgrammePageProps {
  params: Promise<{ id: string }>
}

export default async function EditProgrammePage({ params }: EditProgrammePageProps) {
  const { id } = await params
  const programme = await getProgramme(id)

  if (!programme) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Edit Programme"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/programmes/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <ProgrammeForm programme={programme} />
    </div>
  )
}
