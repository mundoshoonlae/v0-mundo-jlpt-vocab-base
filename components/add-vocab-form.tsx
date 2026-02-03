"use client"

import React from "react"

import { useState, useTransition, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { JLPTLevel } from "@/lib/types"

export function AddVocabForm({ onSuccess }: AddVocabFormProps) {
  const [isPending, startTransition] = useTransition()

  const [word, setWord] = useState("")
  const [level, setLevel] = useState<JLPTLevel | undefined>(undefined)
  const [bulkText, setBulkText] = useState("")
  const [notification, setNotification] = useState<Notification | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [word])

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleSingleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedWord = word.trim()
    if (!trimmedWord || isPending) return

    // Clear the input immediately for better UX
    setWord("")
    setNotification(null)

    startTransition(async () => {
      const result = await addVocab({ word: trimmedWord, level })

      if (result.success) {
        setNotification({
          type: "success",
          title: "Added Successfully",
          message: `"${trimmedWord}" has been added to your vocabulary list${level ? ` (${level})` : ''}.`
        })
        onSuccess()
      } else if (result.existing) {
        setNotification({
          type: "warning",
          title: "Duplicate Word",
          message: `"${trimmedWord}" is already in your vocabulary list.`
        })
      } else {
        setNotification({
          type: "error",
          title: "Cannot Add",
          message: result.message
        })
      }
    })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSingleSubmit()
    }
  }

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!bulkText.trim()) return

    setNotification(null)

    startTransition(async () => {
      const result = await addBulkVocab(bulkText, level)

      if (result.success > 0) {
        const parts: string[] = []
        parts.push(`${result.success} word${result.success > 1 ? 's' : ''} added`)
        if (result.skipped > 0) {
          parts.push(`${result.skipped} duplicate${result.skipped > 1 ? 's' : ''} skipped`)
        }

        setNotification({
          type: "success",
          title: "Import Complete",
          message: parts.join(', ')
        })
        setBulkText("")
        onSuccess()
      } else if (result.skipped > 0 && result.errors.length === 0) {
        setNotification({
          type: "warning",
          title: "No New Words",
          message: `All ${result.skipped} word${result.skipped > 1 ? 's are' : ' is'} already in your vocabulary list.`
        })
      } else if (result.errors.length > 0) {
        setNotification({
          type: "error",
          title: "Import Failed",
          message: result.errors.slice(0, 3).join(", ") + (result.errors.length > 3 ? "..." : "")
        })
      }
    })
  }

  const NotificationBanner = () => {
    if (!notification) return null

    const styles = {
      success: {
        bg: "bg-emerald-50 border-emerald-200",
        text: "text-emerald-800",
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
      },
      warning: {
        bg: "bg-amber-50 border-amber-200",
        text: "text-amber-800",
        icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
      },
      error: {
        bg: "bg-red-50 border-red-200",
        text: "text-red-800",
        icon: <XCircle className="w-5 h-5 text-red-600 shrink-0" />
      }
    }

    const style = styles[notification.type!]

    return (
      <div className={`flex items-start gap-3 p-3 rounded-lg border ${style.bg} animate-in fade-in slide-in-from-top-2 duration-200`}>
        {style.icon}
        <div className="flex-1 min-w-0">
          <p className={`font-medium text-sm ${style.text}`}>{notification.title}</p>
          <p className={`text-sm ${style.text} opacity-80 mt-0.5`}>{notification.message}</p>
        </div>
        <button
          type="button"
          onClick={() => setNotification(null)}
          className={`${style.text} opacity-60 hover:opacity-100 transition-opacity p-1`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    )
  }

  const LevelSelector = () => (
    <Select value={level || "no-level"} onValueChange={(val) => setLevel(val === "no-level" ? undefined : val as JLPTLevel)}>
      <SelectTrigger className="w-[140px] bg-white border-neutral-200">
        <SelectValue placeholder="JLPT Level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="no-level">No Level</SelectItem>
        <SelectItem value="N5">N5 (Easy)</SelectItem>
        <SelectItem value="N4">N4</SelectItem>
        <SelectItem value="N3">N3</SelectItem>
        <SelectItem value="N2">N2</SelectItem>
        <SelectItem value="N1">N1 (Hard)</SelectItem>
      </SelectContent>
    </Select>
  )

  return (
    <Card className="shadow-sm border-neutral-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg sm:text-xl text-neutral-900">Add Vocabulary</CardTitle>
          <div className="hidden sm:block">
            <LevelSelector />
          </div>
        </div>
        <CardDescription className="text-sm text-neutral-500">
          Type a Japanese word or bulk import multiple words
        </CardDescription>
        <div className="sm:hidden mt-2">
          <LevelSelector />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4 bg-neutral-100">
            <TabsTrigger value="single" className="text-sm data-[state=active]:bg-white data-[state=active]:text-neutral-900">Single Word</TabsTrigger>
            <TabsTrigger value="bulk" className="text-sm data-[state=active]:bg-white data-[state=active]:text-neutral-900">Bulk Import</TabsTrigger>
          </TabsList>

          <TabsContent value="single" className="space-y-3">
            <NotificationBanner />
            <form onSubmit={handleSingleSubmit}>
              <div className="relative flex items-end gap-2 p-2 bg-neutral-50 rounded-2xl border border-neutral-200 focus-within:border-neutral-400 focus-within:ring-1 focus-within:ring-neutral-400 transition-all">
                <textarea
                  ref={inputRef}
                  placeholder="Type Japanese word..."
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  className="flex-1 resize-none bg-transparent border-0 focus:outline-none focus:ring-0 text-lg px-3 py-2 min-h-[44px] max-h-[120px] text-neutral-900 placeholder:text-neutral-400"
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={isPending || !word.trim()}
                  className="shrink-0 h-10 w-10 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white disabled:bg-neutral-300 disabled:text-neutral-500 transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-2 px-1">
                Press Enter to add. Only Kanji, Hiragana, and Katakana accepted.
              </p>
            </form>
          </TabsContent>

          <TabsContent value="bulk" className="space-y-3">
            <NotificationBanner />
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk" className="text-sm font-medium text-neutral-700">
                  Paste words (one per line)
                </Label>
                <Textarea
                  id="bulk"
                  placeholder={"食べる\n飲む\n行く\n来る\nカタカナ\nひらがな"}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  className="min-h-[200px] text-lg leading-relaxed border-neutral-200 focus:border-neutral-400 focus:ring-neutral-400"
                />
                <p className="text-xs text-neutral-500">
                  Only Japanese characters accepted. Duplicates will be skipped automatically.
                </p>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full sm:w-auto bg-neutral-900 hover:bg-neutral-800 text-white"
              >
                {isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                Import Words
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
