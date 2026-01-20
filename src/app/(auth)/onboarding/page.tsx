'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, type OnboardingFormData } from '@/lib/validations'
import { completeOnboarding } from '@/lib/actions/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  })

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true)
    setError(null)

    const result = await completeOnboarding(data)

    if (result.success) {
      router.push('/today')
      router.refresh()
    } else {
      setError(result.error || 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mb-2 flex justify-center">
            <div className="rounded-full bg-primary p-3">
              <Dumbbell className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Set up your training business to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="organization_name">Business Name</Label>
              <Input
                id="organization_name"
                type="text"
                placeholder="e.g. Omar Personal Training"
                {...register('organization_name')}
              />
              {errors.organization_name && (
                <p className="text-sm text-destructive">{errors.organization_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Your Name</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="e.g. Omar Ahmed"
                {...register('full_name')}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full tap-target" disabled={isLoading}>
              {isLoading ? 'Setting up...' : 'Get Started'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
