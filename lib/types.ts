export type JLPTLevel = "N1" | "N2" | "N3" | "N4" | "N5" | "Unclassified"

export interface Vocab {
  id: string
  word: string
  level?: JLPTLevel
  created_at: string
}

export interface VocabInput {
  word: string
  level?: JLPTLevel
}
