"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileDown, Loader2 } from "lucide-react"
import { getVocabList, getAllVocab } from "@/app/actions"
import type { Vocab } from "@/lib/types"

export function VocabExport() {
    const [isPending, startTransition] = useTransition()

    const handleExport = (type: "csv" | "md") => {
        startTransition(async () => {
            // Fetch all vocab (words only) using the new unlimited action
            const vocabList = await getAllVocab()

            if (!vocabList || vocabList.length === 0) {
                alert("No vocabulary to export")
                return
            }

            let content = ""
            let filename = `mundo-vocab-export-${new Date().toISOString().slice(0, 10)}`
            let mimeType = ""

            if (type === "csv") {
                // CSV Header - user requested "vocab only", so maybe just the word column?
                // Or "word" as header. Let's do a simple header.
                content = "word\n"
                // CSV Body
                content += vocabList.map(word => {
                    // Escape quotes if needed
                    return word.includes('"') ? `"${word.replace(/"/g, '""')}"` : word
                }).join("\n")

                filename += ".csv"
                mimeType = "text/csv;charset=utf-8;"
            } else {
                // Markdown
                content = "# Mundo JLPT Vocabulary Export\n\n"
                content += `Exported on: ${new Date().toLocaleDateString()}\n`
                content += `Total words: ${vocabList.length}\n\n`
                // Simple list or table? "vocab and vocab only" implies minimal metadata.
                // A simple list might be cleaner, but a table is standard.
                // Let's do a simple list as requested.
                content += vocabList.map(word => `- ${word}`).join("\n")

                filename += ".md"
                mimeType = "text/markdown;charset=utf-8;"
            }

            // Create download link
            const blob = new Blob([content], { type: mimeType })
            const url = URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.setAttribute("href", url)
            link.setAttribute("download", filename)
            link.style.visibility = "hidden"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        })
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleExport("csv")}
                className="text-xs h-8"
            >
                {isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <FileDown className="w-3 h-3 mr-2" />}
                Export CSV
            </Button>
            <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleExport("md")}
                className="text-xs h-8"
            >
                {isPending ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <Download className="w-3 h-3 mr-2" />}
                Export MD
            </Button>
        </div>
    )
}
