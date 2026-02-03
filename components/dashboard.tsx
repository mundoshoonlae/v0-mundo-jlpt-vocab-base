"use client"

import { useCallback } from "react"
import useSWR from "swr"
import { Header } from "@/components/header"
import { AddVocabForm } from "@/components/add-vocab-form"
import { VocabList } from "@/components/vocab-list"
import { getVocabList, getVocabCount } from "@/app/actions"
import type { Vocab } from "@/lib/types"

interface DashboardProps {
  initialVocabList: Vocab[]
  initialCount: number
}

export function Dashboard({ initialVocabList, initialCount }: DashboardProps) {
  const { data: vocabList = initialVocabList, mutate: mutateList } = useSWR(
    "vocab-list",
    getVocabList,
    { fallbackData: initialVocabList }
  )

  const { data: vocabCount = initialCount, mutate: mutateCount } = useSWR(
    "vocab-count",
    getVocabCount,
    { fallbackData: initialCount }
  )

  const refreshData = useCallback(() => {
    mutateList()
    mutateCount()
  }, [mutateList, mutateCount])

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header vocabCount={vocabCount} />

      <main className="container mx-auto px-4 py-6 sm:py-8">
        {/* Level Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
          {["All", "N5", "N4", "N3", "N2", "N1"].map((level) => {
            const count = level === "All"
              ? vocabList.length
              : vocabList.filter(v => v.level === level).length

            return (
              <div key={level} className="bg-white rounded-lg border border-neutral-200 p-3 text-center shadow-sm">
                <div className="text-xs font-medium text-neutral-500 uppercase">{level}</div>
                <div className="text-xl font-bold text-neutral-900">{count}</div>
              </div>
            )
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <AddVocabForm onSuccess={refreshData} />
          </div>
          <div>
            <VocabList vocabList={vocabList} onUpdate={refreshData} />
          </div>
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-neutral-500">
          <p>Mundo JLPT Vocab Base</p>
        </div>
      </footer>
    </div>
  )
}
