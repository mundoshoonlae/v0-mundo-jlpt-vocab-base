"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Download, FileDown, Loader2 } from "lucide-react"
import { getVocabList } from "@/app/actions"
import type { Vocab } from "@/lib/types"

export function VocabExport() {
    const [isPending, startTransition] = useTransition()

    const handleExport = (type: "csv" | "md") => {
        startTransition(async () => {
            // Fetch all vocab
            // Note: In a real large app we might want a specific 'export' server action that streams,
            // but for ~7k items, fetching the JSON array is fine.
            const vocabList = await getVocabList()

            if (!vocabList || vocabList.length === 0) {
                alert("No vocabulary to export")
                return
            }

            let content = ""
            let filename = `mundo-vocab-export-${new Date().toISOString().slice(0, 10)}`
            let mimeType = ""

            if (type === "csv") {
                // CSV Header
                content = "word,created_at\n"
                // CSV Body
                content += vocabList.map(v => {
                    // Escape quotes if needed, though simple Japanese words usually don't have them
                    const escapedWord = v.word.includes('"') ? `"${v.word.replace(/"/g, '""')}"` : v.word
                    return `${escapedWord},${v.created_at}`
                }).join("\n")

                filename += ".csv"
                mimeType = "text/csv;charset=utf-8;"
            } else {
                // Markdown
                content = "# Mundo JLPT Vocabulary Export\n\n"
                content += `Exported on: ${new Date().toLocaleDateString()}\n`
                content += `Total words: ${vocabList.length}\n\n`
                content += "| Word | Added Date |\n"
                content += "|---|---|\n"
                content += vocabList.map(v => {
                    return `| ${v.word} | ${new Date(v.created_at).toLocaleDateString()} |`
                }).join("\n")

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
