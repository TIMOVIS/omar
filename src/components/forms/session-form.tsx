'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format, parseISO } from 'date-fns'
import { sessionSchema, type SessionFormData } from '@/lib/validations'
import { createSession, updateSession } from '@/lib/actions'
import type { Session, Student, Location } from '@/lib/supabase/types'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, Users, MapPin, UserCog, Plus } from 'lucide-react'
import type { Trainer } from '@/lib/actions/trainers'
import Link from 'next/link'

interface SessionFormProps {
  session?: Session & { session_students?: { student_id: string }[], trainer_id?: string }
  students: Student[]
  locations: Location[]
  trainers: Trainer[]
  currentUserId: string
  defaultDate?: string
  defaultStudentId?: string
}

export function SessionForm({ session, students, locations, trainers, currentUserId, defaultDate, defaultStudentId }: SessionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!session

  const existingStudentIds = session?.session_students?.map(ss => ss.student_id) ?? []
  const initialStudentIds = existingStudentIds.length > 0
    ? existingStudentIds
    : defaultStudentId
    ? [defaultStudentId]
    : []

  // Format default date/time
  const defaultDateTime = session
    ? format(parseISO(session.starts_at), "yyyy-MM-dd'T'HH:mm")
    : defaultDate
    ? `${defaultDate}T09:00`
    : format(new Date(), "yyyy-MM-dd'T'HH:mm")

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SessionFormData>({
    resolver: zodResolver(sessionSchema),
    defaultValues: {
      trainer_id: session?.trainer_id ?? currentUserId,
      location_id: session?.location_id ?? undefined,
      starts_at: defaultDateTime,
      notes: session?.notes ?? '',
      student_ids: initialStudentIds,
    },
  })

  const selectedStudentIds = watch('student_ids')
  const selectedLocationId = watch('location_id')
  const selectedTrainerId = watch('trainer_id')

  const toggleStudent = (studentId: string) => {
    const current = selectedStudentIds || []
    if (current.includes(studentId)) {
      setValue(
        'student_ids',
        current.filter(id => id !== studentId)
      )
    } else if (current.length < 2) {
      setValue('student_ids', [...current, studentId])
    }
  }

  const onSubmit = async (data: SessionFormData) => {
    setIsLoading(true)
    setError(null)

    // Convert local datetime to ISO string
    const startsAt = new Date(data.starts_at).toISOString()

    const result = isEditing
      ? await updateSession(session.id, { ...data, starts_at: startsAt })
      : await createSession({ ...data, starts_at: startsAt })

    if (!result.success) {
      setError(result.error ?? 'An error occurred')
      setIsLoading(false)
      return
    }

    router.push('/schedule')
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
          <CardTitle className="text-base">Date & Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="starts_at">When *</Label>
            <Input
              id="starts_at"
              type="datetime-local"
              {...register('starts_at')}
            />
            {errors.starts_at && (
              <p className="text-sm text-destructive">{errors.starts_at.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Sessions are always 60 minutes
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <UserCog className="h-4 w-4" />
              Trainer
            </span>
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link href="/trainers/new">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {trainers.length > 1 ? (
            <Select
              value={selectedTrainerId ?? currentUserId}
              onValueChange={value => setValue('trainer_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select trainer" />
              </SelectTrigger>
              <SelectContent>
                {trainers.map(trainer => (
                  <SelectItem key={trainer.id} value={trainer.id}>
                    {trainer.full_name} {trainer.id === currentUserId && '(You)'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-sm text-muted-foreground">
              {trainers[0]?.full_name ?? 'You'} (only trainer)
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </span>
            <Button asChild variant="ghost" size="sm" className="h-8">
              <Link href="/locations/new">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Link>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedLocationId ?? 'none'}
            onValueChange={value => setValue('location_id', value === 'none' ? null : value)}
          >
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4" />
            Students (max 2)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No students available. Add students first.
            </p>
          ) : (
            <div className="space-y-2">
              {students.map(student => {
                const isSelected = selectedStudentIds?.includes(student.id)
                const isDisabled = !isSelected && (selectedStudentIds?.length ?? 0) >= 2

                return (
                  <label
                    key={student.id}
                    className={`flex items-center gap-3 rounded-md border p-3 tap-target cursor-pointer ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : isDisabled
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onCheckedChange={() => toggleStudent(student.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{student.full_name}</p>
                      {student.goals && (
                        <p className="text-sm text-muted-foreground truncate">
                          {student.goals}
                        </p>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}
          {errors.student_ids && (
            <p className="text-sm text-destructive mt-2">
              {errors.student_ids.message}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Session notes..."
            rows={3}
            {...register('notes')}
          />
        </CardContent>
      </Card>

      <Button type="submit" className="w-full tap-target" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Save Changes' : 'Create Session'}
      </Button>
    </form>
  )
}
