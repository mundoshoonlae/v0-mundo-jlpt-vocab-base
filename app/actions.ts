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
  // 1. Pre-process all inputs: clean, validate, and deduplicate
  const rawLines = text.split("\n").map(line => cleanWord(line)).filter(line => line.length > 0)

  const validWords = new Set<string>()
  const errors: string[] = []
  let skipped = 0 // Tracks duplicates within the input itself

  for (const line of rawLines) {
    if (!isJapanese(line)) {
      errors.push(`"${line}" - Not Japanese`)
      continue
    }
    if (validWords.has(line)) {
      skipped++
    } else {
      validWords.add(line)
    }
  }

  // Convert Set to Array for batch processing
  const uniqueWords = Array.from(validWords)
  let success = 0
  const BATCH_SIZE = 500

  const supabase = await createClient()

  // 2. Process in batches
  for (let i = 0; i < uniqueWords.length; i += BATCH_SIZE) {
    const batch = uniqueWords.slice(i, i + BATCH_SIZE)

    // Step A: Find which words in this batch already exist in DB
    const { data: existingRows, error: checkError } = await supabase
      .from("vocabulary")
      .select("word")
      .in("word", batch)

    if (checkError) {
      console.error("Error checking batch existing:", checkError)
      errors.push(`Batch ${i}-${i + batch.length}: Failed to check duplicates`)
      continue
    }

    const existingWordsSet = new Set(existingRows?.map(r => r.word) || [])

    // Step B: Filter out existing words
    const newWords = batch.filter(word => !existingWordsSet.has(word))
    skipped += existingWordsSet.size

    if (newWords.length === 0) {
      continue
    }

    // Step C: Bulk Insert new words
    const { error: insertError } = await supabase
      .from("vocabulary")
      .insert(newWords.map(word => ({ word })))

    if (insertError) {
      console.error("Error inserting batch:", insertError)
      // If a bulk insert fails, we might want to flag the whole batch or fallback
      errors.push(`Batch insert failed for ${newWords.length} words`)
    } else {
      success += newWords.length
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
