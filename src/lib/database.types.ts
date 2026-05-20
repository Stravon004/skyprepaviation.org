export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_tier: string
          subscription_expires_at: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          subscription_tier?: string
          subscription_expires_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          id: string
          certificate: string
          category: string
          subcategory: string | null
          question: string
          options: Json
          correct_answer: number
          explanation: string
          created_at: string
        }
        Insert: {
          id?: string
          certificate: string
          category: string
          subcategory?: string | null
          question: string
          options: Json
          correct_answer: number
          explanation: string
          created_at?: string
        }
        Update: {
          id?: string
          certificate?: string
          category?: string
          subcategory?: string | null
          question?: string
          options?: Json
          correct_answer?: number
          explanation?: string
          created_at?: string
        }
        Relationships: []
      }
      exam_sessions: {
        Row: {
          id: string
          user_id: string
          certificate: string
          total_questions: number
          correct_answers: number
          time_taken_seconds: number | null
          question_results: Json
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          certificate: string
          total_questions: number
          correct_answers: number
          time_taken_seconds?: number | null
          question_results: Json
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          certificate?: string
          total_questions?: number
          correct_answers?: number
          time_taken_seconds?: number | null
          question_results?: Json
          completed_at?: string
        }
        Relationships: []
      }
      flashcard_progress: {
        Row: {
          id: string
          user_id: string
          question_id: string
          ease_factor: number
          interval_days: number
          repetitions: number
          next_review_at: string
          last_reviewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string
          last_reviewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_at?: string
          last_reviewed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
