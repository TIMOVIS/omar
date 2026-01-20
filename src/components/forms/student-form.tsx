'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { studentSchema, type StudentFormData } from '@/lib/validations'
import { createStudent, updateStudent } from '@/lib/actions'
import type { Student } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface StudentFormProps {
  student?: Student | null
}

export function StudentForm({ student }: StudentFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!student

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      full_name: student?.full_name ?? '',
      email: student?.email ?? '',
      phone: student?.phone ?? '',
      notes: student?.notes ?? '',
      constraints_injuries: student?.constraints_injuries ?? '',
      goals: student?.goals ?? '',
      emergency_contact_name: student?.emergency_contact_name ?? '',
      emergency_contact_phone: student?.emergency_contact_phone ?? '',
    },
  })

  const onSubmit = async (data: StudentFormData) => {
    setIsLoading(true)
    setError(null)

    const result = isEditing
      ? await updateStudent(student.id, data)
      : await createStudent(data)

    if (!result.success) {
      setError(result.error ?? 'An error occurred')
      setIsLoading(false)
      return
    }

    router.push('/students')
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
          <CardTitle className="text-base">Basic Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Name *</Label>
            <Input
              id="full_name"
              placeholder="Full name"
              {...register('full_name')}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+44..."
              {...register('phone')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Training Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goals">Goals</Label>
            <Textarea
              id="goals"
              placeholder="What are their training goals?"
              rows={2}
              {...register('goals')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="constraints_injuries">Constraints / Injuries</Label>
            <Textarea
              id="constraints_injuries"
              placeholder="Any injuries or physical constraints?"
              rows={2}
              {...register('constraints_injuries')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              rows={3}
              {...register('notes')}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Emergency Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergency_contact_name">Contact Name</Label>
            <Input
              id="emergency_contact_name"
              placeholder="Emergency contact name"
              {...register('emergency_contact_name')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergency_contact_phone">Contact Phone</Label>
            <Input
              id="emergency_contact_phone"
              type="tel"
              placeholder="+44..."
              {...register('emergency_contact_phone')}
            />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full tap-target" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Save Changes' : 'Add Student'}
      </Button>
    </form>
  )
}
