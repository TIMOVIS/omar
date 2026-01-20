'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { locationSchema, type LocationFormData } from '@/lib/validations'
import { createLocation, updateLocation } from '@/lib/actions'
import type { Location } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search } from 'lucide-react'

interface LocationFormProps {
  location?: Location | null
}

interface SearchResult {
  place_id: number
  display_name: string
  lat: string
  lon: string
}

export function LocationForm({ location }: LocationFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!location

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: location?.name ?? '',
      address: location?.address ?? '',
      location_type: location?.location_type ?? 'indoor',
      latitude: location?.latitude ?? undefined,
      longitude: location?.longitude ?? undefined,
      meeting_point: location?.meeting_point ?? '',
      equipment_notes: location?.equipment_notes ?? '',
    },
  })

  const locationType = watch('location_type')
  const locationName = watch('name')

  const lookupLocation = async () => {
    if (!locationName.trim()) return

    setIsSearching(true)
    setSearchResults([])
    setError(null)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=5`,
        { headers: { 'User-Agent': 'TrainerApp/1.0' } }
      )
      const results = await response.json()

      if (results.length > 0) {
        setSearchResults(results)
      } else {
        setError('No locations found. Try a different search.')
      }
    } catch {
      setError('Failed to lookup location')
    } finally {
      setIsSearching(false)
    }
  }

  const selectSearchResult = (result: SearchResult) => {
    setValue('address', result.display_name)
    setValue('latitude', parseFloat(result.lat))
    setValue('longitude', parseFloat(result.lon))
    setSearchResults([])
  }

  const onSubmit = async (data: LocationFormData) => {
    setIsLoading(true)
    setError(null)

    const result = isEditing
      ? await updateLocation(location.id, data)
      : await createLocation(data)

    if (!result.success) {
      setError(result.error ?? 'An error occurred')
      setIsLoading(false)
      return
    }

    router.push('/locations')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-4 pb-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Location Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <div className="flex gap-2">
              <Input
                id="name"
                placeholder="e.g., Hyde Park London, PureGym Soho"
                {...register('name')}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={lookupLocation}
                disabled={isSearching || !locationName?.trim()}
                title="Lookup address & coordinates"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Enter a place name and click search to auto-fill address
            </p>

            {searchResults.length > 0 && (
              <div className="rounded-md border bg-background shadow-md">
                <p className="px-3 py-2 text-xs font-medium text-muted-foreground border-b">
                  Select a location:
                </p>
                <div className="max-h-48 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm hover:bg-muted/50 border-b last:border-b-0"
                      onClick={() => selectSearchResult(result)}
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_type">Type *</Label>
            <Select
              value={locationType}
              onValueChange={value => setValue('location_type', value as 'indoor' | 'outdoor')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="indoor">Indoor</SelectItem>
                <SelectItem value="outdoor">Outdoor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Full address"
              {...register('address')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meeting_point">Meeting Point</Label>
            <Input
              id="meeting_point"
              placeholder="e.g., Main entrance, by the fountain"
              {...register('meeting_point')}
            />
          </div>
        </CardContent>
      </Card>

      {locationType === 'outdoor' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Coordinates (for weather)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="51.5074"
                  {...register('latitude', { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="-0.1278"
                  {...register('longitude', { valueAsNumber: true })}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Optional: Add coordinates to show weather for outdoor sessions
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Equipment & Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="equipment_notes">Equipment Notes</Label>
            <Textarea
              id="equipment_notes"
              placeholder="Available equipment, what to bring, etc."
              rows={3}
              {...register('equipment_notes')}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full tap-target" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Save Changes' : 'Add Location'}
      </Button>
    </form>
  )
}
