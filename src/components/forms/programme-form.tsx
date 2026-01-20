'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { programmeTemplateSchema, type ProgrammeTemplateFormData } from '@/lib/validations'
import { createProgramme, updateProgramme } from '@/lib/actions'
import type { ProgrammeTemplate } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

interface ProgrammeFormProps {
  programme?: ProgrammeTemplate | null
}

export function ProgrammeForm({ programme }: ProgrammeFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!programme

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProgrammeTemplateFormData>({
    resolver: zodResolver(programmeTemplateSchema),
    defaultValues: {
      name: programme?.name ?? '',
      description: programme?.description ?? '',
      target_duration_minutes: programme?.target_duration_minutes ?? 60,
    },
  })

  const onSubmit = async (data: ProgrammeTemplateFormData) => {
    setIsLoading(true)
    setError(null)

    const result = isEditing
      ? await updateProgramme(programme.id, data)
      : await createProgramme(data)

    if (!result.success) {
      setError(result.error ?? 'An error occurred')
      setIsLoading(false)
      return
    }

    if (isEditing) {
      router.push(`/programmes/${programme.id}`)
    } else {
      router.push('/programmes')
    }
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
          <CardTitle className="text-base">Programme Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Full Body Workout, HIIT Session"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What is this programme for?"
              rows={2}
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_duration_minutes">Target Duration (minutes)</Label>
            <Input
              id="target_duration_minutes"
              type="number"
              min={1}
              max={180}
              {...register('target_duration_minutes', { valueAsNumber: true })}
            />
            {errors.target_duration_minutes && (
              <p className="text-sm text-destructive">
                {errors.target_duration_minutes.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="w-full tap-target" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Save Changes' : 'Create Programme'}
      </Button>
    </form>
  )
}
