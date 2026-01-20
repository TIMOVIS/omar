import { z } from 'zod'

// Student validation
export const studentSchema = z.object({
  full_name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().max(20).optional().or(z.literal('')),
  notes: z.string().max(1000).optional().or(z.literal('')),
  constraints_injuries: z.string().max(1000).optional().or(z.literal('')),
  goals: z.string().max(1000).optional().or(z.literal('')),
  emergency_contact_name: z.string().max(100).optional().or(z.literal('')),
  emergency_contact_phone: z.string().max(20).optional().or(z.literal('')),
})

export type StudentFormData = z.infer<typeof studentSchema>

// Location validation
export const locationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  address: z.string().max(200).optional().or(z.literal('')),
  location_type: z.enum(['indoor', 'outdoor']),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  meeting_point: z.string().max(200).optional().or(z.literal('')),
  equipment_notes: z.string().max(500).optional().or(z.literal('')),
})

export type LocationFormData = z.infer<typeof locationSchema>

// Session validation
export const sessionSchema = z.object({
  trainer_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional().nullable(),
  starts_at: z.string().min(1, 'Date and time is required'),
  notes: z.string().max(500).optional().or(z.literal('')),
  student_ids: z.array(z.string().uuid()).max(2, 'Maximum 2 students per session'),
})

export type SessionFormData = z.infer<typeof sessionSchema>

// Programme template validation
export const programmeTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  target_duration_minutes: z.number().min(1).max(180),
})

export type ProgrammeTemplateFormData = z.infer<typeof programmeTemplateSchema>

// Programme block validation
export const programmeBlockSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  exercise_type: z.enum(['warmup', 'strength', 'cardio', 'flexibility', 'cooldown', 'rest', 'other']).nullable(),
  duration_seconds: z.number().min(0).max(3600).nullable().optional(),
  sets: z.number().min(0).max(100).nullable().optional(),
  reps: z.string().max(20).optional().or(z.literal('')),
  rest_seconds: z.number().min(0).max(600).nullable().optional(),
  instructions: z.string().max(500).optional().or(z.literal('')),
})

export type ProgrammeBlockFormData = z.infer<typeof programmeBlockSchema>

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export type LoginFormData = z.infer<typeof loginSchema>

// Onboarding validation
export const onboardingSchema = z.object({
  organization_name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
})

export type OnboardingFormData = z.infer<typeof onboardingSchema>

// Signup validation
export const signupSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  organization_name: z.string().min(2, 'Business name must be at least 2 characters').max(100),
})

export type SignupFormData = z.infer<typeof signupSchema>
