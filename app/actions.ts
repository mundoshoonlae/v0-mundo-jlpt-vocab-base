"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Vocab, VocabInput } from "@/lib/types"

// Regex to detect Japanese characters (Hiragana, Katakana, Kanji)
const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\u3400-\u4DBF]/

function isJapanese(text: string): boolean {
  return japaneseRegex.test(text)
}

function cleanWord(word: string): string {
  return word.trim()
}

export async function getVocabList(): Promise<Vocab[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("vocabulary")
    .select("id, word, created_at")
    .order("created_at", { ascending: false })
  
  if (error) {
    console.error("Error fetching vocab:", error)
    return []
  }
  
  return data || []
}

export async function getVocabCount(): Promise<number> {
  const supabase = await createClient()
  
  const { count, error } = await supabase
    .from("vocabulary")
    .select("*", { count: "exact", head: true })
  
  if (error) {
    console.error("Error getting count:", error)
    return 0
  }
  
  return count || 0
}

export async function checkWordExists(word: string): Promise<Vocab | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("vocabulary")
    .select("id, word, created_at")
    .eq("word", cleanWord(word))
    .maybeSingle()
  
  if (error) {
    console.error("Error checking word:", error)
    return null
  }
  
  return data
}

export async function addVocab(input: VocabInput): Promise<{ success: boolean; message: string; existing?: Vocab }> {
  const word = cleanWord(input.word)
  
  if (!word) {
    return { success: false, message: "Word cannot be empty" }
  }
  
  if (!isJapanese(word)) {
    return { success: false, message: "Only Japanese characters (Kanji, Hiragana, Katakana) are accepted" }
  }
  
  const existing = await checkWordExists(word)
  if (existing) {
    return { success: false, message: `"${word}" already exists in the database`, existing }
  }
  
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("vocabulary")
    .insert({ word })
  
  if (error) {
    console.error("Error adding vocab:", error)
    return { success: false, message: "Failed to add vocabulary" }
  }
  
  revalidatePath("/")
  return { success: true, message: `Added "${word}" successfully` }
}

export async function addBulkVocab(text: string): Promise<{ success: number; skipped: number; errors: string[] }> {
  const lines = text.split("\n").map(line => cleanWord(line)).filter(line => line.length > 0)
  
  let success = 0
  let skipped = 0
  const errors: string[] = []
  
  for (const line of lines) {
    if (!isJapanese(line)) {
      errors.push(`"${line}" - Not Japanese`)
      skipped++
      continue
    }
    
    const result = await addVocab({ word: line })
    if (result.success) {
      success++
    } else {
      if (result.existing) {
        skipped++
      } else {
        errors.push(`"${line}" - ${result.message}`)
      }
    }
  }
  
  revalidatePath("/")
  return { success, skipped, errors }
}

export async function updateVocab(
  id: string, 
  input: VocabInput
): Promise<{ success: boolean; message: string }> {
  const word = cleanWord(input.word)
  
  if (!word) {
    return { success: false, message: "Word cannot be empty" }
  }
  
  if (!isJapanese(word)) {
    return { success: false, message: "Only Japanese characters are accepted" }
  }
  
  const supabase = await createClient()
  
  // Check if another word with same name exists (excluding current)
  const { data: existing } = await supabase
    .from("vocabulary")
    .select("id")
    .eq("word", word)
    .neq("id", id)
    .maybeSingle()
  
  if (existing) {
    return { success: false, message: `"${word}" already exists in the database` }
  }
  
  const { error } = await supabase
    .from("vocabulary")
    .update({ word })
    .eq("id", id)
  
  if (error) {
    console.error("Error updating vocab:", error)
    return { success: false, message: "Failed to update vocabulary" }
  }
  
  revalidatePath("/")
  return { success: true, message: `Updated "${word}" successfully` }
}

export async function deleteVocab(id: string): Promise<{ success: boolean; message: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from("vocabulary")
    .delete()
    .eq("id", id)
  
  if (error) {
    console.error("Error deleting vocab:", error)
    return { success: false, message: "Failed to delete vocabulary" }
  }
  
  revalidatePath("/")
  return { success: true, message: "Deleted successfully" }
}
