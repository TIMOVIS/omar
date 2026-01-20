import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout'
import { LocationForm } from '@/components/forms/location-form'

export default function NewLocationPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="New Location"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/locations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <LocationForm />
    </div>
  )
}
