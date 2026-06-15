export type EmotionType = 'happy' | 'angry' | 'sad' | 'thinking' | 'calm' | 'anxious' | 'neutral'

export interface EmotionResult {
  type: EmotionType
  color: string
  label: string
  emoji: string
  score: number
}

export const EMOTION_COLORS: Record<EmotionType, string> = {
  happy: '#FFD700',
  angry: '#FF6B6B',
  sad: '#6B9FD4',
  thinking: '#C8A2C8',
  calm: '#98D8C8',
  anxious: '#FFA500',
  neutral: '#C8A2C8',
}

export const EMOTION_LABELS: Record<EmotionType, string> = {
  happy: '开心愉悦',
  angry: '激动愤怒',
  sad: '低落忧郁',
  thinking: '思考迷茫',
  calm: '平静满足',
  anxious: '焦虑紧张',
  neutral: '平静如水',
}

export const EMOTION_EMOJIS: Record<EmotionType, string> = {
  happy: '🌟',
  angry: '🔥',
  sad: '🌧️',
  thinking: '🔮',
  calm: '🍃',
  anxious: '⚡',
  neutral: '✨',
}

export function detectEmotionFromKeywords(text: string): EmotionResult {
  const lower = text.toLowerCase()

  const patterns: Record<EmotionType, string[]> = {
    happy: ['开心', '快乐', '高兴', '喜欢', '爱', '棒', '好', '哈哈', '😊', '😄', '兴奋', '激动', '感谢', '谢谢', '幸福'],
    angry: ['愤怒', '生气', '讨厌', '烦', '恨', '气死', '滚', '操', '妈的', '为什么', '不公', '冲突', '吵'],
    sad: ['难过', '伤心', '哭', '悲', '失落', '绝望', '孤独', '寂寞', '想念', '思念', '失去', '离开', '痛'],
    thinking: ['想', '思考', '不知道', '迷茫', '困惑', '为什么', '怎么', '如果', '也许', '可能', '应该', '纠结'],
    calm: ['平静', '安心', '放松', '舒服', '自在', '满足', '满意', '宁静', '安静', '慢慢', '轻松'],
    anxious: ['焦虑', '担心', '紧张', '害怕', '恐惧', '压力', '怕', '不安', '慌', '急', '怎么办'],
    neutral: [],
  }

  const scores: Record<EmotionType, number> = {
    happy: 0, angry: 0, sad: 0, thinking: 0, calm: 0, anxious: 0, neutral: 0,
  }

  for (const [emotion, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      const count = (lower.match(new RegExp(keyword, 'g')) || []).length
      scores[emotion as EmotionType] += count
    }
  }

  let maxScore = 0
  let dominantEmotion: EmotionType = 'neutral'

  for (const [emotion, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score
      dominantEmotion = emotion as EmotionType
    }
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0)
  const normalizedScore = totalScore > 0 ? maxScore / totalScore : 0.5

  return {
    type: dominantEmotion,
    color: EMOTION_COLORS[dominantEmotion],
    label: EMOTION_LABELS[dominantEmotion],
    emoji: EMOTION_EMOJIS[dominantEmotion],
    score: normalizedScore,
  }
}

export function getEmotionGradient(emotion: EmotionType): string {
  const color = EMOTION_COLORS[emotion]
  return `linear-gradient(135deg, ${color}33 0%, ${color}11 100%)`
}
