import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pencil, MapPin, Building2, TreePine, Navigation, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/layout'
import { getLocation } from '@/lib/actions'
import { DeleteLocationButton } from './delete-button'

interface LocationPageProps {
  params: Promise<{ id: string }>
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { id } = await params
  const location = await getLocation(id)

  if (!location) {
    notFound()
  }

  const isOutdoor = location.location_type === 'outdoor'

  return (
    <div className="flex flex-col">
      <PageHeader
        title=""
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/locations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="px-4 pb-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            {isOutdoor ? (
              <TreePine className="h-7 w-7 text-green-600" />
            ) : (
              <Building2 className="h-7 w-7 text-primary" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{location.name}</h1>
            <Badge variant="outline" className="capitalize mt-1">
              {location.location_type}
            </Badge>
          </div>
        </div>

        {/* Address */}
        {location.address && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="h-4 w-4" />
                Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{location.address}</p>
              {location.latitude && location.longitude && (
                <a
                  href={`https://maps.google.com/?q=${location.latitude},${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary flex items-center gap-1 mt-2"
                >
                  <Navigation className="h-3 w-3" />
                  Open in Maps
                </a>
              )}
            </CardContent>
          </Card>
        )}

        {/* Meeting Point */}
        {location.meeting_point && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Navigation className="h-4 w-4" />
                Meeting Point
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {location.meeting_point}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Equipment Notes */}
        {location.equipment_notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Package className="h-4 w-4" />
                Equipment Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {location.equipment_notes}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button asChild className="flex-1 tap-target">
            <Link href={`/locations/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeleteLocationButton id={id} name={location.name} />
        </div>
      </div>
    </div>
  )
}
