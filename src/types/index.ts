export interface Profile {
  id: string
  username: string | null
  avatar_url: string | null
  created_at: string
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
  tags?: string[]
  memory_connections?: MemoryConnection[]
}

export interface MomoSummary {
  id: string
  chunk_index: number
  content_summary: string
  thinking_style: string
  core_insight: string
  emotion_color: string
  emotion_emoji: string
  emotion_label: string
  created_at: string
}

export interface MemoryConnection {
  id: string
  diary_id: string
  connected_diary_id: string
  connection_type: 'theme' | 'emotion' | 'person' | 'insight'
  strength: number
  description: string
  created_at: string
  connected_diary?: DiaryEntry
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface SoulCard {
  core_insight: string
  hidden_feeling: string
  question_for_future: string
  color: string
  emoji: string
}

export type EmotionType = 'happy' | 'angry' | 'sad' | 'thinking' | 'calm' | 'anxious' | 'neutral'

export const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#FFD700',
  angry: '#FF6B6B',
  sad: '#6B9FD4',
  thinking: '#C8A2C8',
  calm: '#98D8C8',
  anxious: '#FFA500',
  neutral: '#A0A0B0',
}

export const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: '😊',
  angry: '😤',
  sad: '😢',
  thinking: '🤔',
  calm: '😌',
  anxious: '😰',
  neutral: '😐',
}

export const EMOTION_LABELS: Record<EmotionType, string> = {
  happy: '开心/兴奋',
  angry: '愤怒/激动',
  sad: '低落/忧伤',
  thinking: '思考/纠结',
  calm: '平静/满足',
  anxious: '焦虑/紧张',
  neutral: '平静',
}
