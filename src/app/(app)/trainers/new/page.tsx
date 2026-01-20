'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout'

export default function NewTrainerPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const fullName = formData.get('full_name') as string

    // For now, just show instructions
    // In a real app, you'd send an invite email or use Supabase admin API
    setSuccess(true)
    setInviteCode(`${email}`)
    setIsLoading(false)
  }

  if (success) {
    return (
      <div className="flex flex-col">
        <PageHeader
          title="Invite Sent"
          action={
            <Button variant="ghost" size="icon" asChild>
              <Link href="/trainers">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
          }
        />
        <div className="px-4 pb-4">
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                To add a new trainer to your organization:
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Have the trainer sign up at your app URL</li>
                <li>They should use the email: <strong>{inviteCode}</strong></li>
                <li>Contact support to link their account to your organization</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                Note: Full trainer invite functionality requires additional setup.
              </p>
              <Button asChild className="w-full">
                <Link href="/trainers">Back to Trainers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Add Trainer"
        action={
          <Button variant="ghost" size="icon" asChild>
            <Link href="/trainers">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        }
      />
      <div className="px-4 pb-4">
        <Card>
          <CardHeader>
            <CardTitle>Trainer Details</CardTitle>
            <CardDescription>
              Add another trainer to your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  placeholder="John Smith"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Trainer'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
