import Link from 'next/link'
import { Plus, MapPin, Building2, TreePine } from 'lucide-react'
import { PageHeader } from '@/components/layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getLocations } from '@/lib/actions'

export default async function LocationsPage() {
  const locations = await getLocations()

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Locations"
        subtitle={`${locations.length} active`}
        action={
          <Button asChild size="icon" className="h-9 w-9">
            <Link href="/locations/new">
              <Plus className="h-5 w-5" />
            </Link>
          </Button>
        }
      />

      <div className="flex-1 px-4 pb-4">
        {locations.length === 0 ? (
          <Card className="flex flex-col items-center justify-center p-8 text-center">
            <p className="mb-4 text-muted-foreground">No locations yet</p>
            <Button asChild>
              <Link href="/locations/new">Add your first location</Link>
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {locations.map(location => (
              <Link key={location.id} href={`/locations/${location.id}`}>
                <Card className="flex items-center gap-3 p-3 active:bg-muted/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    {location.location_type === 'outdoor' ? (
                      <TreePine className="h-5 w-5 text-green-600" />
                    ) : (
                      <Building2 className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{location.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {location.location_type}
                      </Badge>
                    </div>
                    {location.address && (
                      <p className="text-sm text-muted-foreground truncate flex items-center gap-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        {location.address}
                      </p>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
