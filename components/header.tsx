"use client"

import { BookOpen } from "lucide-react"

interface HeaderProps {
  vocabCount: number
}

export function Header({ vocabCount }: HeaderProps) {
  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-neutral-900 text-white">
              <BookOpen className="w-5 h-5 sm:w-5 sm:h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-neutral-900">
                Mundo JLPT Vocab Base
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500">
                Japanese vocabulary manager
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-neutral-100 rounded-xl px-4 py-2.5 self-start sm:self-auto">
            <span className="text-2xl sm:text-3xl font-bold text-neutral-900 tabular-nums">
              {vocabCount.toLocaleString()}
            </span>
            <span className="text-xs sm:text-sm text-neutral-500">
              words
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
