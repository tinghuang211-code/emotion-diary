import { EmotionType, EMOTION_COLORS, EMOTION_EMOJIS } from '@/types'

export function getEmotionGradient(emotions: Array<{ emotion_label: string; emotion_color: string }>) {
  if (!emotions || emotions.length === 0) return 'linear-gradient(90deg, #C8A2C8, #A0A0B0)'
  const colors = emotions.map(e => e.emotion_color)
  return `linear-gradient(90deg, ${colors.join(', ')})`
}

export function detectEmotionFromText(text: string): { label: EmotionType; color: string; emoji: string } {
  const happyWords = ['开心', '高兴', '快乐', '兴奋', '棒', '太好了', '喜欢', '爱', '幸福', '感谢']
  const sadWords = ['难过', '伤心', '失落', '低落', '哭', '遗憾', '可惜', '失望', '孤独']
  const angryWords = ['愤怒', '生气', '气', '烦', '讨厌', '受不了', '无语', '崩溃']
  const anxiousWords = ['焦虑', '担心', '紧张', '压力', '害怕', '不安', '慌', '迷茫']
  const thinkingWords = ['思考', '纠结', '不知道', '也许', '或许', '觉得', '感觉', '怀疑', '想到']
  const calmWords = ['平静', '满足', '平和', '安心', '轻松', '舒服', '放松', '踏实']

  const scores: Record<EmotionType, number> = {
    happy: 0, sad: 0, angry: 0, anxious: 0, thinking: 0, calm: 0, neutral: 0,
  }

  const lowerText = text.toLowerCase()
  happyWords.forEach(w => { if (lowerText.includes(w)) scores.happy++ })
  sadWords.forEach(w => { if (lowerText.includes(w)) scores.sad++ })
  angryWords.forEach(w => { if (lowerText.includes(w)) scores.angry++ })
  anxiousWords.forEach(w => { if (lowerText.includes(w)) scores.anxious++ })
  thinkingWords.forEach(w => { if (lowerText.includes(w)) scores.thinking++ })
  calmWords.forEach(w => { if (lowerText.includes(w)) scores.calm++ })

  const dominant = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b))[0] as EmotionType
  const label = scores[dominant] > 0 ? dominant : 'neutral'

  return {
    label,
    color: EMOTION_COLORS[label],
    emoji: EMOTION_EMOJIS[label],
  }
}
