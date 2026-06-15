export type EmotionType = 'happy' | 'angry' | 'sad' | 'thinking' | 'calm' | 'anxious' | 'neutral'

export interface EmotionResult {
  type: EmotionType
  color: string
  label: string
  emoji: string
  score: number
}

export interface DiaryEntry {
  id: string
  user_id: string
  title: string | null
  content: string
  emotion_color: string
  emotion_label: string
  emotion_score: number
  summaries: MomoSummary[]
  soul_card: string | null
  cover_image_url: string | null
  is_sealed: boolean
  sealed_until: string | null
  created_at: string
  updated_at: string
  connections?: MemoryConnection[]
}

export interface MomoSummary {
  summary: string
  thinking_style: string
  core_insight: string
  emotion_emoji: string
  keywords: string[]
  emotion: EmotionResult
  timestamp: string
  content_length: number
}

export interface MemoryConnection {
  id?: string
  diary_id: string
  connected_diary_id?: string
  title?: string | null
  content_preview?: string
  created_at: string
  emotion_label?: string
  connection_type: string
  strength: number
  description: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface NianLunResult {
  connections: MemoryConnection[]
  theme_evolution: string
  insights: string
}

export interface StarData {
  id: string
  x: number
  y: number
  size: number
  color: string
  opacity: number
  diary: DiaryEntry
  connections: string[]
}

export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
}
