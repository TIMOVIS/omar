'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, addDays, addHours } from 'date-fns'
import {
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  updateSession,
  markSessionComplete,
  cancelSession,
} from '@/lib/actions'
import type {
  SessionWithRelations,
  ProgrammeTemplate,
  Student,
  Location,
} from '@/lib/supabase/types'

interface QuickActionsProps {
  session: SessionWithRelations
  programmes: ProgrammeTemplate[]
  students: Student[]
  locations: Location[]
}

export function QuickActions({
  session,
  programmes,
  students,
  locations,
}: QuickActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<string | null>(null)

  // Move time state
  const [moveSheetOpen, setMoveSheetOpen] = useState(false)
  const [newDateTime, setNewDateTime] = useState(
    format(new Date(session.starts_at), "yyyy-MM-dd'T'HH:mm")
  )

  // Change location state
  const [locationSheetOpen, setLocationSheetOpen] = useState(false)
  const [newLocationId, setNewLocationId] = useState(session.location_id ?? 'none')

  const handleMoveTime = async () => {
    setIsLoading('move')
    const result = await updateSession(session.id, {
      starts_at: new Date(newDateTime).toISOString(),
    })
    setIsLoading(null)
    if (result.success) {
      setMoveSheetOpen(false)
      router.refresh()
    }
  }

  const handleChangeLocation = async () => {
    setIsLoading('location')
    const result = await updateSession(session.id, {
      location_id: newLocationId === 'none' ? null : newLocationId,
    })
    setIsLoading(null)
    if (result.success) {
      setLocationSheetOpen(false)
      router.refresh()
    }
  }

  const handleMarkComplete = async () => {
    setIsLoading('complete')
    await markSessionComplete(session.id)
    setIsLoading(null)
    router.refresh()
  }

  const handleCancel = async () => {
    setIsLoading('cancel')
    await cancelSession(session.id)
    setIsLoading(null)
    router.refresh()
  }

  // Quick time presets
  const now = new Date()
  const quickTimes = [
    { label: '+1 hour', value: addHours(new Date(session.starts_at), 1) },
    { label: '+1 day', value: addDays(new Date(session.starts_at), 1) },
    { label: '+1 week', value: addDays(new Date(session.starts_at), 7) },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {/* Move Time */}
      <Sheet open={moveSheetOpen} onOpenChange={setMoveSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <Clock className="h-4 w-4" />
            Move
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-safe">
          <SheetHeader>
            <SheetTitle>Move Session</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quick options</Label>
              <div className="flex gap-2">
                {quickTimes.map(({ label, value }) => (
                  <Button
                    key={label}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setNewDateTime(format(value, "yyyy-MM-dd'T'HH:mm"))
                    }
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Or pick a date/time</Label>
              <Input
                type="datetime-local"
                value={newDateTime}
                onChange={e => setNewDateTime(e.target.value)}
              />
            </div>
            <Button
              className="w-full tap-target"
              onClick={handleMoveTime}
              disabled={isLoading === 'move'}
            >
              {isLoading === 'move' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirm Move
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Change Location */}
      <Sheet open={locationSheetOpen} onOpenChange={setLocationSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            <MapPin className="h-4 w-4" />
            Location
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="h-auto pb-safe">
          <SheetHeader>
            <SheetTitle>Change Location</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 py-4">
            <Select value={newLocationId ?? 'none'} onValueChange={setNewLocationId}>
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No location</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name} ({location.location_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              className="w-full tap-target"
              onClick={handleChangeLocation}
              disabled={isLoading === 'location'}
            >
              {isLoading === 'location' && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Location
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Mark Complete */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={handleMarkComplete}
        disabled={isLoading === 'complete'}
      >
        {isLoading === 'complete' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 text-green-500" />
        )}
        Done
      </Button>

      {/* Cancel */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={handleCancel}
        disabled={isLoading === 'cancel'}
      >
        {isLoading === 'cancel' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4 text-destructive" />
        )}
        Cancel
      </Button>
    </div>
  )
}
