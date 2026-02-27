import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key를 .env 파일에 설정해주세요!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 타입 정의
export interface Profile {
  id: string
  email: string
}

export interface Progress {
  id: string
  user_id: string
  challenge_id: string
  solved: boolean
  hints_used: number
  solve_time: string | null
  created_at: string
}

export interface Submission {
  id: string
  user_id: string
  challenge_id: string
  flag: string
  is_correct: boolean
  submitted_at: string
}

export interface LeaderboardEntry {
  user_id: string
  email: string
  nickname: string | null 
  solved_count: number
  total_points: number
  last_solve_time: string | null
}