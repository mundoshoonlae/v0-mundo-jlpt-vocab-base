"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header Skeleton */}
      <header className="border-b border-neutral-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-neutral-900 text-white">
                <BookOpen className="w-5 h-5" />
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
              <Skeleton className="h-8 w-12 bg-neutral-200" />
              <span className="text-xs sm:text-sm text-neutral-500">words</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {/* Add Form Skeleton */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <Card className="shadow-sm border-neutral-200">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-36 bg-neutral-200" />
                <Skeleton className="h-4 w-56 mt-2 bg-neutral-200" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full bg-neutral-200" />
                <Skeleton className="h-14 w-full bg-neutral-200" />
                <Skeleton className="h-10 w-28 bg-neutral-200" />
              </CardContent>
            </Card>
          </div>

          {/* Vocab List Skeleton */}
          <div>
            <Card className="shadow-sm border-neutral-200">
              <CardHeader className="pb-4">
                <Skeleton className="h-6 w-36 bg-neutral-200" />
                <Skeleton className="h-4 w-24 mt-2 bg-neutral-200" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full bg-neutral-200" />
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-xl bg-neutral-100" />
                  ))}
                </div>
              </CardContent>
            </Card>
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
