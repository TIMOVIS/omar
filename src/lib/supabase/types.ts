export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          organization_id: string | null
          role: 'trainer' | 'student' | 'admin'
          full_name: string
          email: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          organization_id?: string | null
          role: 'trainer' | 'student' | 'admin'
          full_name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          role?: 'trainer' | 'student' | 'admin'
          full_name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      students: {
        Row: {
          id: string
          profile_id: string | null
          organization_id: string
          full_name: string
          email: string | null
          phone: string | null
          notes: string | null
          constraints_injuries: string | null
          goals: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          organization_id: string
          full_name: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          constraints_injuries?: string | null
          goals?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          organization_id?: string
          full_name?: string
          email?: string | null
          phone?: string | null
          notes?: string | null
          constraints_injuries?: string | null
          goals?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          organization_id: string
          name: string
          address: string | null
          location_type: 'indoor' | 'outdoor'
          latitude: number | null
          longitude: number | null
          meeting_point: string | null
          equipment_notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          address?: string | null
          location_type: 'indoor' | 'outdoor'
          latitude?: number | null
          longitude?: number | null
          meeting_point?: string | null
          equipment_notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          address?: string | null
          location_type?: 'indoor' | 'outdoor'
          latitude?: number | null
          longitude?: number | null
          meeting_point?: string | null
          equipment_notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      programme_templates: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          target_duration_minutes: number
          created_by: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          target_duration_minutes?: number
          created_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          target_duration_minutes?: number
          created_by?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      programme_blocks: {
        Row: {
          id: string
          programme_template_id: string
          order_index: number
          name: string
          exercise_type: 'warmup' | 'strength' | 'cardio' | 'flexibility' | 'cooldown' | 'rest' | 'other' | null
          duration_seconds: number | null
          sets: number | null
          reps: string | null
          rest_seconds: number | null
          instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          programme_template_id: string
          order_index: number
          name: string
          exercise_type?: 'warmup' | 'strength' | 'cardio' | 'flexibility' | 'cooldown' | 'rest' | 'other' | null
          duration_seconds?: number | null
          sets?: number | null
          reps?: string | null
          rest_seconds?: number | null
          instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          programme_template_id?: string
          order_index?: number
          name?: string
          exercise_type?: 'warmup' | 'strength' | 'cardio' | 'flexibility' | 'cooldown' | 'rest' | 'other' | null
          duration_seconds?: number | null
          sets?: number | null
          reps?: string | null
          rest_seconds?: number | null
          instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      recurrence_rules: {
        Row: {
          id: string
          organization_id: string
          trainer_id: string
          location_id: string | null
          day_of_week: number
          start_time: string
          programme_template_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          trainer_id: string
          location_id?: string | null
          day_of_week: number
          start_time: string
          programme_template_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          trainer_id?: string
          location_id?: string | null
          day_of_week?: number
          start_time?: string
          programme_template_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      recurrence_rule_students: {
        Row: {
          id: string
          recurrence_rule_id: string
          student_id: string
          individual_focus: string | null
          created_at: string
        }
        Insert: {
          id?: string
          recurrence_rule_id: string
          student_id: string
          individual_focus?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          recurrence_rule_id?: string
          student_id?: string
          individual_focus?: string | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          organization_id: string
          trainer_id: string
          location_id: string | null
          recurrence_rule_id: string | null
          starts_at: string
          duration_minutes: number
          status: 'scheduled' | 'completed' | 'cancelled'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          trainer_id: string
          location_id?: string | null
          recurrence_rule_id?: string | null
          starts_at: string
          duration_minutes?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          trainer_id?: string
          location_id?: string | null
          recurrence_rule_id?: string | null
          starts_at?: string
          duration_minutes?: number
          status?: 'scheduled' | 'completed' | 'cancelled'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      session_students: {
        Row: {
          id: string
          session_id: string
          student_id: string
          individual_focus: string | null
          attendance: 'pending' | 'attended' | 'no_show' | 'cancelled' | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          student_id: string
          individual_focus?: string | null
          attendance?: 'pending' | 'attended' | 'no_show' | 'cancelled' | null
          created_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          student_id?: string
          individual_focus?: string | null
          attendance?: 'pending' | 'attended' | 'no_show' | 'cancelled' | null
          created_at?: string
        }
      }
      session_programmes: {
        Row: {
          id: string
          session_id: string
          programme_template_id: string | null
          name: string
          blocks: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id: string
          programme_template_id?: string | null
          name: string
          blocks?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          session_id?: string
          programme_template_id?: string | null
          name?: string
          blocks?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_organization_id: {
        Args: Record<string, never>
        Returns: string
      }
      is_trainer_or_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_user_student_id: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Convenience types
export type Organization = Database['public']['Tables']['organizations']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Student = Database['public']['Tables']['students']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type ProgrammeTemplate = Database['public']['Tables']['programme_templates']['Row']
export type ProgrammeBlock = Database['public']['Tables']['programme_blocks']['Row']
export type RecurrenceRule = Database['public']['Tables']['recurrence_rules']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionStudent = Database['public']['Tables']['session_students']['Row']
export type SessionProgramme = Database['public']['Tables']['session_programmes']['Row']

// Extended types with relations
export type SessionWithRelations = Session & {
  location: Location | null
  session_students: (SessionStudent & { student: Student })[]
  session_programmes: SessionProgramme | null
  trainer: Profile
}

export type StudentWithSessions = Student & {
  upcoming_sessions?: SessionWithRelations[]
}

export type ProgrammeTemplateWithBlocks = ProgrammeTemplate & {
  programme_blocks: ProgrammeBlock[]
}

// Programme block type for JSONB
export type ProgrammeBlockData = {
  id: string
  order_index: number
  name: string
  exercise_type: ProgrammeBlock['exercise_type']
  duration_seconds: number | null
  sets: number | null
  reps: string | null
  rest_seconds: number | null
  instructions: string | null
}
