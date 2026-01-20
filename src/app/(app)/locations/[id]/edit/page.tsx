import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { LocationForm } from '@/components/forms/location-form'
import { getLocation } from '@/lib/actions'

interface EditLocationPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLocationPage({ params }: EditLocationPageProps) {
  const { id } = await params
  const location = await getLocation(id)

  if (!location) {
    notFound()
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Edit Location"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/locations/${id}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <LocationForm location={location} />
    </div>
  )
}
