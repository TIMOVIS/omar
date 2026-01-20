'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { programmeBlockSchema, type ProgrammeBlockFormData } from '@/lib/validations'
import { addProgrammeBlock, updateProgrammeBlock } from '@/lib/actions'
import type { ProgrammeBlock } from '@/lib/supabase/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2 } from 'lucide-react'

interface ProgrammeBlockFormProps {
  programmeId: string
  block?: ProgrammeBlock | null
  onSuccess?: () => void
}

const exerciseTypes = [
  { value: 'warmup', label: 'Warm-up' },
  { value: 'strength', label: 'Strength' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'cooldown', label: 'Cool-down' },
  { value: 'rest', label: 'Rest' },
  { value: 'other', label: 'Other' },
]

export function ProgrammeBlockForm({ programmeId, block, onSuccess }: ProgrammeBlockFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const isEditing = !!block

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProgrammeBlockFormData>({
    resolver: zodResolver(programmeBlockSchema),
    defaultValues: {
      name: block?.name ?? '',
      exercise_type: block?.exercise_type ?? null,
      duration_seconds: block?.duration_seconds ?? undefined,
      sets: block?.sets ?? undefined,
      reps: block?.reps ?? '',
      rest_seconds: block?.rest_seconds ?? undefined,
      instructions: block?.instructions ?? '',
    },
  })

  const exerciseType = watch('exercise_type')

  const onSubmit = async (data: ProgrammeBlockFormData) => {
    setIsLoading(true)
    setError(null)

    const result = isEditing
      ? await updateProgrammeBlock(block.id, data)
      : await addProgrammeBlock(programmeId, data)

    if (!result.success) {
      setError(result.error ?? 'An error occurred')
      setIsLoading(false)
      return
    }

    router.refresh()
    onSuccess?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Exercise Name *</Label>
        <Input
          id="name"
          placeholder="e.g., Squats, Burpees, Plank"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Type</Label>
        <Select
          value={exerciseType ?? 'none'}
          onValueChange={value =>
            setValue('exercise_type', value === 'none' ? null : (value as ProgrammeBlockFormData['exercise_type']))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No type</SelectItem>
            {exerciseTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sets">Sets</Label>
          <Input
            id="sets"
            type="number"
            min={0}
            placeholder="3"
            {...register('sets', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="reps">Reps</Label>
          <Input
            id="reps"
            placeholder="12 or 8-12"
            {...register('reps')}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="duration_seconds">Duration (sec)</Label>
          <Input
            id="duration_seconds"
            type="number"
            min={0}
            placeholder="30"
            {...register('duration_seconds', { valueAsNumber: true })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rest_seconds">Rest (sec)</Label>
          <Input
            id="rest_seconds"
            type="number"
            min={0}
            placeholder="60"
            {...register('rest_seconds', { valueAsNumber: true })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="instructions">Instructions</Label>
        <Textarea
          id="instructions"
          placeholder="Form cues, modifications, etc."
          rows={2}
          {...register('instructions')}
        />
      </div>

      <Button type="submit" className="w-full tap-target" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isEditing ? 'Update Exercise' : 'Add Exercise'}
      </Button>
    </form>
  )
}
